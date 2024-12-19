<script lang="ts">
	import { Slide } from '@animotion/core';
	import { tween } from '@animotion/motion';
	import type { TransformedData } from '$lib/transform';

	let { data }: { data: TransformedData } = $props();

	let likesCount = tween(0);
	let repostsCount = tween(0);
	let repliesCount = tween(0);

	$inspect(data);
</script>

<Slide
	class="h-full max-w-screen place-content-center place-items-center"
	in={() => {
		likesCount.to(data.totals.totalLikes ?? 0);
		repliesCount.to(data.totals.totalReplies ?? 0);
		repostsCount.to(data.totals.totalReposts ?? 0);
	}}
	out={() => {
		likesCount.to(0);
		repliesCount.to(0);
		repostsCount.to(0);
	}}
>
	<div class="flex flex-col gap-2">
		<div class="text-5xl font-bold">You got a grand total of</div>

		<div>
			<span class="text-accent-600 text-8xl font-bold drop-shadow-xs"
				>{Math.round(likesCount.value)}</span
			> <span class="text-4xl font-semibold">likes</span>
		</div>

		<div>
			<span class="text-accent-600 text-8xl font-bold drop-shadow-xs"
				>{Math.round(repliesCount.value)}</span
			> <span class="text-4xl font-semibold">replies</span>
		</div>
		

		<div>
			<span class="text-accent-600 text-8xl font-bold drop-shadow-xs"
				>{Math.round(repostsCount.value)}</span
			> <span class="text-4xl font-semibold">reposts</span>
		</div>

		<div class="mt-32 text-2xl">If only you had a nickle...</div>
	</div>
</Slide>
