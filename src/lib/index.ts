// place files you want to import through the `$lib` alias in this folder.
export function getMainStatFromRawString(rawString: string, mainStats: string[]) {
	let mainStat = '';
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

	return mainStat;
}
