<script lang="ts">
	import {
		getAuthorFeedWithLikes,
		getDidDocument,
		getFollowersOfActor,
		getProfile,
		resolveHandle
	} from '$lib/api';
	import Presentation from './Presentation.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount } from 'svelte';
	import { transformData, type TransformedData } from '$lib/transform';

	let handle = $state('');

	let showPresentation = $state(false);

	let error: string | null = $state(null);

	let loading = $state(false);

	let data: TransformedData | null = $state(null);

	let users: { handle: string; timestamp: number }[] = $state([]);

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

		const apiData = {
			user: loadedUser,
			followers: loadedFollowers.follows,
			authorFeed: authorFeed.feed,
			didInfo
		};
		console.log(data);

		data = transformData(apiData);

		let users = JSON.parse(localStorage.getItem('users') || '[]');
		users = users.filter((user: { handle: string }) => user.handle !== data?.user.handle);
		users.push({ handle: data.user.handle, timestamp: Date.now() });
		localStorage.setItem('users', JSON.stringify(users));
		localStorage.setItem('data-' + data.user.handle, JSON.stringify(data));

		showPresentation = true;
	}

	function showPresentationForUser(handle: string) {
		data = JSON.parse(localStorage.getItem('data-' + handle) || '{}');
		showPresentation = true;
	}

	onMount(async () => {
		let version = localStorage.getItem('version') || '0';
		if (version !== '1') {
			localStorage.clear();
			localStorage.setItem('version', '1');
		}
		// handle = 'flo-bit.dev';
		// loadData();

		// get data from local storage
		users = JSON.parse(localStorage.getItem('users') || '[]');
		if (users.length > 0) {
			let user = users[0];
			data = JSON.parse(localStorage.getItem('data-' + user.handle) || '{}');
			console.log(data);
			if (data) {
				//showPresentation = true;
			}
		}
	});
</script>

{#if !showPresentation}
	<div class="flex h-screen w-full flex-col items-center justify-center">
		<div class="flex w-full max-w-md flex-col gap-4 px-4">
			<div class="text-base-900 dark:text-base-50 text-2xl font-bold">Enter your handle:</div>
			<Input
				type="text"
				id="handle"
				placeholder="handle.bsky.social"
				class="px-3"
				bind:value={handle}
			/>

			<Button onclick={loadData} disabled={loading || !handle}
				>{loading ? 'Loading...' : 'Show Presentation'}</Button
			>
		</div>

		{#if users.length > 0}
			<div class="mt-16 flex w-full max-w-md flex-col gap-4 px-4">
				<div class="text-base-900 dark:text-base-50 text-2xl font-bold">
					generated presentations:
				</div>
				<div class="flex flex-col gap-2">
					{#each users as user}
						<button
							onclick={() => showPresentationForUser(user.handle)}
							class="text-base-900 dark:text-base-50 dark:bg-base-800 bg-base-50 border-base-700 cursor-pointer rounded-full border p-2"
							>{user.handle}</button
						>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else if data}
	<Presentation {data} />
{/if}

<div class="bg-base-900 fixed inset-0 -z-10 h-full w-full">
	<img
		src="/bluesky-wrapped/background.png"
		class="h-full w-full object-cover dark:opacity-10"
		alt=""
	/>
</div>
