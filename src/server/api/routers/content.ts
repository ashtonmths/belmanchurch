import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { CONTENT, CONTENT_KEYS } from "~/lib/site-content";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getContent } from "~/server/content";

export const contentRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ key: z.enum(CONTENT_KEYS) }))
    .query(({ input }) => getContent(input.key)),

  set: adminProcedure
    .input(z.object({ key: z.enum(CONTENT_KEYS), value: z.unknown() }))
    .mutation(async ({ ctx, input }) => {
      const parsed = CONTENT[input.key].schema.safeParse(input.value);
      if (!parsed.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: parsed.error.issues
            .map((i) => `${i.path.join(".") || "value"}: ${i.message}`)
            .join("; "),
        });
      }
      await ctx.db.siteContent.upsert({
        where: { key: input.key },
        update: { value: parsed.data },
        create: { key: input.key, value: parsed.data },
      });
      return parsed.data;
    }),

  /** Discards saved edits so the built-in default is shown again. */
  reset: adminProcedure
    .input(z.object({ key: z.enum(CONTENT_KEYS) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.siteContent.deleteMany({ where: { key: input.key } });
      return CONTENT[input.key].default;
    }),
});
