<script lang="ts">
	import {
		getAuthorFeedWithLikes,
		getDidDocument,
		getFollowersOfActor,
		getProfile,
		resolveHandle
	} from '$lib/api';
	import type {
		ProfileView,
		ProfileViewDetailed
	} from '@atproto/api/dist/client/types/app/bsky/actor/defs';
	import Presentation from './Presentation.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import BeeswarmFollowers from '$lib/components/BeeswarmFollowers.svelte';
	import { onMount } from 'svelte';
	import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
	import type { Like } from '@atproto/api/dist/client/types/app/bsky/feed/getLikes';
	import { transformData, type APIProfile } from '$lib/transform';

	let handle = $state('');

	let showPresentation = $state(false);

	let error: string | null = $state(null);

	let loading = $state(false);

	let data: APIProfile | null = $state(null);

	async function loadData() {
		loading = true;
		let did = await resolveHandle({ handle });
		if (!did) {
			error = 'Invalid handle';
			return;
		}

		const followersPromise = getFollowersOfActor({ actor: did, limit: 1000 });
		const userPromise = getProfile({ did });

		const authorFeedPromise = getAuthorFeedWithLikes({ actor: did, limit: 1000 });

		const didInfoPromise = getDidDocument({ did });

		const [loadedFollowers, loadedUser, authorFeed, didInfo] = await Promise.all([
			followersPromise,
			userPromise,
			authorFeedPromise,
			didInfoPromise
		]);

		data = {
			user: loadedUser,
			followers: loadedFollowers.follows,
			authorFeed: authorFeed.feed,
			didInfo
		};
		console.log(data);

		// save data to local storage
		localStorage.setItem('data', JSON.stringify(data));

		showPresentation = true;
	}

	onMount(async () => {
		// handle = 'flo-bit.dev';
		// loadData();

		// get data from local storage
		data = JSON.parse(localStorage.getItem('data') || '{}');
		console.log(data);
		if (data) {
			showPresentation = true;
			console.log(transformData(data));
		}
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
