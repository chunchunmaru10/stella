export const subStats = [
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
export const headMainStat = ['HP'] as const;
export const handsMainStat = ['ATK'] as const;
export const bodyMainStat = [
	'HP',
	'ATK',
	'DEF',
	'CRIT Rate',
	'CRIT DMG',
	'Outgoing Healing',
	'Effect Hit Rate'
] as const;
export const feetMainStat = ['HP', 'ATK', 'DEF', 'SPD'] as const;
export const planarSphereMainStat = [
	'HP',
	'ATK',
	'DEF',
	'Physical DMG',
	'Fire DMG',
	'Ice DMG',
	'Lightning DMG',
	'Wind DMG',
	'Quantum DMG',
	'Imaginary DMG'
] as const;
export const linkRopeMainStat = [
	'HP',
	'ATK',
	'DEF',
	'Break Effect',
	'Energy Regeneration Rate'
] as const;
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
		setName: 'Band of Sizzling Thunder',
		head: "Band's Polarized Sunglasses",
		hands: "Band's Touring Bracelet",
		body: "Band's Leather Jacket With Studs",
		feet: "Band's Ankle Boots With Rivets"
	},
	{
		setName: 'Eagle of Twilight Line',
		head: "Eagle's Beaked Helmet",
		hands: "Eagle's Soaring Ring",
		body: "Eagle's Winged Suit Harness",
		feet: "Eagle's Quilted Puttees"
	},
	{
		setName: 'Thief of Shooting Meteor',
		head: "Thief's Myriad-Faced Mask",
		hands: "Thief's Gloves With Prints",
		body: "Thief's Steel Grappling Hook",
		feet: "Thief's Meteor Boots"
	},
	{
		setName: 'Wastelander of Banditry Desert',
		head: "Wastelander's Breathing Mask",
		hands: "Wastelander's Desert Terminal",
		body: "Wastelander's Friar Robe",
		feet: "Wastelander's Powered Greaves"
	},
	{
		setName: 'Longevous Disciple',
		head: "Disciple's Prosthetic Eye",
		hands: "Disciple's Ingenium Hand",
		body: "Disciple's Dewy Feather Garb",
		feet: "Disciple's Celestial Silk Sandals"
	},
	{
		setName: 'Messenger Traversing Hackerspace',
		head: "Messenger's Holovisor",
		hands: "Messenger's Transformative Arm",
		body: "Messenger's Secret Satchel",
		feet: "Messenger's Par-kool Sneakers"
	},
	{
		setName: 'The Ashblazing Grand Duke',
		head: "Grand Duke's Crown of Netherflame",
		hands: "Grand Duke's Gloves of Fieryfur",
		body: "Grand Duke's Robe of Grace",
		feet: "Grand Duke's Ceremonial Boots"
	},
	{
		setName: 'Prisoner in Deep Confinement',
		head: "Prisoner's Sealed Muzzle",
		hands: "Prisoner's Leadstone Shackles",
		body: "Prisoner's Repressive Straitjacket",
		feet: "Prisoner's Restrictive Fetters"
	},
	{
		setName: 'Pioneer Diver of Dead Waters',
		head: "Pioneer's Heatproof Shell",
		hands: "Pioneer's Lacuna Compass",
		body: "Pioneer's Sealed Lead Apron",
		feet: "Pioneer's Starfaring Anchor"
	},
	{
		setName: 'Watchmaker, Master of Dream Machinations',
		head: "Watchmaker's Telescoping Lens",
		hands: "Watchmaker's Fortuitous Wristwatch",
		body: "Watchmaker's Illusory Formal Suit",
		feet: "Watchmaker's Dream-Concealing Dress Shoes"
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
	type: string;
	mainStat: string;
	subStat1: (typeof subStats)[number];
	subStat2: (typeof subStats)[number];
	subStat3: (typeof subStats)[number];
	subStat4?: (typeof subStats)[number];
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
			mainStat: (typeof bodyMainStat)[number];
	  })
	| (BaseRelic & {
			type: 'Feet';
			mainStat: (typeof feetMainStat)[number];
	  })
	| (BaseRelic & {
			type: 'Planar Sphere';
			mainStat: (typeof planarSphereMainStat)[number];
	  })
	| (BaseRelic & {
			type: 'Link Rope';
			mainStat: (typeof linkRopeMainStat)[number];
	  });
