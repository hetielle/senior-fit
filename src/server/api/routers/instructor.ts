import { z } from "zod";
import { createTRPCRouter, instructorProcedure } from "pnpm/server/api/trpc";

export const instructorRouter = createTRPCRouter({
  /** All students with their profiles. */
  getStudents: instructorProcedure.query(({ ctx }) =>
    ctx.db.user.findMany({
      where: { role: "STUDENT" },
      include: { profile: true },
      orderBy: { name: "asc" },
    }),
  ),

  /** Single student with profile, weight history, and workout plan. */
  getStudent: instructorProcedure
    .input(z.object({ studentId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.user.findUnique({
        where: { id: input.studentId },
        include: {
          profile: true,
          weightEntries: { orderBy: { date: "desc" }, take: 10 },
          studentWorkouts: {
            include: {
              items: { orderBy: { order: "asc" }, include: { exercise: true } },
            },
          },
        },
      }),
    ),

  /** Toggle a student's active status. */
  toggleStudentActive: instructorProcedure
    .input(z.object({ studentId: z.string(), isActive: z.boolean() }))
    .mutation(({ ctx, input }) =>
      ctx.db.user.update({
        where: { id: input.studentId },
        data: { isActive: input.isActive },
        select: { id: true, isActive: true },
      }),
    ),
});
