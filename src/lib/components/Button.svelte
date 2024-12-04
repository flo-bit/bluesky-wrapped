<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type ButtonProps = {
		children: any;
	} & HTMLButtonAttributes;

	let { children, class: className, ...rest }: ButtonProps = $props();
</script>

<button
	class={cn(
		'bg-accent-600 hover:bg-accent-500 focus-visible:outline-accent-600 inline-flex w-full justify-center rounded-full px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...rest}
>
	{@render children()}
</button>
