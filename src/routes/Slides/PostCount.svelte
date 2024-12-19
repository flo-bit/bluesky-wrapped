<script lang="ts">
	import { Slide } from '@animotion/core';
	import { tween } from '@animotion/motion';
	import type { TransformedData } from '$lib/transform';

	let { data }: { data: TransformedData } = $props();

	let postCount = tween(0);

	$inspect(data);
</script>

<Slide
	class="h-full max-w-screen place-content-center place-items-center"
	in={() => postCount.to(data.basic.postsCount ?? 0)}
	out={() => postCount.to(0)}
>
	<div class="flex flex-col gap-2">
		<div class="text-4xl font-semibold">You shared</div>

		<div class="text-accent-600 text-8xl font-bold drop-shadow-xs">
			{Math.round(postCount.value)}
		</div>
		<div class="text-4xl font-semibold">posts this year!</div>


		<div class="text-2xl mt-32">You must be the oversharer of your friend group.</div>
	</div>
</Slide>
