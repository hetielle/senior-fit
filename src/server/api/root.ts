import { exerciseRouter } from "pnpm/server/api/routers/exercise";
import { instructorRouter } from "pnpm/server/api/routers/instructor";
import { postRouter } from "pnpm/server/api/routers/post";
import { profileRouter } from "pnpm/server/api/routers/profile";
import { studentWorkoutRouter } from "pnpm/server/api/routers/studentWorkout";
import { workoutRouter } from "pnpm/server/api/routers/workout";
import { createCallerFactory, createTRPCRouter } from "pnpm/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  workout: workoutRouter,
  profile: profileRouter,
  studentWorkout: studentWorkoutRouter,
  instructor: instructorRouter,
  exercise: exerciseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
