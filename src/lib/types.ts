export const stats = [
	'HP',
	'ATK',
	'DEF',
	'HP%',
	'ATK%',
	'DEF%',
	'CRIT Rate',
	'CRIT DMG',
	'Effect Hit Rate',
	'Effect RES',
	'Break Effect',
	'SPD'
] as const;
export const pieceType = ['Head', 'Hands', 'Body', 'Feet', 'Planar Sphere', 'Link Rope'] as const;
export const sets: Set[] = [
	{
		setName: 'Passerby of Wandering Cloud',
		head: "Passerby's Rejuvenated Wooden Hairstick",
		hands: "Passerby's Roaming Dragon Bracer",
		body: "Passerby's Ragged Embroided Coat",
		feet: "Passerby's Stygian Hiking Boots"
	},
	{
		setName: 'Musketeer of Wild Wheat',
		head: "Musketeer's Wild Wheat Felt Hat",
		hands: "Musketeer's Coarse Leather Gloves",
		body: "Musketeer's Wind-Hunting Shawl",
		feet: "Musketeer's Rivets Riding Boots"
	},
	{
		setName: 'Knight of Purity Palace',
		head: "Knight's Forgiving Casque",
		hands: "Knight's Silent Oath Ring",
		body: "Knight's Solemn Breastplate",
		feet: "Knight's Iron Boots of Order"
	},
	{
		setName: 'Hunter of Glacial Forest',
		head: "Hunter's Artaius Hood",
		hands: "Hunter's Lizard Gloves",
		body: "Hunter's Ice Dragon Cloak",
		feet: "Hunter's Soft Elkskin Boots"
	},
	{
		setName: 'Champion of Streetwise Boxing',
		head: "Champion's Headgear",
		hands: "Champion's Heavy Gloves",
		body: "Champion's Chest Guard",
		feet: "Champion's Fleetfoot Boots"
	},
	{
		setName: 'Guard of Wuthering Snow',
		head: "Guard's Cast Iron Helmet",
		hands: "Guard's Shining Gauntlets",
		body: "Guard's Uniform of Old",
		feet: "Guard's Silver Greaves"
	},
	{
		setName: 'Firesmith of Lava-Forging',
		head: "Firesmith's Obsidian Goggles",
		hands: "Firesmith's Ring of Flame-Mastery",
		body: "Firesmith's Fireproof Apron",
		feet: "Firesmith's Alloy Leg"
	},
	{
		setName: 'Genius of Brilliant Stars',
		head: "Genius's Ultraremote Sensing Visor",
		hands: "Genius's Frequency Catcher",
		body: "Genius's Metafield Suit",
		feet: "Genius's Gravity Walker"
	},
	{
		setName: 'Space Sealing Station',
		planarSphere: "Herta's Space Station",
		linkRope: "Herta's Wandering Trek"
	}
];

export type Set =
	| {
			setName: string;
			head: string;
			hands: string;
			body: string;
			feet: string;
			planarSphere?: undefined;
			linkRope?: undefined;
	  }
	| {
			setName: string;
			head?: undefined;
			hands?: undefined;
			body?: undefined;
			feet?: undefined;
			planarSphere: string;
			linkRope: string;
	  };

type BaseRelic = {
	name: string;
	set: string;
	type: (typeof pieceType)[number];
	mainStat: (typeof stats)[number];
	subStat1: (typeof stats)[number];
	subStat2: (typeof stats)[number];
	subStat3: (typeof stats)[number];
	subStat4: (typeof stats)[number];
};

export type Relic =
	| (BaseRelic & {
			type: 'Head';
			mainStat: 'HP';
	  })
	| (BaseRelic & {
			type: 'Hands';
			mainStat: 'ATK';
	  })
	| (BaseRelic & {
			type: 'Body';
			mainStat:
				| 'HP%'
				| 'ATK%'
				| 'DEF%'
				| 'CRIT Rate'
				| 'CRIT DMG'
				| 'Outgoing Healing'
				| 'Effect Hit Rate';
	  })
	| (BaseRelic & {
			type: 'Feet';
			mainStat: 'HP%' | 'ATK%' | 'DEF%' | 'SPD';
	  })
	| (BaseRelic & {
			type: 'Planar Sphere';
			mainStat:
				| 'HP%'
				| 'ATK%'
				| 'DEF%'
				| 'Physical DMG'
				| 'Fire DMG'
				| 'Ice DMG'
				| 'Lightning DMG'
				| 'Wind DMG'
				| 'Quantum DMG'
				| 'Imaginary DMG';
	  })
	| (BaseRelic & {
			type: 'Link Rope';
			mainStat: 'HP%' | 'ATK%' | 'DEF%' | 'Break Effect' | 'Energy Regeneration Rate';
	  });
