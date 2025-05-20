import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { Bot } from 'grammy';
import { z } from 'zod';

import { env } from '~/env';
import { setBotInstance, stopBotInstance } from '~/lib/dev-bot';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { bots } from '~/server/db/schema';

type GetMeResponse = {
  ok: true;
  result: {
    id: number;
    first_name: string;
    username: string;
  };
};

type SetWebhookResponse = {
  ok: true;
  result: boolean;
  description: string;
};

type ErrorResponse = {
  ok: false;
  error_code: number;
  description: string;
};

export const botRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Send a request to /getMe telegram API method to check
      // if the token is valid

      const getMeFetch = await fetch(
        `https://api.telegram.org/bot${input.token}/getMe`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
          },
        },
      );

      if (!getMeFetch.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during token validation.',
          cause: getMeFetch.statusText,
        });
      }

      const getMeResponse = (await getMeFetch.json()) as
        | GetMeResponse
        | ErrorResponse;

      if (!getMeResponse.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during token validation.',
          cause: getMeResponse.description,
        });
      }

      // Save new bot entry to DB
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
          message: 'Bot with this id does not exist',
        });
      }

      if (botData.isDeployed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bot is already deployed.',
        });
      }

      // setup a webhook
      if (env.NODE_ENV === 'production') {
        // const setWebhookFetch = await fetch(
        //   `https://api.telegram.org/bot${bot.token}/setWebhook`,
        //   {
        //     method: 'POST',
        //     headers: {
        //       accept: 'application/json',
        //       'content-type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       url: `${env.VERCEL_URL}/api/telegram/webhook/${bot?.id}`,
        //       certificate: 'Optional',
        //     }),
        //   },
        // );
        // if (!setWebhookFetch.ok) {
        //   throw new TRPCError({
        //     code: 'INTERNAL_SERVER_ERROR',
        //     message: 'An error occurred during webhook setup.',
        //   });
        // }
        // const setWebhookResponse = (await setWebhookFetch.json()) as
        //   | SetWebhookResponse
        //   | ErrorResponse;

        // if (!setWebhookResponse.ok) {
        //   throw new TRPCError({
        //     code: 'INTERNAL_SERVER_ERROR',
        //     message: 'An error occurred during webhook setup.',
        //     cause: setWebhookResponse.description,
        //   });
        // }

        const bot = new Bot(botData.token);
        await bot.api.setWebhook(
          `${env.VERCEL_URL}/api/telegram/webhook/${botData.id}?x-vercel-protection-bypass=${env.VERCEL_AUTOMATION_BYPASS_SECRET}`,
        );

        // Update webhook url in db
        await ctx.db
          .update(bots)
          .set({
            webhookUrl: (await bot.api.getWebhookInfo()).url,
            isDeployed: true,
          })
          .where(
            and(
              eq(bots.id, botData?.id),
              eq(bots.createdById, ctx.session.user.id),
            ),
          );
      } else if (env.NODE_ENV === 'development') {
        const devBotInstance = new Bot(botData.token, {}); // <-- put your bot token between the ""

        // Handle the /start command.
        devBotInstance.command('start', (ctx) =>
          ctx.reply('Welcome! Up and running.'),
        );
        // Handle other messages.
        devBotInstance.on('message', (ctx) =>
          ctx.reply('Got another message!'),
        );

        setBotInstance(devBotInstance);
        void devBotInstance.start();

        await ctx.db
          .update(bots)
          .set({ isDeployed: true })
          .where(eq(bots.id, botData?.id));
      }
    }),
  pause: protectedProcedure
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

      if (!botData.isDeployed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bot is already paused.',
        });
      }

      // remove webhook
      if (env.NODE_ENV === 'production') {
        // const removeWebhookFetch = await fetch(
        //   `https://api.telegram.org/bot${bot.token}/setWebhook?remove=`,
        //   {
        //     method: 'POST',
        //     headers: {
        //       accept: 'application/json',
        //       'content-type': 'application/json',
        //     },
        //     body: JSON.stringify({ url: 'Empty' }),
        //   },
        // );
        // if (!removeWebhookFetch.ok) {
        //   throw new TRPCError({
        //     code: 'INTERNAL_SERVER_ERROR',
        //     message: 'An error occurred during webhook removing.',
        //   });
        // }
        // const setWebhookResponse = (await removeWebhookFetch.json()) as
        //   | SetWebhookResponse
        //   | ErrorResponse;

        // if (!setWebhookResponse.ok) {
        //   throw new TRPCError({
        //     code: 'INTERNAL_SERVER_ERROR',
        //     message: 'An error occurred during webhook removing.',
        //     cause: setWebhookResponse.description,
        //   });
        // }
        const bot = new Bot(botData.token);
        await bot.api.deleteWebhook();
      } else if (env.NODE_ENV === 'development') {
        void stopBotInstance();
      }
      // Update webhook url in db
      await ctx.db
        .update(bots)
        .set({ webhookUrl: null, isDeployed: false })
        .where(
          and(
            eq(bots.id, botData?.id),
            eq(bots.createdById, ctx.session.user.id),
          ),
        );
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
