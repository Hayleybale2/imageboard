# `imageboard`

An easy uniform wrapper over the popular imageboards' API.

Supported engines:

* [4chan](https://github.com/4chan/4chan-API) ([4chan.org](https://www.4chan.org/)). See [`4chan.org` demo](https://catamphetamine.github.io/captchan/?chan=4chan).
* [vichan](https://github.com/vichan-devel/vichan)/[infinity](https://github.com/ctrlcctrlv/infinity)/[OpenIB](https://github.com/OpenIB/OpenIB/) ([8ch.net](https://8ch.net/)). See [`8ch.net` demo](https://catamphetamine.github.io/captchan/?chan=8ch).
* [lynxchan](https://gitgud.io/LynxChan/LynxChan) ([kohlchan.net](https://kohlchan.net), [endchan.xyz](https://endchan.xyz)). See: [`kohlchan.net` demo](https://catamphetamine.github.io/captchan/?chan=kohlchan), [`endchan.xyz` demo](https://catamphetamine.github.io/captchan/?chan=endchan).
* [makaba](https://2ch.hk/api/) ([2ch.hk](https://2ch.hk/)). See [`2ch.hk` demo](https://catamphetamine.github.io/captchan/?chan=2ch).

Features:

* (optional) Parse comments HTML into structured JSON documents.
* (optional) Automatically generate shortened "previews" for long comments.
* (optional) Automatically insert quoted posts' text when none provided.
* (optional) [Censor](#censorship) certain words using regular expression syntax.
* (optional) Automatically generate thread title when it's missing.

## Install

```
npm install imageboard --save
```

This library uses `async`/`await` syntax so including `regenerator-runtime` is required when using it. That usually means either including `babel-polyfill` (Babel 6) or `@babel/polyfill` (Babel 7). Since Babel `7.4.0` `@babel/polyfill` [has been deprecated](https://babeljs.io/docs/en/babel-polyfill) and should be replaced with `core-js` and `regenerator-runtime`:

```
npm install core-js regenerator-runtime --save
```

```js
import "core-js/stable"
import "regenerator-runtime/runtime"
```

## Example

```
npm install superagent --save
```

```js
import request from 'superagent'
import Chan from './imageboard'

const chan = Chan('4chan', {
  request(method, url, parameters) {
    // Sends an HTTP request.
    // Any HTTP request library can be used here.
    // Must return a `Promise` resolving to response JSON.
    switch (method) {
      case 'POST':
        return request.post(url).send(parameters)
      case 'GET':
        return request.get(url)
      default:
        throw new Error('Not supported')
    }
  }
})

// Get the list of boards.
chan.getBoards().then((boards) => console.log(boards))

// Get the list of threads on "/a/" board.
chan.getThreads({ boardId: 'a' }).then((threads) => console.log(threads))

// Get thread info and comments list for thread "12345" on "/a/" board.
chan.getThread({ boardId: 'a', threadId: 12345 }).then((thread) => console.log(thread))
```

## `Chan`

To use the package first construct a `Chan` instance using the default exported function.

```js
import Chan from './imageboard'
```

### `Chan(chanIdOrChanConfig, options)`

The default exported function, creates a new `Chan` instance.

If a `chanId` is supported by the library out-of-the-box (see the `./chan` directory) then such `chanId` can be passed as a string. Otherwise, `chanConfig` object should be supplied.

`chanId`s supported out-of-the-box:

* `"2ch"`
* `"4chan"`
* `"8ch"`
* `"kohlchan"`
* `"lainchan"`
* `"arisuchan"`
* `"endchan"`

See [Chan config](#chan-config) for the available `chanConfig` properties.

Available `options`:

* `request(method: string, url: string, parameters: object?): Promise` — (required) Sends HTTP requests to chan API. Must return a `Promise` resolving to response JSON. Example: `request("GET", "https://8ch.net/boards.json")`.

* `commentUrl: string?` — (optional) A template for the `url` of all `type: "post-link"`s (links to other comments) in parsed comments' `content`. Is `"/{boardId}/{threadId}#{commentId}"` by default.

* `messages: Messages?` — (optional) "Messages" ("strings", "labels") used when parsing comments `content`. See [Messages](#messages).

* `censoredWords: object[]?` — (optional) An array of pre-compiled word filters which can be used for censoring certain words in parsed comments' `content` or `title`. See the [Censorship](#censorship) section of this README.

* `commentLengthLimit` — (optional) A `number` telling the maximum comment length (in "points" which can be thought of as "characters and character equivalents for non-text content") upon exceeding which a preview is generated for a comment (as `comment.contentPreview`).

* `useRelativeUrls` — (optional) Determines whether to use relative or absolute URLs for attachments. Relative URLs are for the cases when a chan is temporarily hosted on an alternative domain and so all attachments are too meaning that the default chan domain name shouldn't be present in attachment URLs. Is `false` by default.

* `parseContent` — (optional) Can be set to `false` to skip parsing comment HTML into [`Content`](#content). The rationale is that when there're 500-some comments in a thread parsing all of them up-front can take up to a second on a modern desktop CPU which results in subpar user experience. By deferring parsing comments' HTML an application could first only parse the first N comments' HTML and only as the user starts scrolling would it proceed to parsing the next comments. Or maybe a developer wants to use their own HTML parser or even render comments' HTML as is. If `parseContent` is set to `false` then each non-empty comment will have their `content` being the original unmodified HTML string. In such cases `thread.title` won't be autogenerated when it's missing. `Chan.parseCommentContent(comment, { boardId, threadId })` method can be used to parse comment content later (for example, as the user scrolls).

* `expandReplies` — (optional) Set to `true` to expand the optional `comment.replies[]` array from a list of comment ids to the list of the actual comment objects.

## `Chan` methods

### `getBoards(options)`

Returns a list of [Boards](#board). For some imageboards this isn't gonna be a full list of boards because, for example, `8ch.net` has about `20,000` boards so `getBoards()` returns just the "top 20 boards" list.

### `getAllBoards(options)`

Returns a list of all [Boards](#board). For example, `8ch.net` has about `20,000` boards so `getBoards()` returns just the "top 20 boards" list while `getAllBoards()` returns all `20,000` boards.

### `hasMoreBoards()`

Returns `true` if an imageboard has a "get all boards" API endpoint that's different from the regular "get boards" API endpoint. In other words, returns `true` if an imageboard provides separate API endpoints for getting a list of "most popular boards" and a list of "all boards available".

### `getThreads({ boardId }, options)`

Returns a list of [Threads](#thread).

### `getThread({ boardId, threadId }, options)`

Returns a [Thread](#thread).

### `parseCommentContent(comment, { boardId, threadId })`

Parses `comment` content if `parseContent: false` option was used when creating a `Chan` instance.

### `vote({ up, boardId, threadId, commentId })`

Some imageboards (like `2ch.hk`) allow upvoting or downvoting threads and comments on certain boards (like `/po/` on `2ch.hk`).

Returns `true` if the vote has been accepted. Returns `false` if the user has already voted.

## Miscellaneous API

### `getConfig(chanId: string): object?`

Returns an imageboard config by its id. Example: `"4chan"`.

### `compileWordPatterns(wordPatterns: string[]): object[]`

Compiles [word patterns](#censorship). This is just a `compileWordPatterns()` function re-exported from [`social-components`](https://github.com/catamphetamine/social-components) for convenience.

### `generateQuotes(content: Content, options: object)`

Autogenerates quotes for other comment links in this comment's `content`.

The `options`:

* `comment: Comment` — (required) Is used to access `comment.attachments` for generating comment preview if it's too long.
* `getCommentById(number): object[]` — (required) Returns a `comment` by its `id`.
* `threadId: number` — (required) Comment thread id. Historically comments on imageboards can reference comments from other threads. For example: `"Previous thread: >>12345"`. For such other-thread comments the quotes can't be generated because there's no content data for them. Therefore, `threadId` is used to filter only links to current thread comments.
* `messages: Messages?` — (optional) "Messages" ("strings", "labels") used when generating comment `content` text. See [Messages](#messages).

### `generatePreview(comment: Comment, maxCommentLength: number)`

Generates `contentPreview` for the `comment` if its too long.

### `generateThreadTitle(thread: Thread, options: object?)`

Autogenerates `thread.title` from the "opening" comment's `title` or `content` if `thread.title` is missing.

Available `options` (optional argument):

* `censoredWords: object[]?` — (optional) Compiled word patterns for [censoring](#censorship) comment text.
* `messages: Messages?` — (optional) "Messages" ("strings", "labels") used when generating comment `content` text. See [Messages](#messages).
* `parseContent: boolean?` — (optional) If `parseContent: false` is used to skip parsing comments' `content` when using `Chan` methods then `parseContent: false` option should also be passed here so indicate that the "opening" comment `content` (raw unparsed HTML markup) should be ignored.

## Models

### Board

```js
{
  // Board ID.
  // Example: "b".
  id: string,
  // Board title.
  // Example: "Anime & Manga".
  title: string,
  // Board description.
  description: string,
  // Is this board "Not Safe For Work".
  isNotSafeForWork: boolean?,
  // "Bump limit" for threads on this board.
  bumpLimit: number?,
  // The maximum attachments count in a thread.
  // Only present for 4chan.org
  maxAttachmentsInThread: number?,
  // Maximum comment length in a thread on the board (a board-wide setting).
  // Only present for `4chan.org`.
  // `2ch.hk` also has it but doesn't return it as part of the `/boards.json` response.
  maxCommentLength: number?,
  // Maximum total attachments size in a thread on the board (a board-wide setting).
  // Only present for `4chan.org`.
  // `2ch.hk` also has it but doesn't return it as part of the `/boards.json` response.
  maxAttachmentsSize: number?,
  // Maximum total video attachments size in a thread on the board (a board-wide setting).
  // Only present for `4chan.org`.
  maxVideoAttachmentsSize: number?,
  // Create new thread cooldown.
  // Only present for `4chan.org`.
  createThreadCooldown: number?,
  // Post new comment cooldown.
  // Only present for `4chan.org`.
  postCommentCooldown: number?,
  // Post new comment with an attachment cooldown.
  // Only present for `4chan.org`.
  attachFileCooldown: number?,
  // Whether "sage" is allowed when posting comments on this board.
  // Only present for `4chan.org`.
  isSageAllowed: boolean?,
  // Whether to show a "Name" field in a "post new comment" form on this board.
  // Only present for `2ch.hk`.
  areNamesAllowed: boolean?
}
```

### Thread

```js
{
  // Thread ID.
  // Same as the "id" of the first comment.
  id: number,
  // Board ID.
  // Example: "b".
  boardId: string,
  // Comments count in this thread.
  // (not including the main comment of the thread).
  commentsCount: number,
  // Attachments count in the comments of this thread.
  // (doesn't include the main comment of the thread).
  commentAttachmentsCount: number,
  // Thread title ("subject").
  // Either the first comment's `title` or is
  // autogenerated from the first comment's content.
  title: string?,
  // If `title` contains ignored words then a censored title
  // containing "censored" "spoilers" will be generated.
  // (with "spoilers" represented by "​░​" characters)
  titleCensored: string?,
  // Comments in this thread.
  // (including the main comment of the thread).
  comments: Comment[],
  // Is this thread "sticky" (pinned).
  isSticky: boolean?,
  // Is this thread locked.
  isLocked: boolean?,
  // A "rolling" thread is the one where old messages are purged as new ones come in.
  isRolling: boolean?,
  // Was the "bump limit" reached for this thread already.
  // Is `false` when the thread is "sticky" or "rolling"
  // because such threads don't expire.
  isBumpLimitReached: boolean?,
  // `4chan.org` sets a limit on maximum attachments count in a thread.
  isAttachmentLimitReached: boolean?,
  // `2ch.hk` and `lynxchan` don't specify board settings in `/boards.json` API response.
  // Instead, they return various limits as part of "get threads" or
  // "get thread comments" API responses (`2ch.hk` returns for both
  // and `lynxchan` returns only for "get thread comments" API).
  // In such case `board` will be present in a `Thread` object.
  // Also `board` will be present when "get thread comments" API response
  // contains board title.
  board: {
    // (both `lynxchan` and `2ch.hk`)
    // Board title.
    title: string,
    // (`2ch.hk` only)
    // "Bump limit" for threads on this board.
    bumpLimit: number,
    // (both `lynxchan` and `2ch.hk`)
    // Maximum comment length.
    maxCommentLength: number,
    // (`2ch.hk` only)
    // Maximum total attachments size for a post.
    maxAttachmentsSize: number,
    // (`lynxchan` only)
    // Maximum attachment size for a post.
    maxAttachmentSize: number,
    // (`lynxchan` only)
    // Maximum attachments count for a post.
    maxAttachments: number,
    // (`2ch.hk` only)
    // Whether this board allows "Subject" when posting a new reply or creating a new thread.
    areSubjectsAllowed: boolean,
    // (`2ch.hk` only)
    // Whether this board allows attachments on posts.
    areAttachmentsAllowed: boolean,
    // (`2ch.hk` only)
    // Whether this board allows specifying "tags" when creating a new thread.
    areTagsAllowed: boolean,
    // (`2ch.hk` only)
    // Whether this board allows voting for comments/threads.
    hasVoting: boolean,
    // (both `lynxchan` and `2ch.hk`)
    // An array of "badges" (like country flags but not country flags)
    // that can be used when posting a new reply or creating a new thread.
    // Each "badge" has an `id` and a `title`.
    badges: object[]?
  },
  // The date on which the thread was created.
  // Is absent in "get threads list" API response
  // of `lynxchan` engine which is a bug
  // but seems like they don't want to fix it.
  createdAt: Date?,
  // "Last Modified Date", usually including:
  // posting new comments, deleting existing comments, sticky/closed status changes.
  // Is usually present on all chans in "get threads list" API response
  // but not in "get thread comments" API response.
  updatedAt: Date?,
  // Custom spoiler ID (if custom spoilers are used on the board).
  // Only present for `4chan.org`.
  customSpoilerId: number?,
  // Unique poster IP address subnets count.
  // Only present in "get thread" API response.
  uniquePostersCount: number?
}
```

### Comment

```js
{
  // Comment ID.
  id: number,
  // Comment title ("subject").
  title: string?,
  // If `title` contains ignored words then a censored title
  // containing "censored" "spoilers" will be generated.
  titleCensored: InlineContent?,
  // The date on which the comment was posted.
  createdAt: Date,
  // "Last Modified Date".
  // I guess it includes all possible comment "modification"
  // actions like editing comment text, deleting attachments, etc.
  // Is present on "modified" comments in "get thread comments"
  // API response of `lynxchan` engine.
  updatedAt: Date?,
  // `2ch.hk` provides means for "original posters" to identify themselves
  // when replying in their own threads with a previously set "OP" cookie.
  isThreadAuthor: boolean?,
  // Some chans identify their users by a hash of their IP address subnet
  // on some of their boards (for example, all chans do that on `/pol/` boards).
  authorId: String?,
  // If `authorId` is present then it's converted into a HEX color.
  // Example: "#c05a7f".
  authorIdColor: String?,
  // `2ch.hk` autogenerates names based on IP address subnet hash on `/po` board.
  // If this flag is `true` then it means that `authorName` is an equivalent of an `authorId`.
  authorIdName: boolean?,
  // Comment author name.
  authorName: String?,
  // Comment author's email address.
  authorEmail: String?
  // Comment author's "tripcode".
  // https://encyclopediadramatica.rs/Tripcode
  authorTripCode: String?,
  // A two-letter ISO country code (or "ZZ" for "Anonymized").
  // Chans usually show poster flags on `/int/` boards.
  authorCountry: String?,
  // Some chans allow icons for posts on some boards.
  // For example, `kohlchan.net` shows user icons on `/int/` board.
  // Author icon examples in this case: "UA", "RU-MOW", "TEXAS", "PROXYFAG", etc.
  // `authorBadgeUrl` is `/.static/flags/${authorBadge}.png`.
  // `authorBadgeName` examples in this case: "Ukraine", "Moscow", "Texas", "Proxy", etc.
  // Also, `2ch.hk` allows icons for posts on various boards like `/po/`.
  // Author icon examples in this case: "nya", "liber", "comm", "libertar", etc.
  // `authorBadgeUrl` is `/icons/logos/${authorBadge}.png`.
  // `authorBadgeName` examples in this case: "Nya", "Либерализм", "Коммунизм", "Либертарианство", etc.
  authorBadgeUrl: String?,
  authorBadgeName: String?,
  // If the comment was posted by a "priviliged" user
  // then it's gonna be the role of the comment author.
  // Examples: "administrator", "moderator".
  authorRole: String?,
  // `8ch.net` and `lynxchan` have "global adiministrators"
  // and "board administrators", and "global moderators"
  // and "board moderators", so `authorRoleDomain` is gonna be
  // "board" for a "board administrator" or "board moderator".
  authorRoleDomain: String?,
  // If `true` then it means that the author was banned for the message.
  authorBan: boolean?,
  // An optional `String` with the ban reason.
  authorBanReason: String?,
  // If this comment was posted with a "sage".
  // https://knowyourmeme.com/memes/sage
  isSage: boolean?,
  // Downvotes count for this comment.
  // Only for boards like `/po/` on `2ch.hk`.
  upvotes: number?,
  // Downvotes count for this comment.
  // Only for boards like `/po/` on `2ch.hk`.
  downvotes: number?,
  // Comment content.
  // If `parseContent: false` option was passed
  // then `content` is an HTML string (or `undefined`).
  // Otherwise, it's `Content` (or `undefined`).
  // Content example: `[['Comment text']]`.
  content: (string|Content)?,
  // If the `content` is too long a preview is generated.
  contentPreview: Content?,
  // Comment attachments.
  attachments: Attachment[]?,
  // The IDs of the comments to which this comment replies.
  inReplyTo: number[]?,
  // The IDs of the comments which are replies to this comment.
  replies: number[]?
}
```

### Content

Each comment can have `content` and sometimes `contentPreview` both of which are [`Content`](https://github.com/catamphetamine/social-components/tree/master/docs/Post/PostContent.md) unless `parseContent: false` option was passed in which case `content` is an HTML string and no `contentPreview` is generated.

### Attachment

An attachment can be a:

* [`Picture`](https://github.com/catamphetamine/social-components/tree/master/docs/Post/PostAttachments.md#picture) attachment

<!--
Additional fields:

```js
{
  // (only for `2ch.hk`)
  // `true` in case of a `2ch.hk` sticker.
  sticker: boolean?
}
```
-->

* [`Video`](https://github.com/catamphetamine/social-components/tree/master/docs/Post/PostAttachments.md#video) attachment

* [`File`](https://github.com/catamphetamine/social-components/tree/master/docs/Post/PostAttachments.md#file) attachment

## Censorship

A `censoredWords` option can be passed to the `Chan` function to censor certain words in parsed comments' `content` or `title`. The `censoredWords: object[]?` option must be a list of word filters pre-compiled via the exported `compileWordPatterns(censoredWords, language)` function:

* `language: string` — (required) A lowercase two-letter language code (examples: `"en"`, `"ru"`, `"de"`) used to generate a regular expression for splitting text into individual words.

* `censoredWords: string[]` — (required) An array of `string` word patterns. The standard regular expression syntax applies, `^` meaning "word start", `$` meaning "word end", `.` meaning "any letter", etc. The patterns are applied to each individual word and if there's a match then the whole word is censored.

Word pattern examples:

* `^mother.*` — Matches `"mothercare"` and `"motherfather"`.

* `^mother[f].*` — Matches `"motherfather"` but not `"mothercare"`.

* `^mother[^f].*` — Matches `"mothercare"` but not `"motherfather"`.

* `^cock$` — Matches `"cock"` in `"my cock is big"` but won't match `"cocktail"` or `"peacock"`.

* `cock` — Matches `"cock"`, `"cocktail"` and `"peacock"`.

* `cock$` — Matches `"cock"` and `"peacock"` but not `"cocktail"` .

* `^cocks?` — Matches `"cock"` and `"cocks"`.

* `^cock.{0,3}` — Matches `"cock"`, `"cocks"`, `"cocker"`, `"cockers"`.

Censored words in parsed comments' `content` will be replaced with `{ type: "spoiler", censored: true, content: "the-word-that-got-censored" }`.

Censored words in comment/thread `title`s don't result in their replacement but rather a new `titleCensored` property is generated with the words censored. The rationale is that `title` is a `string`, not `Content`, therefore it should stay a `string`. `content`, on the other hand, is already of `Content` type so it's edited in-place.

## Chan config

```js
{
  // (required)
  // Chan unique ID.
  "id": "4chan",

  // (required)
  // Chan website domain name.
  "domain": "4chan.org",

  // (required)
  // The engine the chan runs on.
  // Must be supported out-of-the-box (see the `./engine` directory).
  // Supported engines:
  // * `"4chan"`
  // * `"vichan"`
  // * `"OpenIB"`
  // * `"lynxchan"`
  // * `"makaba"`
  "engine": "vichan",

  // (optional)
  // Boards list.
  // Some smaller older imageboards don't provide a "get boards list" API.
  // For such imageboards the boards list is "hardcoded" in the config.
  "boards": [
    {
      // (required)
      // Board ID.
      "id": "λ",

      // (required)
      // Board title.
      "title": "Programming",

      // (optional)
      // Board category.
      // Can be used to display boards grouped by category.
      "category": "Technology"
    },
    ...
  ],

  // (required)
  "api": {
    // (required if there's no "boards" config parameter)
    // "Get boards list" API URL.
    "getBoards": "/boards-top20.json",

    // (optional)
    // "Get all boards list" API URL.
    // `8ch.net` has about `20,000` boards total
    // so "getBoards" API only returns top 20 of them
    // while "getAllBoards" API returns all `20,000` of them.
    "getAllBoards": "/boards.json",

    // (required)
    // "Get threads list" API URL template.
    "getThreads": "/{boardId}/catalog.json",

    // (required)
    // "Get thread comments" API URL template.
    "getThread": "/{boardId}/res/{threadId}.json"
  },

  // (required)
  // A template for parsing links to other comments in comment HTML.
  // The first "group" must match board id,
  // the second "group" must match thread id,
  // the third "group" must match comment id.
  "commentUrlParser": "^\\/(.+?)\\/res\\/(\\d+).html#(\\d+)$"

  // (optional)
  // Attachment URL template.
  // Is required for chan engines that don't
  // provide the full attachment URL (`vichan`)
  // or for chans that host attachments on another domain
  // (`4chan` hosts attachments at `https://i.4cdn.org`).
  // Available parameters are:
  // * boardId — Board ID ("b", etc).
  // * name — Attachment filename on server.
  // * originalName — Original attachment filename, is used for non-image file attachments.
  // * ext — "." character plus attachment file extension.
  "attachmentUrl": "https://i.4cdn.org/{boardId}/{name}{ext}",

  // (optional)
  // Attachment thumbnail URL pattern.
  // Same as "attachmentUrl" but for thumbnails.
  "attachmentThumbnailUrl": "https://i.4cdn.org/{boardId}/{name}s.jpg",

  // (optional)
  // Chans usually store images/videos under random-generated filenames
  // and all other files under their original filename,
  // hence the separate "fileAttachmentUrl" parameter.
  "fileAttachmentUrl": "https://i.4cdn.org/{boardId}/{originalName}{ext}",

  // (is only required by `8ch.net`)
  // `8ch.net` has `fpath: 0/1` parameter for attachments:
  // `fpath: 1` attachments are hosted at the global
  // board-agnostic URLs (not having `{boardId}` as part of their URL)
  // and all other attachments are hosted at board-specific URLs.
  "attachmentUrlFpath": "https://media.8ch.net/file_store/{name}{ext}",

  // (is only required by `8ch.net`)
  // Attachment thumbnail URL pattern for `fpath: 1` attachments.
  // Same as "attachmentUrlFpath" but for thumbnails.
  "attachmentThumbnailUrlFpath": "https://media.8ch.net/file_store/{name}{ext}",

  // (optional)
  // Most chans set author name to some default placeholder
  // like "Anonymous" when no author name has been input.
  // The parser then checks if author name is equal to the
  // "defaultAuthorName" and if it is then it leaves the `authorName` blank.
  // Can be a string or an object of shape `{ boardId: defaultAuthorName }`.
  "defaultAuthorName": "Anonymous",
  // or on a per-board basis:
  // "defaultAuthorName": {
  //  "*": "Anonymous",
  //  "ru": "Аноним",
  //  "christan": "Christanon"
  // }

  // (required for `lynxchan`)
  // Thumbnail size. Is required for `lynxchan`.
  // `lynxchan` engine currently has a bug:
  // it doesn't provide thumbnail dimensions.
  // To work around that bug, thumbnail dimensions
  // are derived from the original image aspect ratio.
  "thumbnailSize": 255
}
```

## Adding a new chan

* Create the chan's directory in `./src/imageboard/chan`.
* Create `index.json` and `index.js` files in the chan's directory (see other chans as an example). See [Chan config](#chan-config) for the explanation of the `index.json` file format.
* Add an export for the chan in `./src/imageboard/chan/index.js` (same as for the existing chans).

If the chan runs on an already supported engine then it most likely has its own comment HTML syntax which could be different from other chans running on the same engine. In such case, go to the engine directory (`./src/imageboard/engine/${engineName}`) and edit `index.js` file to use the set of ["comment parser plugins"](#comment-parser-plugins) specific to this new chan (see other chan's comment parser plugins as an example). Otherwise, if it's a new engine:

* Create the engine directory in `./src/imageboard/engine`.
* Create `index.js` file in the engine directory (same as for the existing engines). The engine class must extend `./src/imageboard/Engine.js` and implement at least four methods (`parseBoards()`, `parseThreads()`, `parseThread()` and `parseComment()`) and also provide a list of HTML ["comment parser plugins"](#comment-parser-plugins) (see other engines as an example).
* Add the engine in `./src/imageboard/engine/index.js` file (same as for the existing engines).

## Comment parser plugins

Chan comments are formatted in HTML. Different chans use their own comment HTML syntax. For example, bold text could be `<strong>bold</strong>` at some chans, `<b>bold</b>` at other chans and `<span class="bold">bold</span>` at the other chans, even if they all used the same engine. Hence, every chan requires defining their own set of "comment parser plugins" in `./src/imageboard/engine/${engine}` directory.

A "comment parser plugin" is an object having properties:

* `tag: String` — HTML tag (in lower case).
* `attributes: object[]?` — A set of HTML tag attribute filters. An attribute filter is an object of shape `{ name: String, value: String }`.
* `createBlock(content: PostContent, node, options): PostContent?` — Receives child `content` and wraps it in a parent content block (see [Post Content](https://github.com/catamphetamine/social-components/blob/master/docs/Post/PostContent.md) docs). Can return `undefined`. Can return a string, an object or an array of strings or objects. `node` is the DOM `Node` and provides methods like `getAttribute(name: String)`. `options` is an object providing some configuration options like `commentUrlParser` for parsing comment links (`<a href="/b/123#456">&gt;&gt;456</a>`).

Example:

```html
<strong>bold <span class="italic">text</span></strong>
```

Plugins:

```js
const parseBold = {
  tag: 'strong',
  createBlock(content) {
    return {
      type: 'text',
      style: 'bold',
      content
    }
  }
}

const parseItalic = {
  tag: 'span',
  attributes: [{
    name: 'class',
    value: 'italic'
  }],
  createBlock(content) {
    return {
      type: 'text',
      style: 'italic',
      content
    }
  }
}

export default [
  parseBold,
  parseItalic
]
```

Result:

```js
[
  [
    {
      type: 'text',
      style: 'bold',
      content: [
        'bold ',
        {
          type: 'text',
          style: 'italic',
          content: 'text'
        }
      ]
    }
  ]
]
```

## Messages

Sometimes an optional `messages` object can be passed to define "messages" ("strings", "labels") used when parsing comments `content`. There're no defaults so these should be passed even for English.

Messages used for quoted comment links:

* `deletedComment: "Deleted comment"`
* `hiddenComment: "Hidden comment"`
* `quotedComment: "Comment"`

Messages used when generating `content` text (autogenerated quotes, autogenerated thread title):

* `video: "Video"`
* `picture: "Picture"`
* `audio: "Audio"`
* `attachment: "Attachment"`
* `code: "Code"`
* `link: "Link"`
* `linkTo: "Link to"`