import contentful from 'contentful';

export type RelicSet = {
	contentTypeId: 'relicSets';
	fields: {
		name: contentful.EntryFieldTypes.Text;
		thumbnail: contentful.EntryFieldTypes.AssetLink;
		pieces: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<RelicPiece>>;
	};
};

export type RelicType = {
	contentTypeId: 'relicTypes';
	fields: {
		type: contentful.EntryFieldTypes.Text;
		mainStats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
	};
};

export type RelicPiece = {
	contentTypeId: 'relicPieces';
	fields: {
		name: contentful.EntryFieldTypes.Text;
		type: contentful.EntryFieldTypes.EntryLink<RelicType>;
		set: contentful.EntryFieldTypes.EntryLink<RelicSet>;
		thumbnail: contentful.EntryFieldTypes.AssetLink;
	};
};

export type Stat = {
	contentTypeId: 'stats';
	fields: {
		name: contentful.EntryFieldTypes.Text;
		canBeSubstat: contentful.EntryFieldTypes.Boolean;
	};
};

export type Character = {
	contentTypeId: 'characters';
	fields: {
		name: contentful.EntryFieldTypes.Text;
		thumbnail: contentful.EntryFieldTypes.AssetLink;
		rarity: contentful.EntryFieldTypes.Integer;
		releaseDate: contentful.EntryFieldTypes.Date;
		bestSets: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<RelicSet>>;
		bodyStats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
		feetStats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
		planarSphereStats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
		linkRopeStats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
		bestSubstats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
		secondBestSubstats: contentful.EntryFieldTypes.Array<
			contentful.EntryFieldTypes.EntryLink<Stat>
		>;
		thirdBestSubstats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
		fourthBestSubstats: contentful.EntryFieldTypes.Array<
			contentful.EntryFieldTypes.EntryLink<Stat>
		>;
		fifthBestSubstats: contentful.EntryFieldTypes.Array<contentful.EntryFieldTypes.EntryLink<Stat>>;
	};
};

export type Relic = {
	setName: string;
	image: string;
	relicName: string;
	type: string;
	mainStat: string;
	subStats: string[];
	characters: CharacterRelicValue[];
};

export type CharacterData = {
	name: string;
	thumbnail: string;
	rarity: 4 | 5;
	releaseDate: Date;
};

export type CharacterRelicValue = {
	name: string;
	thumbnail: string;
	rarity: 4 | 5;
	maxPotentialValue: number;
	releaseDate: Date;
	actualValues: {
		stat: string;
		value: number;
	}[];
	potentialValues: {
		stat: string;
		value: number;
	}[];
};

export type Settings = {
	excludedCharacters?: string[];
	relicRatings?: 'potential' | 'actual';
	minRatingPercentage?: number;
	ratingsFormat?: 'percentage' | 'fraction';
	includeUnreleaseCharacters?: boolean;
};
