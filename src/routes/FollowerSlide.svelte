<script lang="ts">
	import BeeswarmFollowers from '$lib/components/BeeswarmFollowers.svelte';

	import { Slide } from '@animotion/core';
	import { tween } from '@animotion/motion';
	import type {
		ProfileView,
		ProfileViewDetailed
	} from '@atproto/api/dist/client/types/app/bsky/actor/defs';

	let {
		data
	}: {
		data: {
			user: ProfileViewDetailed;
			followers: ProfileView[];
		};
	} = $props();

	let followerCount = tween(0);

	let showGraph = $state(false);
</script>

<Slide
	stepDuration={10000}
	class="h-full max-w-screen place-content-center place-items-center relative"
	in={() => {
		followerCount.to(data.user.followersCount ?? 0, {
			duration: 8500,
			delay: 500
		});
		showGraph = true;
	}}
	out={() => {
		followerCount.to(0);
		showGraph = false;
	}}
>
	{#if showGraph}
		<BeeswarmFollowers followers={data.followers} />
	{/if}
	<div class="flex flex-col gap-2 absolute inset-0 place-content-center place-items-center">
		<div class="p-4 rounded-xl bg-base-900/50 backdrop-blur-sm">
		<div class="text-accent-500 text-8xl font-bold drop-shadow-xs">
			{Math.round(followerCount.value)}
		</div>
		<div class="text-base-50 text-4xl font-semibold">Followers</div>
	</div>
	</div>
</Slide>
