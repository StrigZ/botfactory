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
  createNode: protectedProcedure
    .input(
      z.object({
        workflowId: z.string().min(1),
        name: z.string().min(1),
        position: z.object({ x: z.number(), y: z.number() }),
        type: z.enum(nodeTypeEnum.enumValues),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.insert(workflowNodes).values({
        position: input.position,
        type: input.type,
        workflowId: input.workflowId,
        name: input.name,
      }),
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

      await ctx.db.transaction(async (tx) => {
        await tx
          .delete(workflowEdges)
          .where(eq(workflowEdges.workflowId, input.id));

        await tx
          .delete(workflowNodes)
          .where(eq(workflowNodes.workflowId, input.id));

        if (input.nodes.length) {
          await tx.insert(workflowNodes).values(
            input.nodes.map((node) => ({
              workflowId: input.id,
              name: node.name,
              position: node.position,
              type: node.type,
              data: node.data,
            })),
          );
        }
        if (input.edges.length) {
          await tx.insert(workflowEdges).values(
            input.edges.map((edge) => ({
              sourceId: edge.sourceId,
              targetId: edge.targetId,
              workflowId: input.id,
            })),
          );
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
