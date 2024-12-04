import { RichText } from '@atproto/api';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const escapeMap: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

export const escapeHTML = (str?: string) =>
	str?.replace(/[&<>"']/g, (match) => escapeMap[match] || match) ?? '';

export function renderPostAsHtml(post?: PostView) {
	if (!post?.record) {
		return '';
	}
	const rt = new RichText(post.record as any);
	let html = '';
	const linkStart = '<a target="_blank" rel="noopener noreferrer nofollow"';
	for (const segment of rt.segments()) {
		if (!segment) continue;
		if (segment.isLink()) {
			html += `${linkStart}$ href="${escapeHTML(segment.link?.uri)}">${escapeHTML(segment.text)}</a>`;
		} else if (segment.isMention()) {
			html += `${linkStart} href="https://bsky.app/profile/${escapeHTML(
				segment.mention?.did
			)}">${escapeHTML(segment.text)}</a>`;
		} else if (segment.isTag()) {
			html += `${linkStart} href="https://bsky.app/hashtag/${escapeHTML(
				segment.tag?.tag
			)}">#${escapeHTML(segment.tag?.tag)}</a>`;
		} else {
			html += escapeHTML(segment.text);
		}
	}
	return html;
}

export function numberToHumanReadable(number: number) {
	if (number < 1000) {
		return number;
	}
	if (number < 1000000) {
		return `${Math.floor(number / 1000)}k`;
	}
	return `${Math.floor(number / 1000000)}m`;
}
