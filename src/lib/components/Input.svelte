<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = HTMLInputAttributes;

	let { value = $bindable(), class: className, ...rest }: Props = $props();
</script>

<input
	bind:value
	class={cn(
		'dark:bg-base-950 text-base-900 dark:text-base-100 ring-base-300 dark:ring-base-700 placeholder:text-base-400 dark:placeholder:text-base-600 focus:ring-accent-600 block w-full rounded-full border-0 px-2 py-1.5 ring-1 shadow-sm ring-inset focus:ring-2 focus:ring-inset sm:text-sm/6',
		className
	)}
	{...rest}
/>
