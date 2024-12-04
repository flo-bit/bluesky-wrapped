# bluesky-wrapped

> [!NOTE]  
> Work in progress. Contributions/suggestions welcome! Read more below.

Goal: Allow users to see a presentation of their time this year on bluesky (similar to spotify wrapped).

Should be done by friday, 20th of december.

- Statically rendered page (deployed to github pages)
- Allow sharing of results on bluesky (part of it as an image)
- Preferable no login necessary (not sure if possible)
- maybe: allow video download of presentation?


## Tech stack

- Sveltekit
- Tailwind
- Animotion
- Bun


## Develop

1. Clone repo
2. `bun install`
3. `bun run dev`


## Contributing

Contributions are welcome! Please open an issue if you want to start working on something or have an idea/feature request.

I'm specifically looking for help with:

- Cute drawings
- Music/sound effects

but any contributions are appreciated!


## current state

- setup/deployment done (see current deployment here: https://flo-bit.dev/bluesky-wrapped/)
- some api calls implemented (currently just getting user profile)
- basic presentation page implemented with autoplay + slides for total followers/follows


## Stats ideas

### general

- show total followers/follows (implemented)
- Followers over time
- Likes over time
- How many likes/replies/reposts you got in total
- Your most successful post
- Average number of posts per day
- How long you’ve been on bluesky (“bluesky age”)
- Most active day of the week
- Most active time of day
- Post streak
- Account archetype
- Biggest account that follows you
- number of joined user (you are user #XXX on bluesky)

### connections

- People you engaged most with ("your bluesky squad")
- People who engaged most with you ("your bluesky squad")
- Number of unique people talked to
- Top replies
- Favourite accounts (with most liked posts by you)
- How many posts you liked/replied to/reposted
- most active reply chain (chain in which you wrote a lot of replies)

### content

- Types of post (link, text, image, gif, video percentage/total)
- Most important topic (how to determine this?)
- Most used hashtags
- Longest comment chain
- Replies, quotes, posts percentage (and total)
- Most used words/emojis
- Best photo post
- Emotions of your posts
- Average post length
