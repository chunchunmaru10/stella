import { subStats as subStatList } from './types';

export function getStatsFromRawString(rawString: string, mainStats: string[]) {
	let mainStat = '';
	const subStats = [];
	const lines = rawString.split('\n');

	let mainStatLineIndex = -1;

	for (const [index, line] of lines.entries()) {
		for (const stat of mainStats) {
			if (line.includes(stat)) {
				mainStatLineIndex = index;
				mainStat = stat;
				break;
			}
		}
		if (mainStatLineIndex !== -1) break;
	}

	if (mainStatLineIndex === -1) throw new Error('Main stat is not found');

	if (['HP', 'ATK', 'DEF'].includes(mainStat) && lines[mainStatLineIndex].endsWith('%'))
		mainStat += '%';

	for (let i = mainStatLineIndex + 1; i < mainStatLineIndex + 5; i++) {
		for (const stat of subStatList) {
			if (lines[i].includes(stat)) {
				let subStat = stat;
				if (['HP', 'ATK', 'DEF'].includes(subStat) && lines[i].endsWith('%')) subStat += '%';
				subStats.push(subStat);
			}
		}
	}

	return {
		mainStat,
		subStats
	};
}
