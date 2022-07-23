import { writable } from 'svelte/store'

interface Settings {
	buyingPower: number
	maxDailyDrawdown: number
	stopLoss: number
	days: number
	highlight: string | null
}

export const defaultSettings: Settings = {
	buyingPower: 30000,
	maxDailyDrawdown: 2,
	stopLoss: 320,
	days: 22,
	highlight: null
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

	const urlParams = new URLSearchParams(window.location.search ? window.location.search.substring(1) : '')
	for (const key in defaultSettings) {
		if (loadedSettings[key] === undefined) {
			loadedSettings[key] = defaultSettings[key]
		}

		if (urlParams.get(key)) {
			loadedSettings[key] = urlParams.get(key)
			if (typeof defaultSettings[key] == 'number') {
				loadedSettings[key] = parseFloat(loadedSettings[key])
			}
		}
	}

	settings.set(loadedSettings)

	settings.subscribe((values: Settings) => {
		let params = new URLSearchParams()
		for (const [k, v] of Object.entries(values)) {
			if (v) {
				params.append(k, v)
			}
		}

		let newURL = window.location.href
		if (newURL.includes('?')) {
			newURL = newURL.substring(0, newURL.indexOf('?'))
		}
		if (params.toString() !== '') {
			newURL += '?' + params.toString()
		}
		history.replaceState(newURL, newURL, newURL)
		localStorage.setItem(settingsKey, JSON.stringify(values))
	})
}
