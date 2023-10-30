---
title: app.bsky
summary: app.bsky Lexicons
---
# app.bsky Lexicons

The links in this page redirect you to the canonical `app.bsky` lexicons in the TypeScript implementation of atproto. These are subject to change — we may modify and add lexicons over the course of protocol development. The most up-to-date version of all lexicons are in the [atproto repository](https://github.com/bluesky-social/atproto) itself.

## app.bsky.actor

Definitions related to "actors," a general term for users in Bluesky.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.defs<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/defs.json"> 🔗</a> </h3>
    </summary>
    <p>A reference to an actor in the network, including profile view and content preferences.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.profile<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/profile.json"> 🔗</a> </h3>
    </summary>
    <p>A reference to an actor's profile in the network, including display name and avatar.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.getProfile<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/getProfile.json"> 🔗</a> </h3>
    </summary>
    <p>Get a profile for an actor.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.getProfiles<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/getProfiles.json"> 🔗</a> </h3>
    </summary>
    <p>Get profiles for a list of actors.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.getSuggestions<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/getSuggestions.json"> 🔗</a> </h3>
    </summary>
    <p>Get a list of actors suggested for following. Used in discovery UIs.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.searchActors<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/searchActors.json"> 🔗</a> </h3>
    </summary>
    <p>Find actors matching search criteria.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.searchActorsTypeahead<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/searchActorsTypeahead.json"> 🔗</a> </h3>
    </summary>
    <p>Find actor suggestions for a search term.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.putPreferences<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/putPreferences.json"> 🔗</a> </h3>
    </summary>
    <p>Sets the private preferences attached to the account.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.actor.getPreferences<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/getPreferences.json"> 🔗</a> </h3>
    </summary>
    <p>Get private preferences attached to the account.</p>
</details>

## app.bsky.embed

Definitions related to "embeds," content which is embedded within other records (e.g. links or images in posts).

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.embed.external<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/external.json"> 🔗</a> </h3>
    </summary>
    <p>A representation of some externally linked content, embedded in another form of content.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.embed.images<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/images.json"> 🔗</a> </h3>
    </summary>
    <p>A set of images embedded in some other form of content.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.embed.record<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/record.json"> 🔗</a> </h3>
    </summary>
    <p>A representation of a record embedded in another form of content</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.embed.recordWithMedia<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/recordWithMedia.json"> 🔗</a> </h3>
    </summary>
    <p>A representation of a record embedded in another form of content, alongside other compatible embeds.</p>
</details>

## app.bsky.feed

Definitions related to content & activity published in Bluesky.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.defs<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/defs.json"> 🔗</a> </h3>
    </summary>
    <p>A reference to a feed.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.describeFeedGenerator<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/describeFeedGenerator.json"> 🔗</a> </h3>
    </summary>
    <p>Returns information about a given feed generator including TOS & offered feed URIs.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.generator<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/generator.json"> 🔗</a> </h3>
    </summary>
    <p>A declaration of the existence of a feed generator.</p>
</details>


<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getActorFeeds<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getActorFeeds.json"> 🔗</a> </h3>
    </summary>
    <p>Retrieve a list of feeds created by a given actor.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getActorLikes<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getActorLikes.json"> 🔗</a> </h3>
    </summary>
    <p>A view of the posts liked by an actor.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getAuthorFeed<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getAuthorFeed.json"> 🔗</a> </h3>
    </summary>
    <p>A view of an actor's feed.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getFeed<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getFeed.json"> 🔗</a> </h3>
    </summary>
    <p>Compose and hydrate a feed from a user's selected feed generator.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getFeedGenerator<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getFeedGenerator.json"> 🔗</a> </h3>
    </summary>
    <p>Get information about a specific feed offered by a feed generator, such as its online status.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getFeedGenerators<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getFeedGenerators.json"> 🔗</a> </h3>
    </summary>
    <p>Get information about a list of feed generators.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getFeedSkeleton<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getFeedSkeleton.json"> 🔗</a> </h3>
    </summary>
    <p>A skeleton of a feed provided by a feed generator.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getLikes<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getLikes.json"> 🔗</a> </h3>
    </summary>
    <p>Return the likes on a given object.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getPostThread<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getPostThread.json"> 🔗</a> </h3>
    </summary>
    <p>Return a thread of posts.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getPosts<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getPosts.json"> 🔗</a> </h3>
    </summary>
    <p>A view of an actor's feed.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getRepostedBy<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getRepostedBy.json"> 🔗</a> </h3>
    </summary>
    <p>Return a list of actors that reposted an object.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getSuggestedFeeds<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getSuggestedFeeds.json"> 🔗</a> </h3>
    </summary>
    <p>Get a list of suggested feeds for the viewer.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.getTimeline<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getTimeline.json"> 🔗</a> </h3>
    </summary>
    <p>A view of the user's home timeline.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.like<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/like.json"> 🔗</a> </h3>
    </summary>
    <p>Definition for a like.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.post<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json"> 🔗</a> </h3>
    </summary>
    <p>Definition for a post.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.feed.repost<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/repost.json"> 🔗</a> </h3>
    </summary>
    <p>Definition for a repost.</p>
</details>

## app.bsky.graph

Definitions related to the social graph in Bluesky.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.block<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/block.json"> 🔗</a> </h3>
    </summary>
    <p>Definition of a block.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.defs<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/defs.json"> 🔗</a> </h3>
    </summary>
    <p>A reference to a graph.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.follow<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/follow.json"> 🔗</a> </h3>
    </summary>
    <p>Definition of a social follow.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getBlocks<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getBlocks.json"> 🔗</a> </h3>
    </summary>
    <p>Returns who the requester account is blocking.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getFollowers<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getFollowers.json"> 🔗</a> </h3>
    </summary>
    <p>Returns a list of followers for an actor.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getFollows<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getFollows.json"> 🔗</a> </h3>
    </summary>
    <p>Returns a list of who an actor follows.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getList<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getList.json"> 🔗</a> </h3>
    </summary>
    <p>Fetch a list of actors.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getListBlocks<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getListBlocks.json"> 🔗</a> </h3>
    </summary>
    <p>Returns which lists the requester's account is blocking.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getListMutes<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getListMutes.json"> 🔗</a> </h3>
    </summary>
    <p>Returns which lists the requester's account is muting.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getLists<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getLists.json"> 🔗</a> </h3>
    </summary>
    <p>Fetch a list of lists that belong to an actor.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getMutes<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getMutes.json"> 🔗</a> </h3>
    </summary>
    <p>Returns who the viewer mutes.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.getSuggestedFollowsByActor<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/getSuggestedFollowsByActor.json"> 🔗</a> </h3>
    </summary>
    <p>Get suggested follows related to a given actor..</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.list<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/list.json"> 🔗</a> </h3>
    </summary>
    <p>A declaration of a list of actors.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.listblock<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/listblock.json"> 🔗</a> </h3>
    </summary>
    <p>A block of an entire list of actors..</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.listitem<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/listitem.json"> 🔗</a> </h3>
    </summary>
    <p>An item under a declared list of actors.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.muteActor<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/muteActor.json"> 🔗</a> </h3>
    </summary>
    <p>Mute an actor by did or handle..</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.muteActorList<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/muteActorList.json"> 🔗</a> </h3>
    </summary>
    <p>Mute a list of actors.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.unmuteActor<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/unmuteActor.json"> 🔗</a> </h3>
    </summary>
    <p>Unmute an actor by did or handle.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.graph.unmuteActorList<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/graph/unmuteActorList.json"> 🔗</a> </h3>
    </summary>
    <p>Unmute a list of actors.</p>
</details>

## app.bsky.notification

Definitions related to notifications.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.notification.getUnreadCount<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/notification/getUnreadCount.json"> 🔗</a> </h3>
    </summary>
    <p>Get the number of unread notifications.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.notification.listNotifications<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/notification/listNotifications.json"> 🔗</a> </h3>
    </summary>
    <p>Return a list of notifications.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.notification.registerPush<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/notification/registerPush.json"> 🔗</a> </h3>
    </summary>
    <p>Register for push notifications with a service.</p>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.notification.updateSeen<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/notification/updateSeen.json"> 🔗</a> </h3>
    </summary>
    <p>Notify server that the user has seen notifications.</p>
</details>

## app.bsky.richtext

Definitions for rich text.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline">app.bsky.richtext.facet<a class='url-link' href="https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/richtext/facet.json"> 🔗</a> </h3>
    </summary>
    <p>Definition for a facet.</p>
</details>
