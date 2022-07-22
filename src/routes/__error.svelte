<script context="module" lang="ts">
	export function load({ error, status }) {
		return {
			props: {
				title: `${status}: ${error.message}`,
				error: error,
				status: status,
			},
		}
	}
</script>

<script lang="ts">
	export let title: string
	export let status: number
	export let error: Error

	console.log({ title, status, error })

	if (status == 500 && error.message == 'error loading dynamically imported module') {
		setTimeout(() => {
			window.location.reload()
		}, 3000)
	}
</script>

<h1>{title}</h1>
