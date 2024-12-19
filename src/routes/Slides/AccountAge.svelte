<script lang="ts">
	import { Slide } from '@animotion/core';
	import { tween } from '@animotion/motion';
	import type { TransformedData } from '$lib/transform';

	let { data }: { data: TransformedData } = $props();

	let accountAge = tween(0);

	$inspect(data);
</script>

<Slide
	class="h-full max-w-screen place-content-center place-items-center"
	in={() => accountAge.to(data.signUp.daysSinceSignUp ?? 0)}
	out={() => accountAge.to(0)}
>
	<div class="flex flex-col gap-2 px-10">
		<div class="text-4xl font-semibold text-pretty">You've been here for</div>

		<div class="text-accent-500 text-8xl font-bold drop-shadow-xs">
			{Math.round(accountAge.value)}
		</div>
		<div class="text-4xl font-semibold">days!</div>

		<div class="text-2xl mt-32">Time flies when you're sharing all your thoughts on the internet!</div>
	</div>
</Slide>
