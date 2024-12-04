<script lang="ts">
	import { Presentation, Slide, Transition } from '@animotion/core';
	import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
	import { tween } from '@animotion/motion';

	let text: HTMLParagraphElement;

	let { user }: { user: ProfileViewDetailed } = $props();

	let followerCount = tween(0);

	let followsCount = tween(0);
</script>

<Presentation
	options={{ history: true, transition: 'slide', controls: false, progress: true, autoSlide: 2000 }}
	class="bg-base-900"
>
	<Slide class="h-full max-w-screen place-content-center place-items-center">
		<div class="flex items-center gap-4">
			<img src={user.avatar} alt={user.displayName ?? user.handle} class="size-16 rounded-full" />
			<div class="text-base-50 text-4xl font-bold">{user.displayName ?? user.handle}</div>
		</div>
		<p bind:this={text} class="text-accent-500 mt-10 text-3xl font-bold">Your year on bluesky</p>
	</Slide>

	<Slide
		class="h-full max-w-screen place-content-center place-items-center"
		in={() => followerCount.to(user.followersCount ?? 0)}
		out={() => followerCount.to(0)}
	>
		<div class="flex flex-col gap-2">
			<div class="text-accent-500 text-8xl font-bold drop-shadow-xs">
				{Math.round(followerCount.value)}
			</div>
			<div class="text-base-50 text-4xl font-semibold">Followers</div>
		</div>
	</Slide>

	<Slide
		class="h-full max-w-screen place-content-center place-items-center"
		in={() => followsCount.to(user.followsCount ?? 0)}
		out={() => followsCount.to(0)}
	>
		<div class="flex flex-col gap-2">
			<div class="text-accent-500 text-8xl font-bold drop-shadow-xs">
				{Math.round(followsCount.value)}
			</div>
			<div class="text-base-50 text-4xl font-semibold">Follows</div>
		</div>
	</Slide>

	<Slide class="h-full max-w-screen place-content-center place-items-center">
		<div class="flex flex-col gap-2">
			<div class="text-accent-500 text-4xl font-bold drop-shadow-xs">The end (for now)</div>
		</div>
	</Slide>
</Presentation>
