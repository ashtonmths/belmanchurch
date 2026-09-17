import { donationRouter } from "./routers/donation";
import { familyRouter } from "./routers/family";
import { miscRouter } from "./routers/misc";
import { parishonerRouter } from "./routers/parishoner";
import { wardRouter } from "./routers/wards";
import { galleryRouter } from "./routers/gallery";
import { carouselRouter } from "./routers/carousel";
import { priestRouter } from "./routers/priests";
import { noticeRouter } from "./routers/notices";
import { eventRouter } from "./routers/events";
import { contactRouter } from "./routers/contact";
import { contentRouter } from "./routers/content";
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
  parishoner: parishonerRouter,
  gallery: galleryRouter,
  carousel: carouselRouter,
  priest: priestRouter,
  notice: noticeRouter,
  event: eventRouter,
  contact: contactRouter,
  content: contentRouter,
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
