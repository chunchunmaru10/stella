import { browser } from '$app/environment';
import { SettingsSchema } from '$lib/schemas';
import type { Settings } from '$lib/types';
import { writable, type Updater } from 'svelte/store';

function createSettingsStore() {
	const defaultSettings: Settings = {
		excludedCharacters: [],
		relicRatings: 'actual',
		minRatingPercentage: 50,
		ratingsFormat: 'fraction',
		includeUnreleaseCharacters: false,
		announcement: '',
		doNotShowAnnouncement: false
	};

	let settingsString;

	if (browser) settingsString = localStorage.getItem('settings');

	const res = SettingsSchema.safeParse(settingsString);

	const settings = writable<Settings>(res.success ? res.data : defaultSettings);

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
