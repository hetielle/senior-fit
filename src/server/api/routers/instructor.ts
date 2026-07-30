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

  /** Performance metrics for a single student. */
  getStudentMetrics: instructorProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { studentId } = input;

      const now = new Date();
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const sevenDaysAgo = new Date(todayUTC);
      sevenDaysAgo.setUTCDate(todayUTC.getUTCDate() - 6);
      const thirtyDaysAgo = new Date(todayUTC);
      thirtyDaysAgo.setUTCDate(todayUTC.getUTCDate() - 29);

      const [workouts, completions7dCount, completions30d, recentDates, weights] =
        await Promise.all([
          ctx.db.studentWorkout.findMany({
            where: { studentId },
            select: { dayOfWeek: true, _count: { select: { items: true } } },
          }),
          ctx.db.exerciseCompletion.count({
            where: { studentId, date: { gte: sevenDaysAgo } },
          }),
          ctx.db.exerciseCompletion.findMany({
            where: { studentId, date: { gte: thirtyDaysAgo } },
            select: {
              date: true,
              studentWorkoutItem: {
                select: { exercise: { select: { muscleGroup: true } } },
              },
            },
          }),
          ctx.db.exerciseCompletion.findMany({
            where: { studentId },
            select: { date: true },
            orderBy: { date: "desc" },
            distinct: ["date"],
            take: 365,
          }),
          ctx.db.weightEntry.findMany({
            where: { userId: studentId },
            orderBy: { date: "desc" },
            take: 3,
            select: { weight: true },
          }),
        ]);

      // --- Adherence ---
      const workoutByDow = new Map(workouts.map((w) => [w.dayOfWeek, w._count.items]));
      const hasPlan = workoutByDow.size > 0;

      function assignedInWindow(days: number): number {
        let total = 0;
        for (let i = 0; i < days; i++) {
          const d = new Date(todayUTC);
          d.setUTCDate(todayUTC.getUTCDate() - i);
          total += workoutByDow.get(d.getUTCDay()) ?? 0;
        }
        return total;
      }

      const assigned7d = assignedInWindow(7);
      const assigned30d = assignedInWindow(30);

      const adherence7d =
        hasPlan && assigned7d > 0
          ? Math.min(100, Math.round((completions7dCount / assigned7d) * 100))
          : null;
      const adherence30d =
        hasPlan && assigned30d > 0
          ? Math.min(100, Math.round((completions30d.length / assigned30d) * 100))
          : null;

      // --- Sessions 30d ---
      const distinctDates30d = new Set(
        completions30d.map((c) => c.date.toISOString().split("T")[0]),
      );
      const totalSessions30d = distinctDates30d.size;

      // --- Top muscle group 30d ---
      const muscleCount = new Map<string, number>();
      for (const c of completions30d) {
        const mg = c.studentWorkoutItem.exercise.muscleGroup;
        muscleCount.set(mg, (muscleCount.get(mg) ?? 0) + 1);
      }
      let topMuscleGroup30d: string | null = null;
      let topCount = 0;
      for (const [mg, count] of muscleCount) {
        if (count > topCount) {
          topCount = count;
          topMuscleGroup30d = mg;
        }
      }

      // --- Streak ---
      let streak = 0;
      const checkDate = new Date(todayUTC);
      const todayStr = checkDate.toISOString().split("T")[0]!;
      const datestrs = recentDates.map((r) => r.date.toISOString().split("T")[0]!);

      if (datestrs.length > 0 && datestrs[0] !== todayStr) {
        const yesterday = new Date(todayUTC);
        yesterday.setUTCDate(todayUTC.getUTCDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0]!;
        if (datestrs[0] === yesterdayStr) {
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
          for (const d of datestrs) {
            if (d === checkDate.toISOString().split("T")[0]!) {
              streak++;
              checkDate.setUTCDate(checkDate.getUTCDate() - 1);
            } else break;
          }
        }
      } else {
        for (const d of datestrs) {
          if (d === checkDate.toISOString().split("T")[0]!) {
            streak++;
            checkDate.setUTCDate(checkDate.getUTCDate() - 1);
          } else break;
        }
      }

      // --- Weight trend ---
      let weightTrend: "up" | "down" | "stable" | "insufficient_data" =
        "insufficient_data";
      if (weights.length >= 2) {
        const diff = weights[0]!.weight - weights[weights.length - 1]!.weight;
        weightTrend = diff > 0.5 ? "up" : diff < -0.5 ? "down" : "stable";
      }

      return {
        adherence7d,
        adherence30d,
        streak,
        totalSessions30d,
        topMuscleGroup30d,
        weightTrend,
      };
    }),
});
