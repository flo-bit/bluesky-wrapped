import { AtpBaseClient, type Agent } from '@atproto/api'
import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'

type AgentType = Agent | AtpBaseClient | null

export async function getCustomFeed({
	feed,
	agent = undefined,
	cursor,
	limit = 10
}: {
	feed: string
	agent?: AgentType
	cursor?: string
	limit?: number
}) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://api.bsky.app' })
	}
	const { data } = await agent.app.bsky.feed.getFeed({ feed, limit, cursor })

	return { feed: data.feed, cursor: data.cursor }
}

export async function getFollowingFeed({
	agent,
	cursor,
	limit = 10
}: {
	agent: Agent
	cursor?: string
	limit?: number
}) {
	const { data } = await agent.getTimeline({ cursor, limit })
	return { feed: data.feed, cursor: data.cursor }
}

export async function getFollowsOfActor({
	actor,
	cursor,
	limit = 10,
	agent = undefined
}: {
	actor: string
	cursor?: string
	limit?: number
	agent?: AgentType
}) {
	const allFollows: ProfileView[] = []
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://api.bsky.app' })
	}

	const perLimit = limit > 100 ? 100 : limit
	do {
		let follows
		if (agent instanceof AtpBaseClient) {
			follows = await agent.app.bsky.graph.getFollows({
				actor,
				limit: perLimit,
				cursor
			})
		} else {
			follows = await agent.getFollows({ actor, limit: perLimit, cursor })
		}

		allFollows.push(...follows.data.follows)
		cursor = follows.data.cursor
	} while (cursor && allFollows.length < limit)
	return { follows: allFollows, cursor }
}

export async function getPostsOfUser({
	actor,
	agent = undefined,
	cursor,
	limit = 10
}: {
	actor: string
	agent?: AgentType
	cursor?: string
	limit?: number
}) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://api.bsky.app' })
	}

	const perLimit = limit > 100 ? 100 : limit
	const posts: FeedViewPost[] = []
	do {
		if (agent instanceof AtpBaseClient) {
			const { data } = await agent.app.bsky.feed.getAuthorFeed({ actor, cursor, limit: perLimit })
			posts.push(...data.feed)
			cursor = data.cursor
		} else {
			const { data } = await agent.getAuthorFeed({ actor, cursor, limit: perLimit })
			posts.push(...data.feed)
			cursor = data.cursor
		}
	} while (cursor && posts.length < limit)
	return { feed: posts, cursor }
}

export async function searchPosts({
	query,
	agent = undefined,
	cursor
}: {
	query: string
	agent?: AgentType
	cursor?: string
}) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://api.bsky.app' })
	}

	const { data } = await agent.app.bsky.feed.searchPosts({ q: query, cursor })
	return { feed: data.posts.map((post) => ({ post })), cursor: data.cursor }
}

export async function resolveHandle({
	handle,
	agent = undefined
}: {
	handle: string
	agent?: AgentType
}) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://api.bsky.app' })
	}

	const data = await agent.com.atproto.identity.resolveHandle({ handle })
	return data.data.did
}

export async function getProfile({ did, agent = undefined }: { did: string; agent?: AgentType }) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://api.bsky.app' })
	}

	const { data } = await agent.app.bsky.actor.getProfile({ actor: did })
	return data
}

export async function likePost({ agent, uri, cid }: { agent: Agent; uri: string; cid: string }) {
	await agent.like(uri, cid)
}
