import { ZodIssueCode, z } from 'zod';

const parseJsonPreprocessor = (value: unknown, ctx: z.RefinementCtx) => {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch (e) {
			ctx.addIssue({
				code: ZodIssueCode.custom,
				message: (e as Error).message
			});
		}
	}
	return value;
};

export const SettingsSchema = z.preprocess(
	parseJsonPreprocessor,
	z.object({
		excludedCharacters: z.array(z.string()),
		relicRatings: z.enum(['potential', 'actual']),
		minRatingPercentage: z.number().min(1).max(100),
		ratingsFormat: z.enum(['fraction', 'percentage']),
		includeUnreleaseCharacters: z.boolean(),
		announcement: z.string(),
		doNotShowAnnouncement: z.boolean()
	})
);

export const HsrScannerJsonSchema = z.preprocess(
	parseJsonPreprocessor,
	z.object({
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
				_uid: z.string()
			})
		)
	})
);

export const CharacterSchema = z.preprocess(
	parseJsonPreprocessor,
	z.object({
		name: z.string(),
		thumbnail: z.string(),
		rarity: z.union([z.literal(4), z.literal(5)]),
		maxPotentialValue: z.number().min(0),
		releaseDate: z.coerce.date(),
		actualValues: z.array(
			z.object({
				stat: z.string(),
				values: z.array(z.number())
			})
		),
		potentialStats: z.array(z.string()),
		potentialStatsValue: z.number().min(0),
		maxPotentialValueAtMaxLevel: z.number().min(0),
		remainingNumberOfUpgrades: z.number().min(0)
	})
);

export const RelicSchema = z.preprocess(
	parseJsonPreprocessor,
	z.object({
		index: z.number().default(0),
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
	})
);

export const BatchRelicSchema = z.preprocess(parseJsonPreprocessor, z.array(RelicSchema));
