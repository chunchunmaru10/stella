export function getStatsFromRawString(
	rawString: string,
	mainStatList: string[],
	subStatList: string[]
) {
	let mainStat = '';
	const subStats = [];
	const lines = rawString.split('\n');

	let mainStatLineIndex = -1;

	for (const [index, line] of lines.entries()) {
		for (const stat of mainStatList) {
			// if the stat includes %, such as HP%, ATK%, and DEF%, check if the line has both the stat (HP) and the percentage
			// other percentage stats (such as CRITs) is not included in this statment because they dont have the non-% variant
			if (stat.includes('%')) {
				if (line.includes(stat.replaceAll('%', '')) && line.includes('%')) {
					mainStatLineIndex = index;
					mainStat = stat;
					break;
				}
			} else {
				if (line.includes(stat)) {
					mainStatLineIndex = index;
					mainStat = stat;
					break;
				}
			}
		}
		if (mainStatLineIndex !== -1) break;
	}

	if (mainStatLineIndex === -1) throw new Error('Main stat is not found');

	if (['HP', 'ATK', 'DEF'].includes(mainStat) && lines[mainStatLineIndex].endsWith('%'))
		mainStat += '%';

	for (let i = mainStatLineIndex + 1; i < lines.length; i++) {
		for (const stat of subStatList) {
			if (lines[i].includes(stat)) {
				let subStat = stat;
				if (['HP', 'ATK', 'DEF'].includes(subStat) && lines[i].includes('%')) subStat += '%';
				subStats.push(subStat);
			}

			// stop once there are 4 substats detected
			if (subStats.length >= 4) break;
		}
	}

	return {
		mainStat,
		subStats
	};
}

export function removeSpace(input: string) {
	return input.replaceAll(/\s/g, '');
}
