import { browser } from '$app/environment';
import type { Settings } from '$lib/types';
import { writable, type Updater } from 'svelte/store';

function createSettingsStore() {
	const defaultSettings: Settings = {
		excludedCharacters: [],
		relicRatings: 'actual',
		minRatingPercentage: 50,
		ratingsFormat: 'fraction',
		includeUnreleaseCharacters: false
	};

	const userSettingsFromLocalStorage = browser && localStorage.getItem('settings');

	const settings = writable<Settings>(
		userSettingsFromLocalStorage ? JSON.parse(userSettingsFromLocalStorage) : defaultSettings
	);

	function update(updater: Updater<Settings>) {
		settings.update((current) => {
			const newSettings = updater(current);

			browser && localStorage.setItem('settings', JSON.stringify(newSettings));

			return newSettings;
		});
	}

	return {
		subscribe: settings.subscribe,
		update
	};
}

export const settings = createSettingsStore();
