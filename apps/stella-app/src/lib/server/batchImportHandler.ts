import { BatchRelicSchema, HsrScannerJsonSchema } from '$lib/schemas';
import type { Relic } from '$lib/types';
import {
	getDbData,
	getFlatStatsWithPercentageVariants,
	getSubstatUpgrades,
	rateRelic
} from './index';

export async function hsrScannerBatch(jsonData: object): Promise<Relic[]> {
	const result = HsrScannerJsonSchema.safeParse(jsonData);
	if (result.error)
		throw new Error('An error occured while parsing the data. The JSON format may be incorrect.');

	const { characters, sets, subStatList, rarities } = await getDbData();

	const ratedRelics: Relic[] = [];

	const flatSubstats = getFlatStatsWithPercentageVariants(subStatList.map((s) => s.name));
	for (const relic of result.data.relics) {
		try {
			if (flatSubstats.includes(relic.mainstat) && !relic.slot.match(/(Head|Hands)/)) {
				// if main stat is HP, ATK or DEF, and is not head or hands, append % to the end
				relic.mainstat += '%';
			}

			const matchedSet = sets.find((s) => s.name === relic.set);

			if (!matchedSet) continue;

			const matchedPiece = matchedSet.pieces.find((p) => p.typeName === relic.slot);

			if (!matchedPiece) continue;

			const mainStat = matchedPiece.type.stats.find((s) => s.name === relic.mainstat);

			if (!mainStat) continue;

			const scaling = mainStat.mainStatScalings.find(
				(s) => s.rarityId === relic.rarity && s.statName === relic.mainstat
			);

			if (!scaling) continue;

			const matchedRarity = rarities.find((r) => r.rarity === relic.rarity);

			if (!matchedRarity) continue;

			const substats = relic.substats.map((substat) => {
				// if ends with a _, check if need to replace it with % (needed to differentiate ATK from ATK% and etc)
				// otherwise can remove for stats like CRIT Rate where the % is always there
				if (substat.key.endsWith('_')) {
					if (flatSubstats.includes(substat.key.replace('_', '')))
						substat.key = substat.key.replace('_', '%');
					else substat.key = substat.key.replace('_', '');
				}

				const newSubstatFormat = {
					upgrades: [],
					maxValue: 0,
					name: substat.key,
					displayPercentage: substat.value.toString().includes('.'), // the JSON file will include the decimal for percentage substats even if it ends with 0, e.g. 12.0%
					value: substat.value
				};
				getSubstatUpgrades(newSubstatFormat, subStatList, relic.rarity);
				return newSubstatFormat;
			});

			ratedRelics.push(
				rateRelic(
					{
						level: relic.level,
						matchedPiece: matchedPiece,
						matchedSet,
						matchedType: matchedPiece.type,
						...matchedRarity,
						stats: {
							mainStat: {
								name: mainStat.name,
								value: scaling.baseValue + scaling.scalingValue * relic.level,
								displayPercentage: mainStat.displayPercentage
							},
							substats
						}
					},
					characters
				)
			);
		} catch {
			// don't have to do anything in catch block, just skip if error to prevent one misparsed relic to ruin the entire import
		}
	}

	return ratedRelics;
}

export async function stellaBatch(jsonData: object): Promise<Relic[]> {
	const result = BatchRelicSchema.safeParse(jsonData);
	if (result.error)
		throw new Error('An error occured while parsing the data. The JSON format may be incorrect.');

	const { characters, sets, rarities } = await getDbData();

	const ratedRelics: Relic[] = [];

	for (const relic of result.data) {
		try {
			const matchedSet = sets.find((s) => s.name === relic.setName);

			if (!matchedSet) continue;

			const matchedPiece = matchedSet.pieces.find((p) => p.typeName === relic.type);

			if (!matchedPiece) continue;

			const mainStat = matchedPiece.type.stats.find((s) => s.name === relic.mainStat.name);

			if (!mainStat) continue;

			const scaling = mainStat.mainStatScalings.find(
				(s) => s.rarityId === relic.rarity && s.statName === relic.mainStat.name
			);

			if (!scaling) continue;

			const rarity = rarities.find((r) => r.rarity === relic.rarity);

			if (!rarity) continue;

			ratedRelics.push(
				rateRelic(
					{
						matchedSet,
						matchedPiece,
						matchedType: matchedPiece.type,
						level: relic.level,
						...rarity,
						stats: {
							mainStat: relic.mainStat,
							substats: relic.substats
						}
					},
					characters
				)
			);
		} catch {
			// don't have to do anything in catch block, just skip if error to prevent one misparsed relic to ruin the entire import
		}
	}

	return ratedRelics;
}
