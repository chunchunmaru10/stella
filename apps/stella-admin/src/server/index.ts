import { announcementRouter } from "./routers/announcement";
import { characterRouter } from "./routers/character";
import { rarityRouter } from "./routers/rarity";
import { setRouter } from "./routers/set";
import { statRouter } from "./routers/stat";
import { typeRouter } from "./routers/type";
import { router } from "./trpc";

export const appRouter = router({
  character: characterRouter,
  set: setRouter,
  type: typeRouter,
  stat: statRouter,
  rarity: rarityRouter,
  announcement: announcementRouter,
});

export type AppRouter = typeof appRouter;
