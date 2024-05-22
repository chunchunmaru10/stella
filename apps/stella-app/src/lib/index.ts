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

export function getUsableCharactersFromRelic(relic: Relic, settings: Settings) {
	return {
		...relic,
		usableCharacters: relic.characters
			?.map((character) => {
				// if relic ratings is set to display potential values,
				// we only pick the zero'th value since we are just calculating the total ratings for sorting,
				// the displaying of the actual potential stat's values are not handled in this component
				const rating = (
					settings.relicRatings === 'potential' && character.potentialValues.length > 0
						? [...character.actualValues, character.potentialValues[0]]
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
