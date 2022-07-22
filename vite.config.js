// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite'
// import { optimizeCss } from 'carbon-preprocess-svelte'

/** @type {import('vite').UserConfig} */
const config = {
	// plugins: [sveltekit(), process.env.NODE_ENV === 'production' && optimizeCss()]
	plugins: [sveltekit()],
}

export default config
