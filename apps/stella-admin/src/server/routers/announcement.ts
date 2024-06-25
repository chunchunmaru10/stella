import { db } from "database";
import { procedure, router } from "../trpc";
import { z } from "zod";

export const announcementRouter = router({
  getAnnouncements: procedure.query(async () => {
    return await db.announcement.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  createAnnouncement: procedure
    .input(z.string().min(1, "Message is required"))
    .mutation(async ({ input }) => {
      await db.announcement.create({
        data: {
          message: input,
        },
      });
    }),
});
