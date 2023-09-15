---
title: Rate Limits, PDS Distribution v3, and More
summary: We're adding some app rate limits that should not affect any human users, but will protect the network against abusive and spammy behavior. We're also rolling out v3 of the PDS distribution, and we share some details on App View proxying.
date: Sep 15, 2023
---

# Developer Updates: Rate Limits, PDS Distribution v3, and More
*Published on: Sep 15, 2023*

To get future blog posts directly in your email, you can now subscribe to Bluesky’s Developer Mailing List [here](https://docs.google.com/forms/d/e/1FAIpQLScWaZof-cBm8rhHbw2yc4je0BYsyhuyZYoSyD1Ugxqd0gVRHA/viewform).

### Adding Rate Limits

Now that we have a better sense of user activity on the network, we’re adding some application rate limits. This helps us keep the network secure — for example, by limiting the number of requests a user or bot can make in a given time period, it prevents bad actors from brute-forcing certain requests and helps us limit spammy behavior. 

We’re adding a rate limit for the number of created actions per DID. **These numbers shouldn’t affect typical Bluesky users**, and won’t affect the majority of developers either, but it will affect prolific bots, such as the ones that follow every user or like every post on the network. The limit is 5,000 points per hour and 35,000 points per day, where:


<table>
  <tr>
   <td><strong>Action Type</strong>
   </td>
   <td><strong>Value</strong>
   </td>
  </tr>
  <tr>
   <td>CREATE
   </td>
   <td>3 points
   </td>
  </tr>
  <tr>
   <td>UPDATE
   </td>
   <td>2 points
   </td>
  </tr>
  <tr>
   <td>DELETE
   </td>
   <td>1 point
   </td>
  </tr>
</table>


To reiterate, these limits should be high enough to affect no human users, but low enough to constrain abusive or spammy bots. We decided to release this new rate limit immediately instead of giving developers an advance notice to secure the network from abusive behavior as soon as possible, especially since bad actors might take this blog post as an open invite!

Per this system, an account may create at most 1,666 records per hour and 11,666 records per day. That means an account can like up to 1,666 records in one hour with no problem. We took our most active human users into account when we set this threshold (you surpassed our expectations!). 

In case you missed it, in [August](https://bsky.app/profile/atproto.com/post/3k5ivi6or4d2r), we added some other rate limits as well. 



* Global limit (aggregated across all routes)
    * Rate limited by IP
    * 3000/5 min
* updateHandle
    * Rate limited by DID
    * 10/5 min
    * 50/day
* createAccount
    * Rate limited by IP
    * 100/5 min
* createSession
    * Rate limited by handle
    * 30/5 min
    * 300/day
* deleteAccount
    * Rate limited by IP
    * 50/5 min
* resetPassword
    * Rate limited by IP
    * 50/5 min

We’ll also return [rate limit headers](https://www.ietf.org/archive/id/draft-polli-ratelimit-headers-02.html) on each response so developers can dynamically adapt to these standards.

In a future update (in about a week), we’re also [lowering](https://github.com/bluesky-social/atproto/pull/1571) the [`applyWrites`](https://atproto.com/lexicons/com-atproto#comatprotorepo) limit from 200 to 10. This function applies a batch transaction of creates, updates, and deletes. This is part of the PDS distribution upgrade to v3 (read more below) — [now that repos are ahistorical](https://atproto.com/blog/repo-sync-update), we no longer need a higher limit to account for batch writes. `applyWrites` is used for transactional writes, and logic that requires more than 10 transactional records is rare.


### PDS Distribution v3

We’re rolling out v3 of the PDS distribution. This shouldn’t be a breaking change, though we will be wiping the PLC sandbox. PDSs in parallel networks should still continue to operate with the new distribution.

Reminder: The PDS distribution auto-updates via the Watchtower companion Docker container, unless you specifically disabled that option. We’re adding the admin `upgradeRepoVersion` endpoint to the upgraded PDS distribution, so PDS admins can also upgrade their repos by hand. 


### Handle Invalidations on App View 

Last month, we began proxying requests to the App View. In our federation architecture, the App View is the piece of the stack that gives you all your views of data, such as profiles and threads. Initially, we started out by serving all of these requests from our `bsky.social` PDS, but proxying these to the App View is one way of scaling our infrastructure to handle many more users on the network. (Read our [federation architecture overview blog post](https://blueskyweb.xyz/blog/5-5-2023-federation-architecture) for more information.)

For some users, this caused an invalid handle error. If you have an invalid handle, the user-facing UI will display this instead of your handle:

![Screenshot of a profile with an invalid handle](/img/blog/invalid-handle.png)

You can use our debugging tool to investigate this: [https://bsky-debug.app/handle](https://bsky-debug.app/handle). Just type your handle in. If it shows no error, please try updating your handle to the same handle you currently have to resolve this issue. 

If the debugging page shows an error for your handle, follow [this guide](https://blueskyweb.xyz/blog/4-28-2023-domain-handle-tutorial) to make sure you set up your handle properly.

If that still isn’t working for you, file a support ticket through the app (“Help” button in the left menu on mobile or right side on desktop) and a Bluesky team member will assist you.


### Subscribe for Developer Updates

You can subscribe to Bluesky’s Developer Mailing List [here](https://docs.google.com/forms/d/e/1FAIpQLScWaZof-cBm8rhHbw2yc4je0BYsyhuyZYoSyD1Ugxqd0gVRHA/viewform) to receive future updates in your email. If you received your invite code from the [developer waitlist](https://atproto.com/blog/call-for-developers), you’re already subscribed. Each email will have the option to unsubscribe.

We’ll continue to publish updates to our [technical blog](https://atproto.com/blog) as well as on the app from [@atproto.com](https://bsky.app/profile/atproto.com).
