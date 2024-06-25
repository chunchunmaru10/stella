import { z } from 'zod';

export const HsrScannerJsonSchema = z.object({
	relics: z.array(
		z.object({
			set: z.string(),
			slot: z.string(),
			rarity: z.number(),
			level: z.number(),
			mainstat: z.string(),
			substats: z.array(
				z.object({
					key: z.string(),
					value: z.number()
				})
			),
			location: z.string(),
			lock: z.boolean(),
			discard: z.boolean(),
			_id: z.string()
		})
	)
});

export const CharacterSchema = z.object({
	name: z.string(),
	thumbnail: z.string(),
	rarity: z.union([z.literal(4), z.literal(5)]),
	maxPotentialValue: z.number().min(0),
	releaseDate: z.coerce.date(),
	actualValues: z.array(
		z.object({
			stat: z.string(),
			value: z.number()
		})
	),
	potentialValues: z.array(
		z.object({
			stat: z.string(),
			value: z.number()
		})
	)
});

export const RelicSchema = z.object({
	setName: z.string(),
	image: z.string(),
	relicName: z.string(),
	type: z.string(),
	level: z.number(),
	rarity: z.number(),
	mainStat: z.object({
		name: z.string(),
		value: z.number(),
		displayPercentage: z.boolean()
	}),
	substats: z.array(
		z.object({
			name: z.string(),
			value: z.number(),
			displayPercentage: z.boolean(),
			upgrades: z.array(z.number()),
			maxValue: z.number()
		})
	),
	characters: z.array(CharacterSchema)
});

export const BatchRelicSchema = z.array(RelicSchema);

export const AnnouncementSchema = z.object({
	message: z.string(),
	doNotShow: z.boolean()
});
