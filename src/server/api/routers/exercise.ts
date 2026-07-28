import { z } from "zod";
import { createTRPCRouter, instructorProcedure } from "pnpm/server/api/trpc";

export const exerciseRouter = createTRPCRouter({
  /** Create a custom exercise scoped to the logged-in instructor. */
  create: instructorProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        muscleGroup: z.string().min(1).max(60),
        description: z.string().max(300).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.exercise.create({
        data: {
          name: input.name,
          muscleGroup: input.muscleGroup,
          description: input.description ?? null,
          creatorId: ctx.session.user.id,
        },
      }),
    ),
});
