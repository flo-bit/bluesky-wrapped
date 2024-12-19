import type {
	ProfileView,
	ProfileViewDetailed
} from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import type { Like } from '@atproto/api/dist/client/types/app/bsky/feed/getLikes';
import emotionLexicon from './emotion_lexicon.json';
import type { UserDidInfo } from './api';

import vader from 'vader-sentiment';

const lexicon = emotionLexicon as Record<string, string[]>;

export type APIProfile = {
	user: ProfileViewDetailed;
	followers: ProfileView[];
	authorFeed: (FeedViewPost & { likes?: Like[] })[];
	didInfo: UserDidInfo;
};

function tokenize(text: string) {
	// Simple tokenizer that converts text to lowercase and splits on non-word characters
	return text.toLowerCase().match(/\b\w+\b/g);
}

function analyzeEmotion(tweet: string) {
	const words = tokenize(tweet);
	const emotions: Record<string, number> = {};

	if (!words) return {};
	words.forEach((word: string) => {
		if (lexicon[word]) {
			lexicon[word].forEach((emotion) => {
				emotions[emotion] = (emotions[emotion] || 0) + 1;
			});
		}
	});

	return emotions;
}

export function transformData(data: APIProfile) {
	// get basic data, follower count, follows count, post count, name, avatar
	const followersCount = data.user.followersCount;
	const followingCount = data.user.followsCount;

	const postsCount = data.user.postsCount;
	const name = data.user.displayName ?? data.user.handle;
	const avatar = data.user.avatar;

	// get total number of likes
	let totalLikes = 0,
		totalReplies = 0,
		totalReposts = 0,
		totalQuotes = 0;

	const wordCounts = new Map<string, number>();

	// count different types of posts
	let standalonePosts = 0,
		replyPosts = 0,
		repostPosts = 0;

	let textPosts = 0,
		imagePosts = 0,
		videoPosts = 0,
		linkPosts = 0,
		quotePosts = 0;

	const emotions: Record<string, number> = {};

	const weekdayActivity = new Array(7).fill(0);
	const hourActivity = new Array(24).fill(0);

	let bestPost: FeedViewPost | undefined = undefined;
	let bestPostInteractionCount = 0;

	const accounts = new Map<string, ProfileView>();
	const likesPerAccount = new Map<string, number>();

	const sentiments = { pos: 0, neu: 0, neg: 0, compound: 0 };
	let sentimentCount = 0;

	for (const post of data.authorFeed) {
		// skip post if it was created before the year 2024
		if (
			post.post.record?.createdAt &&
			new Date(post.post.record?.createdAt) < new Date('2024-01-01')
		)
			continue;

		totalLikes += post.post.likeCount ?? 0;
		totalReplies += post.post.replyCount ?? 0;
		totalReposts += post.post.repostCount ?? 0;
		totalQuotes += post.post.quoteCount ?? 0;

		const interactionCount =
			(post.post.likeCount ?? 0) +
			(post.post.replyCount ?? 0) +
			(post.post.repostCount ?? 0) +
			(post.post.quoteCount ?? 0);

		for (const like of post.likes ?? []) {
			accounts.set(like.actor.did, like.actor);
			likesPerAccount.set(like.actor.did, (likesPerAccount.get(like.actor.did) ?? 0) + 1);
		}

		if (
			(!bestPost || interactionCount > bestPostInteractionCount) &&
			post.reason?.$type !== 'app.bsky.feed.defs#reasonRepost'
		) {
			bestPost = post;
			bestPostInteractionCount = interactionCount;
		}

		const date = new Date(post.post.indexedAt);
		const day = date.getDay();
		weekdayActivity[day]++;

		const hour = date.getHours();
		hourActivity[hour]++;

		if (post.reply) {
			replyPosts++;
		} else if (post.reason?.$type === 'app.bsky.feed.defs#reasonRepost') {
			repostPosts++;
		} else {
			standalonePosts++;
		}

		if (post.post?.embed?.$type === 'app.bsky.embed.record') {
			quotePosts++;
		} else if (post.post?.embed?.$type === 'app.bsky.embed.images#view') {
			imagePosts++;
		} else if (post.post?.embed?.$type === 'app.bsky.embed.video#view') {
			videoPosts++;
		} else if (post.post?.embed?.$type === 'app.bsky.embed.external#view') {
			linkPosts++;
		} else {
			textPosts++;
		}

		// @ts-expect-error - hmm?
		if (post.post?.record?.text) {
			// @ts-expect-error - hmm?
			const text = post.post.record.text;
			const words = tokenize(text);

			for (const word of words ?? []) {
				if (word.length > 15) continue;
				wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
			}

			const emotionsOfText = analyzeEmotion(text);
			for (const emotion in emotionsOfText) {
				emotions[emotion] = (emotions[emotion] ?? 0) + emotionsOfText[emotion];
			}

			const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(text);

			sentiments.pos += sentiment.pos;
			sentiments.neu += sentiment.neu;
			sentiments.neg += sentiment.neg;
			sentiments.compound += sentiment.compound;
			sentimentCount++;
		}
	}

	sentiments.pos /= sentimentCount;
	sentiments.neu /= sentimentCount;
	sentiments.neg /= sentimentCount;
	sentiments.compound /= sentimentCount;

	// get 10 biggest fans
	const biggestFans = Array.from(likesPerAccount.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([did, count]) => {
			return {
				likes: count,
				actor: accounts.get(did)
			};
		});

	if (bestPost) bestPost.interactionCount = bestPostInteractionCount;

	const totalPostTypes = standalonePosts + replyPosts + repostPosts;
	const totalContentTypes = textPosts + imagePosts + videoPosts + linkPosts + quotePosts;

	const mostCommonWords = Array.from(wordCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 100);

	let signUpDate: Date | undefined = undefined;

	if (data.didInfo?.audit?.length > 0) {
		signUpDate = new Date(data.didInfo.audit[0].createdAt);
	}

	const daysSinceSignUp = signUpDate
		? Math.floor((Date.now() - signUpDate.getTime()) / (1000 * 60 * 60 * 24))
		: undefined;

	const minutesSinceSignUp = signUpDate
		? Math.floor((Date.now() - signUpDate.getTime()) / (1000 * 60))
		: undefined;

	const averagePostsPerDay = daysSinceSignUp ? (postsCount ?? 0) / daysSinceSignUp : undefined;

	const averageLikesPerDay = daysSinceSignUp ? (totalLikes ?? 0) / daysSinceSignUp : undefined;

	const averageLikesPerPost = totalLikes ? (totalLikes ?? 0) / (postsCount ?? 0) : undefined;

	const averageRepliesPerPost = totalReplies ? (totalReplies ?? 0) / (postsCount ?? 0) : undefined;

	const mostActiveDay = weekdayActivity.indexOf(Math.max(...weekdayActivity));
	const mostActiveHour = hourActivity.indexOf(Math.max(...hourActivity));

	return {
		basic: {
			followersCount,
			followingCount,
			postsCount,
			name,
			avatar
		},

		totals: {
			totalLikes,
			totalReplies,
			totalReposts,
			totalQuotes
		},

		bestPost,

		postTypes: {
			counts: {
				standalonePosts,
				replyPosts,
				repostPosts
			},

			percentages: {
				standalonePosts: (standalonePosts / totalPostTypes) * 100,
				replyPosts: (replyPosts / totalPostTypes) * 100,
				repostPosts: (repostPosts / totalPostTypes) * 100
			}
		},

		contentTypes: {
			counts: {
				textPosts,
				imagePosts,
				videoPosts,
				linkPosts,
				quotePosts
			},

			percentages: {
				textPosts: (textPosts / totalContentTypes) * 100,
				imagePosts: (imagePosts / totalContentTypes) * 100,
				videoPosts: (videoPosts / totalContentTypes) * 100,
				linkPosts: (linkPosts / totalContentTypes) * 100,
				quotePosts: (quotePosts / totalContentTypes) * 100
			}
		},
		words: {
			wordCounts,
			mostCommonWords
		},
		emotions,
		sentiments,
		signUp: {
			daysSinceSignUp,
			minutesSinceSignUp,
			signUpDate
		},
		averages: {
			averagePostsPerDay,
			averageLikesPerDay,
			averageLikesPerPost,
			averageRepliesPerPost
		},
		activity: {
			weekdayActivity,
			hourActivity,
			mostActiveDay,
			mostActiveHour
		},
		biggestFans,
		...data
	};
}

export type TransformedData = ReturnType<typeof transformData>;