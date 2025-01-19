import type { z } from 'zod';
import type { CharacterSchema, RelicSchema, SettingsSchema } from './schemas';

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
	substats: string[];
};

export type Relic = z.infer<typeof RelicSchema>;

export type CharacterRelicValue = z.infer<typeof CharacterSchema>;

export type Settings = z.infer<typeof SettingsSchema>;

export type SortOption =
	| 'Piece Type'
	| 'Set'
	| 'Character Count'
	| 'Rarity'
	| 'Level'
	| 'Import Order';

export type BatchImportOption = 'HSR Scanner' | 'Stella';
