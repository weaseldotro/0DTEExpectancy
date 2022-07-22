import { writable } from 'svelte/store'

interface Settings {
	buyingPower: number
	maxDailyDrawdown: number
	stopLoss: number
	days: number
}

export const defaultSettings: Settings = {
	buyingPower: 30000,
	maxDailyDrawdown: 2,
	stopLoss: 320,
	days: 22,
}

export const settings = writable<Settings>()

const settingsKey = 'settings'

export const loadSettings = () => {
	let loadedSettings: Settings
	const valuesFromStorage = localStorage.getItem(settingsKey)
	if (valuesFromStorage !== null) {
		try {
			loadedSettings = JSON.parse(valuesFromStorage)
		} catch {
			loadedSettings = defaultSettings
		}
	} else {
		loadedSettings = defaultSettings
	}

	for (const key in defaultSettings) {
		if (loadedSettings[key] === undefined) {
			loadedSettings[key] = defaultSettings[key]
		}
	}

	settings.set(loadedSettings)

	settings.subscribe((values: Settings) => {
		// console.log('saving settings')
		localStorage.setItem(settingsKey, JSON.stringify(values))
	})
}
