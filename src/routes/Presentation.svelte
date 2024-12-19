<script lang="ts">
	import { Presentation, Slide, Transition } from '@animotion/core';
	import type { ProfileView, ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
	import { tween } from '@animotion/motion';
	import BeeswarmFollowers from '$lib/components/BeeswarmFollowers.svelte';
	import FollowerSlide from './FollowerSlide.svelte';
	import type { TransformedData } from '$lib/transform';
	import AccountAge from './Slides/AccountAge.svelte';
	import PostCount from './Slides/PostCount.svelte';
	import GrandTotal from './Slides/GrandTotal.svelte';

	let text: HTMLParagraphElement;

	let { data }: { data: TransformedData } = $props();

	let followerCount = tween(0);

	let followsCount = tween(0);

	$inspect(data);
</script>

<Presentation
	options={{ history: false, transition: 'slide', controls: false, progress: true, autoSlide: 2000 }}
	class="dark:text-base-50 text-base-900"
>
	<Slide class="h-full max-w-screen place-content-center place-items-center px-10" stepDuration={500}>
		<Transition stepDuration={2000}>
			<div class="flex items-center gap-4 dark:text-base-50 text-base-900 text-4xl font-bold">Hey, {data.user.displayName ?? data.user.handle}!</div>
		</Transition>

		<Transition class="flex flex-col items-center gap-4" stepDuration={2000}>
			<div class="flex items-center gap-4 dark:text-base-50 text-base-900 text-2xl mt-8 font-semibold">It's time for your performance review.</div>

			<img src={data.user.avatar} alt={data.user.displayName ?? data.user.handle} class="size-32 rounded-full" />
		</Transition>

		<Transition stepDuration={2000}>
			<div class="flex items-center gap-4 dark:text-base-50 text-base-900 text-2xl mt-8">JK let's talk about your year on Bluesky.</div>
		</Transition>
	</Slide>

	<Slide class="h-full max-w-screen place-content-center place-items-center">
		<div class="text-4xl font-bold">

			We had some great moments together.
		</div>
	</Slide>


	<Slide class="h-full max-w-screen place-content-center place-items-center">
		<div class="text-4xl font-bold">
			With you here, the sky's the limit.
		</div>
	</Slide>

	<AccountAge {data} />

	<PostCount {data} />

	<GrandTotal {data} />
</Presentation>
