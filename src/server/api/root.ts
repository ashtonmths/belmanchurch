import { donationRouter } from "./routers/donation";
import { familyRouter } from "./routers/family";
import { miscRouter } from "./routers/misc";
import { wardRouter } from "./routers/wards";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  donation: donationRouter,
  family: familyRouter,
  misc: miscRouter,
  ward: wardRouter,
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
