import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "pnpm/server/api/trpc";

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const [profile, weightEntries] = await Promise.all([
      ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      }),
      ctx.db.weightEntry.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { date: "desc" },
        take: 10,
      }),
    ]);
    return { profile, weightEntries };
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        age: z.number().int().min(0).max(120).nullable(),
        phone: z.string().nullable(),
        objective: z.string().nullable(),
        height: z.number().min(50).max(250).nullable(),
        weight: z.number().min(20).max(300).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, ...profileData } = input;

      if (name) {
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { name },
        });
      }

      return ctx.db.userProfile.upsert({
        where: { userId: ctx.session.user.id },
        update: profileData,
        create: { userId: ctx.session.user.id, ...profileData },
      });
    }),

  addWeight: protectedProcedure
    .input(z.object({ weight: z.number().min(20).max(300) }))
    .mutation(({ ctx, input }) =>
      ctx.db.weightEntry.create({
        data: { userId: ctx.session.user.id, weight: input.weight },
      }),
    ),
});
