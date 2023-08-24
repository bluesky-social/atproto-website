---
title: Updates to Repository Sync Semantics
summary: Test
date: Aug 24, 2023
---
# Updates to Repository Sync Semantics
*Published on: Aug 24, 2023*

We’re excited to announce that we’re rolling out a new version of atproto [repositories](https://atproto.com/guides/data-repos) that removes history from the canonical structure of repositories, and replaces it with a logical clock. We’ll start rolling out this update next week (July 28, 2023).

For most developers with projects subscribed to the [firehose](https://atproto.com/community/projects#firehose), such as feed generators, this change shouldn’t affect you. These will only affect you if you’re doing commit-aware repo sync (a good rule of thumb is if you’ve ever passed `earliest` or `latest` to the `com.atproto.sync.getRepo` method) or are explicitly checking the repo version when processing commits.

### Removing Repository History 

Repositories on the AT Protocol are like Git repositories, but for structured records. Just like Git, each commit to an atproto repository currently includes a pointer to the previous commit. However, this approach has caused a couple of pain points:

* **Record deletions are difficult to process.** If a user deletes a record, that commit needs to be erased from their repository to match their intent. 
* **Increased storage cost.** Maintaining repo history can cause anywhere from a 5-10x increase in repo size.

We attempted to resolve both of these in the current model through rebases (discrete moments when the history of a repository is deleted/mutated, like in Git). However, this is a tricky and sensitive operation that is expensive to conduct and complex to communicate across the network.

### Using a Logical Clock for Repositories 

To address the above issues, we’re replacing the `prev` pointer in commits with a logical clock. We originally published our intention to do so a [few weeks ago](https://github.com/bluesky-social/atproto/discussions/1410). These are the changes we’re making to the way we handle repository history: 

* Incrementing the repo version to `3`
* Making the `prev` field on repo commits optional
* Adding a new required `rev` (revision) field which is a [logical clock](https://en.wikipedia.org/wiki/Logical_clock)
* Removing or adjusting commit-aware repo sync mechanisms

Note: If you explicitly verify the version of a repo commit or do strict type checking on commit repo commits (which you shouldn’t — the spec allows unspecified fields!), you will need to make that check inclusive of version 3.

To facilitate backwards compatibility with software that is still running repo v2, we will continue setting the prev field on commits in the interim.

Even though we are setting the prev field, this can be considered a “hint” and the history is no longer considered a canonical part of the repository.

---

## Repository Revisions

The new sync semantics for the repository rely on a logical clock included in each signed commit. 

This “revision” takes the form of a [TID](https://atproto.com/specs/record-key#record-key-type-tid) and must be monotonically increasing.

The included revision serves a few functions:

### Ordering

The clock provides a simple ordering mechanism for encountered repos or commits. If a consumer encounters the same repo from two different sources, each with a valid signature and structure, the revision gives a simple mechanism to determine which is the most recent repository.

### Sync

When syncing a repository, revisions give a series of signposts that allow you to request everything from a given repo _since_ a previously seen version. Because revisions are ordered and monotonically increasing, the provider does not necessarily need the exact revision that the consumer is asking for (as with a commit hash), rather they can provide all repo contents from the _latest_ version of the repo that they remember that is _before_ the requested revision.

The PDS for instance will track the revision at which each repo block or record was introduced into a repository. If a consumer asks for every block or record since a given revision, the PDS has a simple mechanism by which to give that information, without needing a complicated sync algorithm.

### Stale Reads

Finally, a logical clock on the repo gives us a mechanism through which we can detect stale reads. (We actually already snuck this in with an optional revision field on v2 repos!)

Repo revisions may be returned in response headers to most requests. A client will know their own repo’s current revision and can compare that with the upstream service’s revision.

We use this today on the PDS to paper over some read-after-write concerns that are inherent in eventually consistent architectures. Some clients may use these headers to alert their users that their PDS is “out of sync” with other services in the network (for instance an AppView).

## Available sync methods

Below is an enumeration of the available sync methods in the `com.atproto.sync` namespace along with the changes entailed in this repo update and their deprecation status.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getRepo </h3>
    </summary>
    <div>
        <p>This is the primary RPC sync method. It allows a consumer to download an entire copy of a repository. Optionally, it allows them to signal the last revision they saw so that the provider may be able to send less data.</p>
        <h4>Changes</h4>
        <ul>
            <li>Remove optional latest & earliest params</li>
            <li>Add optional <code>since</code> param (rev of the last seen commit)</li>
        </ul>
        <h4>Backwards-compatability path</h4>
        <ul>
            <li>If a consumer sends latest or earliest, they are simply ignored & the consumer will get the full copy of the repo</li>
        </ul>
        <h4> Implementation notes </h4>
        <ul>
            <li>With the optional rev param, there is no expectation that a service provides only the blocks created since that rev. We call this a “coarse diff” as additional blocks may be provided.</li>
            <li>The PDS has a simple way of calculating blocks since some rev, if a service has no such mechanism, they are free to send the entire repository along.</li>
        </ul>
    </div>
</details>


<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> subscribeRepos </h3>
    </summary>
    <div>
        <p>This is the primary streaming sync method. It provides a stream of repo commits and their related diffs.</p>
        <h4>Changes</h4>
        <ul>
            <li>Added new required <code>rev</code> field to the commit event (rev of the current commit)</li>
            <li>Added new required <code>since</code> field to the commit event (_previously_ emitted rev for the repo of the current commit)</li>
            <li>We no longer send out rebase events (though they are still technically supported in the schema)</li>
        </ul>
        <h4>Backwards-compatability path</h4>
        <ul>
            <li>We continue sending <code>prev</code> in events</li>
            <li>Now events will validate against the previous schema</li>
        </ul>
        <h4>Future Changes</h4>
        <ul>
            <li>Deprecate support for rebases</li>
            <li>Possibly deprecate the required <code>prev</code> field
            <li>Possibly deprecate the full route in favor of a new streaming v2 endpoint (TBD)</li>
        </ul>
    </div>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getLatestCommit </h3>
    </summary>
    <div>
        <p>Takes the place of <code>getHead</code> (we’re moving away from “head” as a term).</p>
        <h4>Changes</h4>
        <ul>
            <li>Changed name of <code>root</code> property on response to <code>cid</code></li>
            <li>Added new <code>rev</code> property to response</li>
        </ul>
    </div>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> listBlobs </h3>
    </summary>
    <div>
        <p>Same changes as <code>getRepo</code> - switch from latest & earliest to rev.</p>
    </div>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getRecord </h3>
    </summary>
    <div>
        <p>No changes.</p>
    </div>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getBlob </h3>
    </summary>
    <div>
        <p>No changes.</p>
    </div>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getBlocks </h3>
    </summary>
    <div>
        <p>No changes.</p>
    </div>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> listRepos </h3>
    </summary>
    <div>
        <p>No changes.</p>
    </div>
</details>

## Deprecated methods

These methods will continue to be supported for an interim period but will eventually be fully deprecated.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getCheckout </h3>
    </summary>
    <div>
        <p>Deprecated in favor of the new <code>getRepo</code>.</p>
        <p>The functionality is the same as getRepo with no rev set.</p>
    </div>
</details>

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getHead </h3>
    </summary>
    <div>
        <p>Renamed to (and thus deprecated in favor of) <code>getLatestCommit</code>.</p>
    </div>
</details>

## Fully Deprecated

These methods will be removed immediately upon release of repo v3.

<details style="margin-bottom: 1rem">
    <summary> <h3 style="display: inline"> getCommitPath </h3>
    </summary>
    <div>
        <p>The method no longer has meaning with history-less repos.</p>
    </div>
</details>

---

If you have questions about these changes, join us on GitHub Discussions [here](https://github.com/bluesky-social/atproto/discussions/1410).