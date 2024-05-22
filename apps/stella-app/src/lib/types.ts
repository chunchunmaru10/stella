import type { z } from 'zod';
import type { CharacterSchema, HsrScannerJsonSchema, RelicSchema } from './schemas';

// https://stackoverflow.com/questions/59774572/how-to-get-the-return-type-of-async-function-in-typescript
export type AsyncReturnType<T extends (...args: never) => Promise<unknown>> = T extends (
	...args: never
) => Promise<infer R>
	? R
	: unknown;

export type RelicData = {
	set: string;
	type: string;
	mainStat: string;
	subStats: string[];
};

export type Relic = z.infer<typeof RelicSchema>;

export type CharacterRelicValue = z.infer<typeof CharacterSchema>;

export type Settings = {
	excludedCharacters: string[];
	relicRatings: 'potential' | 'actual';
	minRatingPercentage: number;
	ratingsFormat: 'percentage' | 'fraction';
	includeUnreleaseCharacters: boolean;
};

export type HsrScannerJson = z.infer<typeof HsrScannerJsonSchema>;

export type HsrScannerRelic = HsrScannerJson['relics'];

export type SortOption = 'Piece Type' | 'Set' | 'Character Count';
