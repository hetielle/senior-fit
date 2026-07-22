import { z } from "zod";
import {
  createTRPCRouter,
  instructorProcedure,
  protectedProcedure,
} from "pnpm/server/api/trpc";

export const studentWorkoutRouter = createTRPCRouter({
  // ── Student procedures ───────────────────────────────────────────────────

  /** Today's workout for the logged-in student, with items and completions. */
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return ctx.db.studentWorkout.findUnique({
      where: {
        studentId_dayOfWeek: {
          studentId: ctx.session.user.id,
          dayOfWeek: new Date().getDay(),
        },
      },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            exercise: true,
            completions: {
              where: {
                studentId: ctx.session.user.id,
                date: today,
              },
            },
          },
        },
      },
    });
  }),

  /** Full week plan for the logged-in student. */
  getWeek: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return ctx.db.studentWorkout.findMany({
      where: { studentId: ctx.session.user.id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            exercise: true,
            completions: {
              where: { studentId: ctx.session.user.id, date: today },
            },
          },
        },
      },
    });
  }),

  /**
   * Toggle completion for an exercise on a given date.
   * Deletes if it exists, creates if it doesn't.
   */
  toggleCompletion: protectedProcedure
    .input(
      z.object({
        studentWorkoutItemId: z.string(),
        date: z.string(), // ISO date string, e.g. "2024-06-05"
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [year, month, day] = input.date.split("-").map(Number);
      const date = new Date(year!, month! - 1, day!);
      date.setHours(0, 0, 0, 0);

      const existing = await ctx.db.exerciseCompletion.findUnique({
        where: {
          studentId_studentWorkoutItemId_date: {
            studentId: ctx.session.user.id,
            studentWorkoutItemId: input.studentWorkoutItemId,
            date,
          },
        },
      });

      if (existing) {
        await ctx.db.exerciseCompletion.delete({ where: { id: existing.id } });
        return { completed: false };
      }

      await ctx.db.exerciseCompletion.create({
        data: {
          studentId: ctx.session.user.id,
          studentWorkoutItemId: input.studentWorkoutItemId,
          date,
        },
      });
      return { completed: true };
    }),

  // ── Instructor procedures ─────────────────────────────────────────────────

  /** Week plan for a given student (instructor view). */
  getStudentWeek: instructorProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return ctx.db.studentWorkout.findMany({
        where: { studentId: input.studentId },
        include: {
          items: {
            orderBy: { order: "asc" },
            include: {
              exercise: true,
              completions: {
                where: { studentId: input.studentId, date: today },
              },
            },
          },
        },
      });
    }),

  /** Create or update a workout day for a student. */
  upsertStudentWorkout: instructorProcedure
    .input(
      z.object({
        studentId: z.string(),
        dayOfWeek: z.number().int().min(0).max(6),
        title: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.studentWorkout.upsert({
        where: {
          studentId_dayOfWeek: {
            studentId: input.studentId,
            dayOfWeek: input.dayOfWeek,
          },
        },
        update: { title: input.title },
        create: {
          studentId: input.studentId,
          instructorId: ctx.session.user.id,
          dayOfWeek: input.dayOfWeek,
          title: input.title,
        },
        include: { items: { include: { exercise: true } } },
      }),
    ),

  /** Add a single exercise to a student workout. */
  addItem: instructorProcedure
    .input(
      z.object({
        studentWorkoutId: z.string(),
        exerciseId: z.string(),
        sets: z.number().int().nullable(),
        reps: z.number().int().nullable(),
        durationSecs: z.number().int().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.studentWorkoutItem.count({
        where: { studentWorkoutId: input.studentWorkoutId },
      });

      return ctx.db.studentWorkoutItem.create({
        data: {
          studentWorkoutId: input.studentWorkoutId,
          exerciseId: input.exerciseId,
          order: count + 1,
          sets: input.sets,
          reps: input.reps,
          durationSecs: input.durationSecs,
        },
        include: { exercise: true },
      });
    }),

  /** Remove an exercise item from a student workout. */
  removeItem: instructorProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.studentWorkoutItem.delete({ where: { id: input.itemId } }),
    ),

  /** Update sets/reps/duration on a workout item. */
  updateItem: instructorProcedure
    .input(
      z.object({
        itemId: z.string(),
        sets: z.number().int().nullable(),
        reps: z.number().int().nullable(),
        durationSecs: z.number().int().nullable(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.studentWorkoutItem.update({
        where: { id: input.itemId },
        data: {
          sets: input.sets,
          reps: input.reps,
          durationSecs: input.durationSecs,
        },
      }),
    ),

  /** Delete an entire day's workout for a student. */
  deleteStudentWorkout: instructorProcedure
    .input(z.object({ studentWorkoutId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.studentWorkout.delete({ where: { id: input.studentWorkoutId } }),
    ),
});
