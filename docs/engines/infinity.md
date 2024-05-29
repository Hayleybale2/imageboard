# `infinity` API

[`infinity`](https://github.com/ctrlcctrlv/infinity) engine is a fork of [`vichan`](https://github.com/vichan-devel/vichan) engine which is a fork of [`Tinyboard`](https://github.com/savetheinternet/Tinyboard) engine.

`infinity` engine was written by Frederick Brennan on mushrooms with the idea of letting anyone create their own board. See the [documentary by VICE](https://www.youtube.com/watch?v=Kerg2rrIdAU). Also see [Q: Into the Storm](https://en.wikipedia.org/wiki/Q_Into_the_Storm) documentary.

### Differences from `vichan`

* `tim` is a 64-character string. Looks like a hash of some sort.

* Posts have an `fpath` property that can be `0` or `1`. It controls the URL ("file path") of the attachments. See [Attachments](#attachments) section for more info.

* Posts have a `bumplocked` property that can be `"0"` or `"1"`. For some weird reason, it's not a number but rather a string. "Bumplocked" threads are in ["autosage"](https://twitter.com/infinitechan/status/555013038839848961) mode. In other words, "bumplocked" threads never get bumped, even when someone leaves a comment.

### Imageboards

Known imageboards that use `infinity` engine:

* [`8kun.top`](https://8kun.top) (formerly `8ch.net`)
* [`smuglo.li`](https://smuglo.li/)

### Post

`8kun.top`, being built on `vichan` engine, supports `email` property on Posts. If `email` is `"sage"` then the post is a ["sage"](https://knowyourmeme.com/memes/sage) (non-bumping) one.

### Attachment

`8kun.top`, being built on `infinity` engine, supports multiple attachments per post via the `extra_files[]` property of a Post.

For images, thumbnail extension is always the extension of the original attachment (even for `.gif` files). For videos, thumbnail extension is always `.jpg`.

If an attachment has `fpath: 1` property then its URL is `https://media.8kun.top/file_store/{name}{ext}` instead of the regular `https://media.8kun.top/{boardId}/src/{name}{ext}`, and its thumbnail URL is `https://media.8kun.top/file_store/thumb/{name}{ext}` instead of the regular `https://media.8kun.top/{boardId}/thumb/{name}{ext}`.

Thumbnail size is `255px`.

## Syntax

Message HTML syntax is:

* `<strong>...</strong>` — bold text.
* `<em>...</em>` — italic text.
* `<u>...</u>` — underlined text.
* `<s>...</s>` — strikethrough text.
* `<p class="body-line ltr ">...</p>` — a line of text (comes with a "line break" at the end, like `<br>`).
* `<p class="body-line empty ">...</p>` — "line break" (like `<br>`).
* `<span class="detected">...</span>` — some `(((...)))` "blue" text (whatever that means).
* `<span class="heading">...</span>` — "red" text (seems to be used for headings).
* `<span class="spoiler">...</span>` — spoiler text.
* `<p class="body-line ltr quote">...</p>` — quoted text (starts with a `>`) (comes with a "line break" at the end, like `<br>`).
* `<p class="body-line ltr rquote">...</p>` — red quoted text, they call it "faggotposting" for some reason (starts with a `<`) (comes with a "line break" at the end, like `<br>`).
* `<span class="aa">...</span>` — ["ShiftJIS art"](https://en.wikipedia.org/wiki/Shift_JIS) or ["ASCII art"](https://en.wikipedia.org/wiki/ASCII_art). Should use a "ShiftJIS"-compatible font like ["Mona"](https://en.wikipedia.org/wiki/Mona_Font) or "MS PGothic". Should preserve sequences of white space. Lines should be broken at newline characters (or to prevent overflow).
* `<a href="#p184569592" class="quotelink">...</a>` — post link (starts with a `>>`).
* `<a href="...">...</a>` — other links (the URL may be in any form: relative like `/a/thread/184064641#p184154285` or `/r/`, absolute like `https://boards.4chan.org/wsr/`, absolute-same-protocol like `//boards.4chan.org/wsr/`).
* "Advanced" users may potentially use some unconventional markup, so all unknown/invalid tags should be ignored by just displaying their content (which can itself contain unknown/invalid tags).

### Roles

If a comment has a `capcode` then it implies that the poster is a priviliged one. Possible `capcode`s:

* `"Admin"` for global admins
* `"Global Volunteer"` for global moderators
* `"Board Owner"` for board admins
* `"Board Volunteer"` for board moderators

### Get boards list

`OpenIB` allows their users to create their own boards which results in a huge amount of boards being returned from the `https://8kun.top/boards.json` API (about 20 000 boards total).

Because of that, `OpenIB` provides a lighter-weight API for getting the top-50-some list of the most active boards: `https://8kun.top/boards-top20.json`.

Example output:

```js
[
	{
		// Board ID.
		"uri": "pol",
		// Board name.
		"title": "Politically Incorrect",
		// Board description.
		"subtitle": "Politics, news, happenings, current events",

		// Is this board "indexed".
		// (whatever than means)
		// (maybe something like "searchable")
		"indexed": "1",

		// `1` for "Not-Safe-For-Work" boards.
		"sfw": "0",

		// The total count of posts made on this board.
		"posts_total": "13007534",

		"time": null,

		// I guess they weigh boards somehow in their list of boards.
		"weight": 0,

		// Board language.
		"locale": "English",

		// Board tags.
		"tags": [
			"/pol/",
			"politics",
			"news",
			"free-speech",
			"current-events"
		],

		// The latest post ID on this board.
		"max": "13007534",

		// The number of `/16` subnet ranges to post
		// on this board in the last 3 days (72 hours).
		// It is not a perfect metric and does not account for
		// number of lurkers (users who only read the board and do not post)
		// or the number of users sharing an IP range
		// (for example, all Tor users are considered one active user).
		// In the entire Internet, there are only 16,384 /16 ranges
		// (also known as Class B networks), with 65,536 addresses per range.
		// So, if /v/ or /pol/ has 3,000 ranges (active users), that means their
		// posters represent 18% of the possible number of ranges on the Internet.
		// Many ISPs only have one or two ranges.
		// https://8kun.top/activeusers.html
		"active": 3808,

		// Posts made in the last hour on this board.
		"pph": 287,

		// Posts made in the last day on this board.
		"ppd": 7664,

		// Average posts per hour on this board.
		// I guess it averages over 3 days (72 hours) or something.
		"pph_average": 329
	},
	...
]
```

### Get board settings

(doesn't seem to work as of 2024 on `8kun.top` specifically, but seems to work on other `OpenIB` imageboards)

[`https://smuglo.li/settings.php?board=a`](https://smuglo.li/settings.php?board=a)

[Read the comments in the engine code](https://github.com/ctrlcctrlv/infinity/blob/master/inc/config.php)

```js
{
	// Board name.
  "title": "Anime/Random",

  // Board description.
  "subtitle": "Not vaccinated!",

  // Whether this board is "indexed".
  // (I guess, it means something like "searchable").
  "indexed": true,

  // Whether to show poster country flags.
  "country_flags": false,

  // When `true`, all names will be set to `$config['anonymous']`.
  "field_disable_name": false,

  // Whether links to popular services can be embedded on this board.
  "enable_embedding": false,

  // Whether the main post must have an attachment.
  "force_image_op": true,

  // Whether attachments are disabled for posting on this board.
  "disable_images": false,

  // Whether to show poster IDs (IP address hashes).
  "poster_ids": false,

  // Whether to display if a post is a "sage" (non-bumping) one.
  "show_sages": true,

  // Whether to automatically convert things like "..." to Unicode characters ("…").
  "auto_unicode": true,

  // Whether to strip combining characters from Unicode strings (eg. "Zalgo").
  // (whatever that means)
  "strip_combining_chars": true,

	// Allow dice rolling:
	// an email field of the form "dice XdY+/-Z" will result in X Y-sided dice rolled and summed,
	// with the modifier Z added, with the result displayed at the top of the post body.
  "allow_roll": false,

  // Whether to reject duplicate image uploads.
  "image_reject_repost": false,

  // Whether to reject duplicate image uploads within the thread.
  // Doesn't change anything if `$config['image_reject_repost']` is `true`.
  "image_reject_repost_in_thread": false,

  "early_404": true,

  // Whether to allow deleting something.
  // Perhaps images or comments themselves.
  "allow_delete": false,

  // The default poster name (if none provided).
  "anonymous": "Anonymous",

  // Some sort of a banner (header).
  "blotter": "Just 🐝 yourself. <a href=\"https://8kun.top/b/rules.html\">Rules.</a>",

  // Styles available for the board.
  "stylesheets": {
    "Yotsuba": "yotsuba.css",
    "Tomorrow": "tomorrow.css",
    "Custom": "board/b.css",
    ...
  },

  // Default style for the board.
  "default_stylesheet": [
    "Custom",
    "board/b.css"
  ],

  // CAPTCHA settings.
  "captcha": {
  	// Whether CAPTCHA is enabled on this board.
    "enabled": false,
    // CAPTCHA expires in (seconds).
    "expires_in": 120,
    // CAPTCHA characters count.
    "length": 6,
    // The URL to use to request a new CAPTCHA.
    "provider_get": "https://8kun.top/8chan-captcha/entrypoint.php",
    // The URL to use to submit a solution for a CAPTCHA.
    "provider_check": "https://8kun.top/8chan-captcha/entrypoint.php",
    // Custom captcha extra field (eg. charset).
    "extra": "abcdefghijklmnopqrstuvwxyz",
    "provider_get_sys": "https://sys.8kun.top/8chan-captcha/entrypoint.php",
    "provider_check_pop": "https://8kun.top/8chan-captcha/entrypoint_pop.php"
  },

  // Whether the main post must have a subject.
  "force_subject_op": true,

  // Whether this board allows posting from Tor network.
  "tor_posting": true,

  // Whether this board requires solving a CAPTCHA to start a new thread.
  "new_thread_capt": true,

  // Board language.
  "locale": "en",

  // Perhaps allowed video attachment extensions.
  "allowed_ext_files": [
    "webm",
    "mp4"
  ],

  // Allowed attachment extensions.
  "allowed_ext": [
    "jpg",
    "jpeg",
    "gif",
    "png"
  ],

  // Available flag images for posters on this board.
  // The key is the filename of a flag image.
  "user_flags": {
    "1518895436081": "8kek",
    "1518895448688": ":^)",
    "1518895459383": "Akira",
    ...
  },

  // Word replacement.
  // Can contain regular expressions.
  "wordfilters": [
    [
      "fnords",
      ""
    ],
    [
      "fnord",
      ""
    ]
  ],

  // Whether this board allows posting math using LaTeX syntax.
  // For example, it could be enabled for some `/science/` boards.
  "latex": false,

  // Whether this board allows posting code using code tags.
  // For example, it could be enabled for some `/programming/` boards.
  "code_tags": true,

  // Maximum number of newlines.
  // (whatever that means)
  // (0 for unlimited)
  "max_newlines": 0,

  // I guess this is the "bump limit" for threads on this board.
  "reply_limit": 250,

  // Max attachments per post.
  "max_images": 5
}
```

### Quirks

* `8kun.top`
  * (was observed at around 2020) For some reason, hyperlinks in posts on `8kun.top` have their protocol colon wrapped in `<em></em>` tag (example: `"http<em>:</em>//google.com"`). Perhaps this was done to prevent some kind of crawling or something. Google doesn't index `8ch.net` anyway.

### Get thread IDs list (and their latest comment dates)

This is the same as `4chan`'s ["Get thread IDs list (and their latest comment dates)"](https://gitlab.com/catamphetamine/imageboard/blob/master/docs/engines/4chan.md#get-thread-ids-list-and-their-latest-comment-dates) API endpoint, the only difference being that it doesn't have `replies` count, and also has comment author `id`s on boards that show comment author ids..

[8kun.top/v/threads.json](https://8kun.top/v/threads.json)

```js
[
  {
    threads: [
      {
        no: 2942,
        last_modified: 1578380032,
        id: "97e711"
      },
      {
        no: 2999,
        last_modified: 1578361038,
        id: "256314"
      }
    ]
  }
]
```

### Post a comment

Send a `POST` request of type `multipart/form-data` to `/post.php`

Parameters:

* `thread` — Thread ID.
* `board` — Board ID.
* `name` — Author's name (optional).
* `email` — Author's email (optional).
* `subject` — Comment title.
* `body` — Comment text.
* `password` — An optional password for own post/attachment deletion in the future.
* `embed` — Allows specifying a link to "embedded" content such as a YouTube video. Replaces any attachments.
* `page` — Unknown. Seems to be `1` when creating a new thread being at the first page of a board.
* `dx` — "Dices" `dice` value. Supposedly, it throws a "dice" and posts the result in the comment.
* `dy` — "Dices" `sides` value. Supposedly, it throws a "dice" and posts the result in the comment.
* `dz` — "Dices" `modifier` value. Supposedly, it throws a "dice" and posts the result in the comment.
* `json_response` — Set to `1` to receive the HTTP response in `application/json` format.
* `post` — (seen at `8kun.top`) Unknown. Has value `"Reply"`. I'd assume that this parameter could be omitted.
* `tor` — Unknown. Has `"null"` value on `8kun.top`.
* `domain_name_post` — Unknown. Has `"8kun.top"` value on `8kun.top`.
* `file` — The first attachment. Or "oekaki" drawing, if "oekaki" is used.
* `file2` — The second attachment.
* `file3` — The third attachment.
* `file4` — The fourth attachment.
* `file5` — The fifth attachment.
* `set_images_spoiler[0]` — Set to `"on"` to mark `file` attachment with a "spoiler" label.
* `set_images_spoiler[1]` — Set to `"on"` to mark `file2` attachment with a "spoiler" label.
* `set_images_spoiler[2]` — Set to `"on"` to mark `file3` attachment with a "spoiler" label.
* `set_images_spoiler[3]` — Set to `"on"` to mark `file4` attachment with a "spoiler" label.
* `set_images_spoiler[4]` — Set to `"on"` to mark `file5` attachment with a "spoiler" label.
* `archive_message` — Set to `"on"` to archive the post you're creating. I suppose, this means that the post won't be wiped from existence when it gets pushed off the list of threads on the board. When using this parameter, the maximum length for the comment is 500 characters.
* `no-bump` — Set to `"on"` to emulate "sage" behavior. In other words, posting a comment in a thread while having this flag `"on"` will not bump that thread.

Also, posting a comment or a thread might require supplying a [CAPTCHA solution](#get-a-captcha)in the parameters:

* `captcha_cookie` — CAPTCHA ID.
* `captcha_text` — CAPTCHA solution.

For example, on `smuglo.li`, in `/a/` board settings, it says `captcha.enabled: false` but it still requires solving a CAPTCHA when posting a new thread rather than when posting a comment in an existing thread.

"Success" response example:

```js
{
  // The URL of the comment to redirect to.
  "redirect": "\/random\/res\/108867.html#108897",

  // Supposedly, `noko: true` flag means "redirect to the comment".
  //
  // https://www.urbandictionary.com/define.php?term=noko
  // "noko — A magical word that, when typed in the email field of a chan post form before
  //  posting, returns you directly to the thread you just posted in instead of the thread list."
  // "Example: I use "noko" on /b/ to avoid losing track of my threads."
  //
  "noko": true,

  // Comment ID or thread ID.
  "id": "108897",

  // Dunno what `post_type` property is.
  // * `post_type: false` is returned on `8kun.top`.
  // * `post_type` is not returned in `vichan` engine.
  "post_type": false
}
```

### Post a thread

Same as posting a comment, but without specifying the `thread` parameter, with some additional parameters:

* `mod` — (seen at `smuglo.li`). Unknown. Is set to `1` when posting a thread at `smuglo.li`. Could potentially be omitted?
* `post` — (seen at `smuglo.li`) Unknown. Has value `"New Topic"`. I'd assume that this parameter could be omitted.

### Get a CAPTCHA

`GET` `/8chan-captcha/entrypoint.php`

The URL could be obtained from the [board settings'](#get-board-settings) `captcha.provider_get` property.

Parameters:

* `mode` — `"get"` to request a new CAPTCHA.
* `extra` — Seems to be a list of characters for the CAPTCHA. Could be obtained from the [board settings'](#get-board-settings) `captcha.extra` property. Example: `"abcdefghijklmnopqrstuvwxyz"`.

Response:

```js
{
  // CAPTCHA ID.
  "cookie": "dcjvqjrucujvlefwgrnu",

  // The HTML tag that shows the CAPTCHA.
  // One could extract a base64-encoded image URL from it.
  "captchahtml": "<image src=\"data:image\/png;base64,iVBOR...K5CYII=\">",

  // CAPTCHA expiration time, in seconds.
  "expires_in": 120
}
```

### Report a post

Send a `POST` request of type `application/x-www-form-urlencoded` to a corresponding URL:
* `8kun.top` — `https://sys.8kun.top/report.php`
* `smuglo.io` — `/post.php`

Parameters:

* `board` — Board ID. Example: `board: "b"`.
* `delete_<post-id>` — Post ID as a key and `1` as a value. Example: `delete_1207093: 1` when reporting a post with ID `1207093`. This is a very lame way to pass the post ID to the API but that's `vichan` legacy.
* `reason` — Report reason text.
* `report: "Submit"` — Dunno. Perhaps could be omitted.

Also, sending a report might require supplying a [CAPTCHA solution](#get-a-captcha)in the parameters:

* `captcha_cookie` — CAPTCHA ID.
* `captcha_text` — CAPTCHA solution.

"Success" response example (HTML):

```html
...
<body class="..."><header><h1>Report submitted!</h1><div class="subtitle"></div></header>...</body>
...
```

I dunno if "success" response could be in JSON format. One could test if specifying `Accept: application/json` HTTP request header switches it in "JSON" mode.