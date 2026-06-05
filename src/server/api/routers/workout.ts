import { createTRPCRouter, protectedProcedure } from "pnpm/server/api/trpc";

const DAY_TO_TYPE: Record<number, string | null> = {
  0: null,        // Domingo - descanso
  1: "upper",     // Segunda-feira
  2: "lower",     // Terça-feira
  3: "core",      // Quarta-feira
  4: "upper",     // Quinta-feira
  5: "full",      // Sexta-feira
  6: "stretch",   // Sábado
};

export const workoutRouter = createTRPCRouter({
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const dayType = DAY_TO_TYPE[new Date().getDay()];
    if (!dayType) return null;

    return ctx.db.workout.findUnique({
      where: { dayType },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: { exercise: true },
        },
      },
    });
  }),
});
