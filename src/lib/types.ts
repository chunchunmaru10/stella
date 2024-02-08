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
