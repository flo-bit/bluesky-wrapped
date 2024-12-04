<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { randomUniform } from 'd3-random';
	import { forceX, forceY, forceManyBody, forceCollide, type SimulationNodeDatum } from 'd3-force';

	import { Chart, Circle, Group, ForceSimulation, Svg } from 'layerchart';
	import { onMount } from 'svelte';
	import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

	import { CircleClipPath } from 'layerchart';

	let { followers }: { followers: ProfileView[] } = $props();

	const k = 600 / 200;
	const r = randomUniform(20, 60);
	const n = 4;
	let randomData: {
		r: number;
		avatar: string | undefined;
		x: number;
		y: number;
	}[] | null = $state(null);

	const groupColor = scaleOrdinal(['red', 'blue', 'green']);

	const xForce = forceX().strength(0.01);
	const yForce = forceY().strength(0.01);
	const collideForce = forceCollide<SimulationNodeDatum & { r: number }>()
		.radius((d) => d.r + 2)
		.iterations(2);

	onMount(() => {
		randomData = randomData ?? followers.filter((f) => f.avatar).map((f, i) => ({
			r: r(),
			avatar: f.avatar,
			x: (Math.random() < 0.5 ? 1 : -1) * (window.innerWidth + i * 60),
			y: (Math.random() < 0.5 ? 1 : -1) * (window.innerHeight + i * 60)
		})).slice(0, 200);
		setInterval(() => {
			active += 3;
		}, 100);
	});

	let active = $state(0);
</script>

<h1>Examples</h1>

{#if randomData?.length > 0}
	<div class="h-screen min-h-[100dvh] w-screen overflow-hidden" >
		<Chart data={randomData}
		>
			<Svg>
				<ForceSimulation
					forces={{
						x: xForce.strength((d, i) => (i < active ? 0.01 : 0)),
						y: yForce.strength((d, i) => (i < active ? 0.01 : 0)),
						collide: collideForce
					}}
					alphaTarget={0.3}
					velocityDecay={0.1}
					let:nodes
				>
					<Group center>
						{#each nodes as node, i}
							<!-- <Group x={node.x} y={node.y} >
								
							</Group> -->
							<CircleClipPath cx={node.x} cy={node.y} r={node.r} let:url>
								<image x={-node.r + node.x} y={-node.r + node.y} href={node.avatar} height={node.r * 2} width={node.r * 2} clip-path={url} />
							</CircleClipPath>
						{/each}
					</Group>
				</ForceSimulation>
			</Svg>
		</Chart>
	</div>
{/if}
