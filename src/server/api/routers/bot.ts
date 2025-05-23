import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { BotDeploymentService } from '~/lib/telegram/bot-deployment';
import { BotService } from '~/lib/telegram/bot-service';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { bots } from '~/server/db/schema';

export const botRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const response = await BotService.getMe(input.token);

      if (!response.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            response.error instanceof Error
              ? response.error.message
              : 'Unknown Error.',
          cause: response.error,
        });
      }

      // Save new bot entry to DB
      const [bot] = await ctx.db
        .insert(bots)
        .values({
          name: input.name,
          token: input.token,
          createdById: ctx.session.user.id,
          status: 'draft',
        })
        .returning();

      return bot;
    }),
  deploy: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if bot exists and user owns it
      const botData = await ctx.db.query.bots.findFirst({
        where: ({ id, createdById }, { eq, and }) =>
          and(eq(id, input.id), eq(createdById, ctx.session.user.id)),
      });

      if (!botData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bot does not exist.',
        });
      }

      if (botData.status === 'published') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bot is already deployed.',
        });
      }

      const botDeploymentService = new BotDeploymentService(botData.token);
      const result = await botDeploymentService.deployBot(botData.id);

      if (!result?.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result?.error,
        });
      }

      return result.webhookUrl;
    }),
  undeploy: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if bot exists
      const botData = await ctx.db.query.bots.findFirst({
        where: ({ id, createdById }, { eq, and }) =>
          and(eq(id, input.id), eq(createdById, ctx.session.user.id)),
      });

      if (!botData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bot with this id does not exist',
        });
      }

      if (botData.status === 'paused') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bot is already paused.',
        });
      }

      // remove webhook
      const botDeploymentService = new BotDeploymentService(botData.token);
      const result = await botDeploymentService.undeployBot(botData.id);

      if (!result?.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result?.error,
        });
      }

      return result;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) =>
    ctx.db.query.bots.findMany({
      where({ createdById }, { eq }) {
        return eq(createdById, ctx.session.user.id);
      },
    }),
  ),
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1), withComponents: z.boolean() }))
    .query(async ({ ctx, input }) =>
      ctx.db.query.bots.findFirst({
        where({ id, createdById }, { eq, and }) {
          return and(eq(createdById, ctx.session.user.id), eq(id, input.id));
        },
        with: {
          botComponents: {
            orderBy: (components) => [components.order],
          },
        },
      }),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        token: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db
        .update(bots)
        .set({ name: input.name, token: input.token })
        .where(
          and(eq(bots.id, input.id), eq(bots.createdById, ctx.session.user.id)),
        ),
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(bots)
        .where(
          and(eq(bots.createdById, ctx.session.user.id), eq(bots.id, input.id)),
        );
    }),
});
