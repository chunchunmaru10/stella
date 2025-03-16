import {
  batchUpdateCharacterSchema,
  characterSchema,
  editCharacterSchema,
} from "@/lib/schema";
import { db } from "database";
import { procedure, router } from "../trpc";
import { z } from "zod";
import {
  batchUpdateCharacters,
  deleteImage,
  uploadImageFromExternalURL,
} from "@/lib/server/utils";
import { NodeType, parse } from "node-html-parser";
import { ParsedPrydwenCharacter } from "@/lib/types";

export const characterRouter = router({
  getAllCharacters: procedure.query(async () => {
    return await db.character.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
  getAllCharactersFull: procedure.query(async () => {
    return await db.character.findMany({
      include: {
        sets: true,
        characterMainStats: {
          include: {
            stat: true,
            type: true,
          },
        },
        characterSubstats: {
          include: {
            stat: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
  addCharacter: procedure.input(characterSchema).mutation(async ({ input }) => {
    const existing = await db.character.findFirst({
      where: {
        name: input.name,
      },
    });

    if (existing)
      throw new Error("Another character with this name already exists");

    const imageUrl = await uploadImageFromExternalURL(
      input.thumbnail,
      `characters/${input.name}`,
    );

    await db.character.create({
      data: {
        name: input.name,
        thumbnail: imageUrl,
        rarity: input.rarity,
        releaseDate: input.releaseDate,
        sets: {
          connect: input.sets.map((set) => ({
            name: set,
          })),
        },
        characterMainStats: {
          createMany: {
            data: input.mainStats.map(({ stat, type }) => ({
              statName: stat,
              typeName: type,
            })),
          },
        },
        characterSubstats: {
          createMany: {
            data: input.subStats.map(({ stat, priority }) => ({
              statName: stat,
              priority,
            })),
          },
        },
      },
    });
  }),
  editCharacter: procedure
    .input(editCharacterSchema)
    .mutation(async ({ input }) => {
      await batchUpdateCharacters([input]);
    }),
  batchEditCharacters: procedure
    .input(batchUpdateCharacterSchema)
    .mutation(async ({ input }) => {
      await batchUpdateCharacters(input);
    }),
  deleteCharacter: procedure
    .input(z.string().min(1, { message: "Character name is required" }))
    .mutation(async ({ input }) => {
      await db.character.delete({
        where: {
          name: input,
        },
      });

      await deleteImage(`characters/${input}`);
    }),
  batchFetchCharacters: procedure
    .input(
      z.object({
        shouldCheckForNewCharacters: z.boolean(),
        characters: z.array(z.string().min(1, "Character name is required.")),
      }),
    )
    .query(async function* ({ input }) {
      type DataWithLog =
        | {
            data: {
              message: string;
              type: "info" | "success" | "error";
            };
            done: false;
          }
        | {
            data: ParsedPrydwenCharacter[];
            done: true;
          };

      const message = {
        info: (message: string): DataWithLog => ({
          data: {
            message,
            type: "info",
          },
          done: false,
        }),
        success: (message: string): DataWithLog => ({
          data: {
            message,
            type: "success",
          },
          done: false,
        }),
        error: (message: string): DataWithLog => ({
          data: {
            message,
            type: "error",
          },
          done: false,
        }),
      };

      const prydwenBaseUrl = "https://www.prydwen.gg";
      const prydwenCharactersPageUrl = `${prydwenBaseUrl}/star-rail/characters/`;

      yield message.info(
        `Starting to fetch HTML from ${prydwenCharactersPageUrl}`,
      );

      const res = await fetch(prydwenCharactersPageUrl);
      const html = await res.text();

      yield message.info(
        `HTML fetched. Length: ${html.length}. Parsing into document now.`,
      );

      const doc = parse(html);

      yield message.info(`HTML parsed successfully`);

      const characterCards = Array.from(doc.querySelectorAll(".avatar-card"))
        .map((avatarCard) => {
          const href =
            avatarCard.querySelector("a")?.getAttribute("href") ?? "";
          const name =
            avatarCard.querySelector("span.emp-name")?.textContent ?? "";
          return {
            name,
            href,
          };
        })
        .filter((c) => !!c.name && !!c.href);

      yield message.info(`Found ${characterCards.length} characters:`);

      const charactersToUpdate: typeof characterCards = [];

      for (const characterCard of characterCards) {
        const text = `\t- ${characterCard.name} (${characterCard.href})`;
        if (input.characters.includes(characterCard?.name ?? "")) {
          charactersToUpdate.push(characterCard);
          yield message.success(text);
        } else yield message.info(text);
      }

      const differenceBetweenExistingCharactersAndPrydwenCharacters =
        input.characters.length - charactersToUpdate.length;

      if (differenceBetweenExistingCharactersAndPrydwenCharacters !== 0)
        yield message.error(
          `Number of characters to update is different from characters found (Some characters are not found). Difference ${Math.abs(differenceBetweenExistingCharactersAndPrydwenCharacters)}.`,
        );

      const allExistingRelicSets = await db.set.findMany();
      const allStats = await db.stat.findMany({
        include: {
          types: true,
        },
      });
      const emptyParsedCharacter: ParsedPrydwenCharacter = {
        name: "",
        link: "",
        isNew: false,
        sets: [],
        mainStats: {
          Body: [],
          Feet: [],
          "Planar Sphere": [],
          "Link Rope": [],
        },
        substats: [] as string[][],
      };

      const parsedCharacters: ParsedPrydwenCharacter[] = [];

      yield message.info("Start to query DB for all existing characters.");

      const allCharacters = await db.character.findMany();

      yield message.info(
        `Query success. DB returned ${allCharacters.length} results`,
      );

      const newCharacterCards = characterCards.filter(
        (c) => !allCharacters.find((char) => c.name === char.name),
      );

      yield message.info(`Found ${newCharacterCards.length} new character(s).`);

      for (
        let i = 0;
        i <
        charactersToUpdate.length +
          (input.shouldCheckForNewCharacters ? newCharacterCards.length : 0);
        i++
      ) {
        const characterCard =
          i >= charactersToUpdate.length
            ? newCharacterCards[i - charactersToUpdate.length]
            : charactersToUpdate[i];
        let parsedCharacter: typeof emptyParsedCharacter = JSON.parse(
          JSON.stringify(emptyParsedCharacter),
        );
        parsedCharacter.name = characterCard.name;
        parsedCharacter.link = characterCard.href;
        parsedCharacter.isNew = i >= charactersToUpdate.length;

        if (i === charactersToUpdate.length)
          yield message.info(
            "Finished updating existing character(s). Begin to add new characters.",
          );

        if (parsedCharacter.isNew) {
          yield message.info(
            `Begin to add new character ${characterCard.name} (${i + 1 - charactersToUpdate.length}/${newCharacterCards.length}).`,
          );
        } else {
          yield message.info(
            `Begin to update ${characterCard.name} (${i + 1}/${charactersToUpdate.length}).`,
          );
        }

        const characterPageUrl = prydwenBaseUrl + characterCard.href;

        yield message.info(`Starting to fetch HTML from ${characterPageUrl}.`);

        const res = await fetch(characterPageUrl);
        const html = await res.text();

        yield message.info(
          `${characterCard.name} page HTML fetched. Length: ${html.length}`,
        );

        const characterDoc = parse(html);

        yield message.info(`${characterCard.name} HTML parsed successfully.`);

        const infoBox = Array.from(
          characterDoc.querySelectorAll(".content-header"),
        )
          .find(
            (el) => el.innerText.trim().toLocaleLowerCase() === "best build",
          )
          ?.closest(".tab-inside")
          ?.querySelector(".info-box p");

        if (
          infoBox &&
          infoBox.innerHTML
            .replaceAll("&#x27;", "'")
            .includes("aren't available yet")
        ) {
          yield message.error(
            `${characterCard.name} is not available yet in Prydwen. Skipping...`,
          );
          continue;
        }

        yield message.info(
          `Start getting relic sets for ${characterCard.name}`,
        );

        yield message.info("Getting relic sets from accordian.");

        const accordianRelicSets = Array.from(
          characterDoc.querySelectorAll(
            '.build-relics:not([class*=" "]) button',
          ),
        )
          .map(
            (e) =>
              e.childNodes
                .find((c) => c.nodeType === NodeType.TEXT_NODE)
                ?.textContent.replaceAll("&#x27;", "'") ?? "",
          )
          .filter((e) => !!e) as string[];

        yield message.info(
          `Found ${accordianRelicSets.length} accordian relic set(s): `,
        );

        for (const set of accordianRelicSets) yield message.info(`\t- ${set}`);

        yield message.info("Getting 2-piece mixed sets.");

        const twoPieceMixedSets = Array.from(
          characterDoc.querySelectorAll(".with-sets li .hsr-name span"),
        )
          .map((e) => e.innerText.replaceAll("&#x27;", "'"))
          .filter((e) => !!e) as string[];

        yield message.info(
          `Found ${twoPieceMixedSets.length} two-piece mixed set(s).`,
        );

        for (const set of twoPieceMixedSets) yield message.info(`\t- ${set}`);

        yield message.info("Forming final sets...");

        for (const set of [...accordianRelicSets, ...twoPieceMixedSets]) {
          if (parsedCharacter.sets.includes(set)) {
            yield message.info(`Found duplicate set "${set}". Skipping...`);
            continue;
          }
          const existingSet = allExistingRelicSets.find((s) => s.name === set);
          if (!existingSet) {
            yield message.error(
              `The set "${set}" does not exist in database. Skipping...`,
            );
          } else {
            parsedCharacter.sets.push(existingSet.name);
            yield message.success(`Added "${set}" to final sets.`);
          }
        }

        yield message.info(
          `Total final relic set count for ${characterCard.name}: ${parsedCharacter.sets.length}.`,
        );

        yield message.info(
          `Start getting main stats for ${characterCard.name}.`,
        );

        const buildStatsEl = characterDoc.querySelector(".build-stats");

        if (!buildStatsEl) {
          message.error(
            `Could not find .build-stats query selector. Skipping ${characterCard.name}...`,
          );
          continue;
        }

        const mainStatsContainerEl = Array.from(
          buildStatsEl.querySelectorAll(".main-stats .stats-header span"),
        );

        for (const slot in parsedCharacter.mainStats) {
          yield message.info(`Getting ${slot.toLocaleLowerCase()} main stats.`);

          const mainStatsEl = mainStatsContainerEl.find(
            (e) => e.innerText === slot,
          );

          if (!mainStatsEl) {
            message.error(
              `Could not find .main-stats .stats-header span with content ${slot}. Skipping ${characterCard.name}...`,
            );
            continue;
          }

          const boxEl = mainStatsEl.closest(".box");

          if (!boxEl) {
            message.error(
              `Could not find .box selector in ancestor of main stat element with slot ${slot}. Skipping ${characterCard.name}`,
            );
            continue;
          }

          const mainStatsTexts = Array.from(
            boxEl.querySelectorAll(".hsr-stat span"),
          )
            .map((e) => e.innerText)
            .filter((e) => !!e) as string[];

          for (const mainStatText of mainStatsTexts) {
            if (!mainStatText) {
              yield message.error("Main stat text is empty. Skipping...");
              continue;
            }

            const foundMainStats = allStats.filter(
              (s) =>
                (s.name === mainStatText ||
                  s.alternateNames.includes(mainStatText)) &&
                s.types.find((type) => type.name === slot),
            );

            if (foundMainStats.length < 1) {
              yield message.error(
                `Skipped adding ${mainStatText} to ${characterCard.name}'s ${slot.toLocaleLowerCase()} slot because it couldn't be found in the database.`,
              );
              continue;
            } else if (foundMainStats.length > 1) {
              yield message.info(
                `Found more than 1 match for ${mainStatText}. Adding all of the following to ${characterCard.name}'s ${slot.toLocaleLowerCase()} slot: `,
              );

              for (const foundMainStat of foundMainStats) {
                yield message.success(`\t- ${foundMainStat.name}`);
              }
            } else if (foundMainStats[0].name === mainStatText) {
              yield message.success(
                `Adding ${mainStatText} to ${characterCard.name}'s ${slot.toLocaleLowerCase()} slot.`,
              );
            } else {
              yield message.success(
                `Could not find exact match for ${mainStatText}, but found it as alternative name for ${foundMainStats[0].name}. Adding ${foundMainStats[0].name} to ${characterCard.name}'s ${slot.toLocaleLowerCase()} slot.`,
              );
            }

            parsedCharacter.mainStats[
              slot as keyof typeof parsedCharacter.mainStats
            ] = [
              ...parsedCharacter.mainStats[
                slot as keyof typeof parsedCharacter.mainStats
              ],
              ...foundMainStats.map((s) => s.name),
            ];
          }
        }

        const substatText =
          characterDoc.querySelector(".build-stats .sub-stats p")
            ?.textContent ?? "";

        if (!substatText) {
          yield message.error(
            `Could not parse substat text from document. Skipping ${characterCard.name}...`,
          );
          continue;
        }

        yield message.info(`Parsed substat text: "${substatText}"`);

        const cleanedSubstatText = substatText
          .replace(/\(.*?\)/g, "")
          .replace(/\s{2,}/g, " ")
          .trim();

        yield message.info(`Cleaned substat text: "${cleanedSubstatText}"`);

        // split by either >= or >
        const substatTextSplitFirstLevel = cleanedSubstatText
          .split(/>=?|=</)
          .map((s) => s.trim())
          .filter((s) => !!s);

        yield message.info(
          `Found ${substatTextSplitFirstLevel.length} different level(s) of priority (lower priority number = higher priority).`,
        );

        // each stats should be something like "CRIT RATE = CRIT DMG" or "ATK%"
        for (let i = 0; i < substatTextSplitFirstLevel.length; i++) {
          const stat = substatTextSplitFirstLevel[i];
          yield message.info(`Priority ${i + 1}: "${stat}"`);
          const substatInThisLevel: string[] = [];

          const substatTextSplitSecondLevel = stat
            .split("=")
            .map((s) => s.trim())
            .filter((s) => !!s);

          for (const substat of substatTextSplitSecondLevel) {
            const foundSubstat = allStats.find(
              (s) => s.name === substat || s.alternateNames.includes(substat),
            );

            if (!foundSubstat) {
              yield message.error(
                `Skipped adding ${substat} to ${characterCard.name}'s substat priority ${i + 1} list because it couldn't be found in the database.`,
              );
              continue;
            } else if (foundSubstat.name === substat) {
              yield message.success(
                `Adding ${substat} to ${characterCard.name}'s substat priority ${i + 1} list.`,
              );
            } else {
              yield message.success(
                `Could not find exact match for ${substat}, but found it as alternative name for ${foundSubstat.name}. Adding ${foundSubstat.name} to ${characterCard.name}'s priority ${i + 1} list.`,
              );
            }

            substatInThisLevel.push(foundSubstat.name);
          }

          parsedCharacter.substats.push(substatInThisLevel);
        }

        yield message.success(
          `Finished parsing ${characterCard.name}. Adding it to the list of parsed characters. Final results:\n${JSON.stringify(parsedCharacter, null, "\t")}`,
        );

        parsedCharacters.push(parsedCharacter);
      }

      yield {
        data: parsedCharacters,
        done: true,
      } as DataWithLog;
    }),
});
