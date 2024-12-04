<script lang="ts">
	import { getFollowersOfActor, getProfile, resolveHandle } from '$lib/api';
	import type { ProfileView, ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
	import Presentation from './Presentation.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import BeeswarmFollowers from '$lib/components/BeeswarmFollowers.svelte';
	import { onMount } from 'svelte';

	let handle = $state('');

	let showPresentation = $state(false);

	let error: string | null = $state(null);

	let loading = $state(false);

	let data: {
		user: ProfileViewDetailed;
		followers: ProfileView[];
	} | null = $state(null);

	async function loadData() {
		loading = true;
		let did = await resolveHandle({ handle });
		if (!did) {
			error = 'Invalid handle';
			return;
		}
		const followersPromise = getFollowersOfActor({ actor: did, limit: 1000 });
		const userPromise = getProfile({ did });

		const [loadedFollowers, loadedUser] = await Promise.all([followersPromise, userPromise]);

		data = {
			user: loadedUser,
			followers: loadedFollowers.follows
		};
		console.log(data);
		showPresentation = true;
	}

	onMount(() => {
		// handle = 'flo-bit.dev';
		// loadData();
	});
</script>

{#if !showPresentation}
	<div class="bg-base-900 flex h-screen w-full items-center justify-center">
		<div class="flex w-full max-w-md flex-col gap-4 px-4">
			<div class="text-base-50 text-2xl font-bold">Enter your handle:</div>
			<Input
				type="text"
				id="handle"
				placeholder="handle.bsky.social"
				class="px-3"
				bind:value={handle}
			/>

			<Button onclick={loadData} disabled={loading}
				>{loading ? 'Loading...' : 'Show Presentation'}</Button
			>
		</div>
	</div>
{:else if data}
	<Presentation {data} />
{/if}
