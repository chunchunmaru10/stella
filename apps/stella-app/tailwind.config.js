import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			fontFamily: {
				sans: [...defaultTheme.fontFamily.sans, 'DIN']
			},
			colors: {
				primary: {
					50: '#f8f8f8',
					100: '#f1efef',
					200: '#e5e3e3',
					300: '#d3cecf',
					400: '#b8b1b3',
					500: '#958c8e',
					600: '#857d7f',
					700: '#6e6769',
					800: '#5d5758',
					900: '#504c4d',
					950: '#292627'
				},
				gold: {
					light: '#c4a373',
					medium: '#eda13d',
					dark: '#99665f'
				},
				purple: {
					light: '#9c65d7',
					dark: '#3f4064'
				}
			}
		}
	},
	plugins: [
		require('flowbite/plugin'),
		require('tailwind-scrollbar'),
		require('@tailwindcss/typography')
	]
};
