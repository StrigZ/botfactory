import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { bots } from '~/server/db/schema';

export const botRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [bot] = await ctx.db
        .insert(bots)
        .values({
          name: input.name,
          token: input.token,
          createdById: ctx.session.user.id,
        })
        .returning();

      return bot;
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
