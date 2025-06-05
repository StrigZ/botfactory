import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import {
  botWorkflows,
  edgeInsertSchema,
  nodeInsertSchema,
  nodeTypeEnum,
  workflowEdges,
  workflowNodes,
} from '~/server/db/schema';

export const workflowRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.insert(botWorkflows).values({ name: input.name }),
    ),
  createEdge: protectedProcedure
    .input(
      z.object({
        workflowId: z.string().min(1),
        sourceId: z.string().min(1),
        targetId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.insert(workflowEdges).values({
        sourceId: input.sourceId,
        targetId: input.targetId,
        workflowId: input.workflowId,
      }),
    ),
  getByBotId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const botData = await ctx.db.query.bots.findFirst({
        where({ id, createdById }, { eq, and }) {
          return and(eq(createdById, ctx.session.user.id), eq(id, input.id));
        },
        with: { botWorkflowsToBots: true },
      });

      if (!botData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bot with this id does not exist',
        });
      }

      const workflowData = await ctx.db.query.botWorkflows.findFirst({
        where({ id }, { eq }) {
          return eq(id, botData.botWorkflowsToBots.botWorkflowId);
        },
        with: { workflowEdges: true, workflowNodes: true },
      });

      if (!workflowData) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bot is not properly configured.',
        });
      }

      return workflowData;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        nodes: z.array(nodeInsertSchema),
        edges: z.array(edgeInsertSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workflow = await ctx.db.query.botWorkflows.findFirst({
        where: ({ id }, { eq }) => eq(id, input.id),
        with: { workflowNodes: true, workflowEdges: true },
      });

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow with this ID does not exists.',
        });
      }

      const flowIdToDbIdMap = new Map<string, string>();

      await ctx.db.transaction(async (tx) => {
        await tx
          .delete(workflowEdges)
          .where(eq(workflowEdges.workflowId, input.id));

        await tx
          .delete(workflowNodes)
          .where(eq(workflowNodes.workflowId, input.id));

        if (input.nodes.length) {
          // Create and return new nodes in DB
          const insertedNodes = await tx
            .insert(workflowNodes)
            .values(
              input.nodes.map((inputNode) => {
                return {
                  flowId: inputNode.flowId,
                  workflowId: input.id,
                  name: inputNode.name,
                  position: inputNode.position,
                  type: inputNode.type,
                  data: inputNode.data,
                };
              }),
            )
            .returning();

          // Save each node's flow id and db id in the map
          insertedNodes.forEach((dbNode) =>
            flowIdToDbIdMap.set(dbNode.flowId, dbNode.id),
          );
        }

        if (input.edges.length) {
          const validEdges = input.edges
            .map((inputEdge) => {
              // Get node's db id by flow id from the map
              const sourceId = flowIdToDbIdMap.get(inputEdge.sourceId);
              const targetId = flowIdToDbIdMap.get(inputEdge.targetId);

              return sourceId && targetId
                ? {
                    sourceId,
                    targetId,
                    workflowId: input.id,
                  }
                : null;
            })
            .filter((edge): edge is NonNullable<typeof edge> => edge !== null);

          await tx.insert(workflowEdges).values(validEdges);
        }
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(botWorkflows)
        .where(and(eq(botWorkflows.id, input.id)));
    }),
});
