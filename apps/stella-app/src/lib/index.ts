import type { Relic, Settings } from './types';

export function removeSpace(input: string) {
	return input.replaceAll(/\s/g, '');
}

// https://stackoverflow.com/questions/2970525/converting-a-string-with-spaces-into-camel-case
export function camelize(str: string) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

export function getStatValue(a: number, b: number, displayPercentage: boolean) {
	if (displayPercentage) {
		a = Math.floor(a * 10) / 10;
		b = Math.floor(b * 10) / 10;
	} else {
		a = Math.floor(a);
		b = Math.floor(b);
	}

	return [a, b];
}

export function findCombination(
	numbers: number[],
	target: number,
	displayPercentage: boolean
): number[] | null {
	// Sort the numbers in descending order to prioritize larger numbers
	numbers.sort((a, b) => b - a);

	// Helper function to check if two numbers are approximately equal
	function approximatelyEqual(a: number, b: number): boolean {
		[a, b] = getStatValue(a, b, displayPercentage);
		return a === b;
	}

	function backtrack(
		startIndex: number,
		currentSum: number,
		combination: number[]
	): number[] | null {
		// Base case: if current sum matches the target, return the combination
		if (approximatelyEqual(currentSum, target)) {
			return combination;
		}

		// If current sum exceeds the target, backtrack
		if (currentSum > target || startIndex >= numbers.length) {
			return null;
		}

		// Try each number in the array from the current index
		for (let i = startIndex; i < numbers.length; i++) {
			const num = numbers[i];
			// Include the current number in the combination
			combination.push(num);
			// Recur with the updated sum and combination, starting from the current index
			const result = backtrack(i, currentSum + num, combination);
			// If a valid combination is found, return it
			if (result) {
				return result;
			}
			// Remove the last number from the combination to backtrack
			combination.pop();
		}

		// If no combination is found, return null
		return null;
	}

	// Start backtracking from the beginning of the array
	return backtrack(0, 0, []);
}

export function fixFloatPrecision(n: number) {
	return Math.round(n * 10) / 10;
}

export function getUsableCharactersFromRelic(relic: Relic, settings: Settings) {
	return {
		...relic,
		usableCharacters: relic.characters
			?.map((character) => {
				// if relic ratings is set to display potential values,
				// we only pick the zero'th value since we are just calculating the total ratings for sorting,
				// the displaying of the actual potential stat's values are not handled in this component
				const rating = (
					settings.relicRatings === 'potential' && character.potentialStats.length > 0
						? [...character.actualValues, character.potentialStats[0]]
						: character.actualValues
				) // if character.potentialValues.length is 0, the resulting array will be the same
					.reduce((totalRating, currentStat) => totalRating + currentStat.value, 0);

				return {
					...character,
					releaseDate: new Date(character.releaseDate),
					rating
				};
			})
			.filter((c) => {
				return (
					(c.rating / c.maxPotentialValue) * 100 >= settings.minRatingPercentage &&
					(settings.includeUnreleaseCharacters || c.releaseDate.getTime() < new Date().getTime()) &&
					!settings.excludedCharacters.includes(c.name)
				);
			})
	};
}

export function getRelicColor(rarity: number) {
	switch (rarity) {
		case 2:
			return {
				from: 'from-green-dark',
				to: 'to-green-light',
				text: 'text-green-light',
				bg: 'bg-green-light'
			};
		case 3:
			return {
				from: 'from-blue-dark',
				to: 'to-blue-light',
				text: 'text-blue-light',
				bg: 'bg-blue-light'
			};
		case 4:
			return {
				from: 'from-purple-dark',
				to: 'to-purple-light',
				text: 'text-purple-light',
				bg: 'bg-purple-light'
			};
		default:
			return {
				from: 'from-gold-dark',
				to: 'to-gold-light',
				text: 'text-gold-light',
				bg: 'bg-gold-light'
			};
	}
}
