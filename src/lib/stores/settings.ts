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

	let settingsString;

	if (browser) settingsString = localStorage.getItem('settings');

	const userSettingsFromLocalStorage = settingsString || JSON.stringify(defaultSettings);

	let loadedSettings: Settings;

	// use try catch here in case the settings in local storage is corrupted (if so, use default value)
	try {
		loadedSettings = JSON.parse(userSettingsFromLocalStorage);
	} catch {
		loadedSettings = defaultSettings;
	}

	const settings = writable<Settings>(loadedSettings);

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
