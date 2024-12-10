import { AtpBaseClient, type Agent } from '@atproto/api';
import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import type { Like } from '@atproto/api/dist/client/types/app/bsky/feed/getLikes';

type AgentType = Agent | AtpBaseClient | null;

const agent = new AtpBaseClient({ service: 'https://api.bsky.app' });

export async function getCustomFeed({
	feed,
	cursor,
	limit = 10
}: {
	feed: string;
	cursor?: string;
	limit?: number;
}) {
	const { data } = await agent.app.bsky.feed.getFeed({ feed, limit, cursor });

	return { feed: data.feed, cursor: data.cursor };
}

export async function getFollowsOfActor({
	actor,
	cursor,
	limit = 10
}: {
	actor: string;
	cursor?: string;
	limit?: number;
}) {
	const allFollows: ProfileView[] = [];

	const perLimit = limit > 100 ? 100 : limit;
	do {
		const follows = await agent.app.bsky.graph.getFollows({
			actor,
			limit: perLimit,
			cursor
		});

		allFollows.push(...follows.data.follows);
		cursor = follows.data.cursor;
	} while (cursor && allFollows.length < limit);
	return { follows: allFollows, cursor };
}

export async function getFollowersOfActor({
	actor,
	cursor,
	limit = 10
}: {
	actor: string;
	cursor?: string;
	limit?: number;
}) {
	const allFollowers: ProfileView[] = [];

	const perLimit = limit > 100 ? 100 : limit;
	do {
		const follows = await agent.app.bsky.graph.getFollowers({
			actor,
			limit: perLimit,
			cursor
		});

		allFollowers.push(...follows.data.followers);
		cursor = follows.data.cursor;
	} while (cursor && allFollowers.length < limit);
	return { follows: allFollowers, cursor };
}

export async function getPostsOfUser({
	actor,
	cursor,
	limit = 10
}: {
	actor: string;
	cursor?: string;
	limit?: number;
}) {
	const perLimit = limit > 100 ? 100 : limit;
	const posts: FeedViewPost[] = [];
	do {
		const { data } = await agent.app.bsky.feed.getAuthorFeed({ actor, cursor, limit: perLimit });
		posts.push(...data.feed);
		cursor = data.cursor;
	} while (cursor && posts.length < limit);
	return { feed: posts, cursor };
}

export async function getAuthorFeedWithLikes({
	actor,
	cursor,
	limit = 10
}: {
	actor: string;
	cursor?: string;
	limit?: number;
}): Promise<{ feed: (FeedViewPost & { likes?: Like[] })[]; cursor?: string }> {
	const perLimit = limit > 100 ? 100 : limit;
	const posts: (FeedViewPost & { likes?: Like[] })[] = [];

	const likesPromises: Record<string, Promise<Like[]>> = {};
	do {
		const { data } = await agent.app.bsky.feed.getAuthorFeed({ actor, cursor, limit: perLimit });
		posts.push(...data.feed);
		// start getting likes of posts
		for (const post of data.feed) {
			likesPromises[post.post.uri] = getLikesOfPost({ uri: post.post.uri, limit: 500 });
		}
		cursor = data.cursor;
	} while (cursor && posts.length < limit);

	// await all promises
	await Promise.all(Object.values(likesPromises));

	for (const post of posts) {
		post.likes = await likesPromises[post.post.uri];
	}

	return { feed: posts, cursor };
}

export async function getLikesOfPost({
	uri,
	limit = 100,
	cursor
}: {
	uri: string;
	limit?: number;
	cursor?: string;
}) {
	const likes: Like[] = [];

	const perLimit = limit > 100 ? 100 : limit;
	do {
		const { data } = await agent.app.bsky.feed.getLikes({ uri, limit: perLimit, cursor });
		likes.push(...data.likes);
		cursor = data.cursor;
	} while (cursor && likes.length < limit);
	return likes;
}

export async function searchPosts({
	query,
	agent = undefined,
	cursor
}: {
	query: string;
	agent?: AgentType;
	cursor?: string;
}) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://api.bsky.app' });
	}

	const { data } = await agent.app.bsky.feed.searchPosts({ q: query, cursor });
	return { feed: data.posts.map((post) => ({ post })), cursor: data.cursor };
}

export async function resolveHandle({ handle }: { handle: string }) {
	const data = await agent.com.atproto.identity.resolveHandle({ handle });
	return data.data.did;
}

export async function getProfile({ did }: { did: string }) {
	const { data } = await agent.app.bsky.actor.getProfile({ actor: did });
	return data;
}

export async function likePost({ agent, uri, cid }: { agent: Agent; uri: string; cid: string }) {
	await agent.like(uri, cid);
}

export async function getFollowingFeed({
	agent,
	cursor,
	limit = 10
}: {
	agent: Agent;
	cursor?: string;
	limit?: number;
}) {
	const { data } = await agent.getTimeline({ cursor, limit });
	return { feed: data.feed, cursor: data.cursor };
}

type DidDocument = {
	'@context': string[];
	id: string;
	alsoKnownAs?: string[];
	verificationMethod?: {
		id: string;
		type: string;
		controller: string;
		publicKeyMultibase?: string;
	}[];
	service?: { id: string; type: string; serviceEndpoint: string }[];
};

export type AuditRecord = {
	did: string;
	operation:
		| {
				type: 'create';
				signingKey: string;
				recoveryKey: string;
				handle: string;
				service: string;
				prev: string | null;
				sig: string;
		  }
		| {
				type: 'plc_operation';
				sig: string;
				prev: string;
				services: any;
				alsoKnownAs: string[];
				rotationKeys: string[];
				verificationMethods: {
					atproto: string;
				};
		  }
		| {
				type: 'plc_tombstone';
				sig: string;
				prev: string;
		  };
	cid: string;
	nullified: boolean;
	createdAt: string;
};

export type UserDidInfo = {
	isBskyHost: boolean;
	serviceEndpoint: string;
	doc: DidDocument;
	audit: AuditRecord[];
	didDomain: string | null;
};

export async function getDidDocument({ did }: { did: string }): Promise<UserDidInfo> {
	let doc: DidDocument, audit: AuditRecord[], didDomain: string | null;
	if (did.startsWith('did:plc:')) {
		didDomain = null;

		doc = (await fetch(`https://plc.directory/${did}`, {
			cache: 'no-store'
		}).then((res) => res.json())) as DidDocument;

		audit = (await fetch(`https://plc.directory/${did}/log/audit`, {
			cache: 'no-store'
		}).then((res) => res.json())) as AuditRecord[];
	} else if (did.startsWith('did:web:')) {
		didDomain = did.split(':', 3)[2];

		doc = (await fetch(`https://${didDomain}/.well-known/did.json`, {
			cache: 'no-store'
		}).then((res) => res.json())) as DidDocument;

		audit = [];
	} else {
		throw Error('unsupported DID method');
	}

	const pds = doc.service?.findLast((s) => s.type === 'AtprotoPersonalDataServer');

	let serviceEndpoint = pds?.serviceEndpoint ?? '???';

	let isBskyHost = false;

	if (pds?.serviceEndpoint.endsWith('host.bsky.network')) {
		isBskyHost = true;
		const mushroom = serviceEndpoint.replace('https://', '').split('.').shift()!;
		serviceEndpoint = mushroom;
	}

	return { isBskyHost, serviceEndpoint, doc, audit, didDomain };
}
