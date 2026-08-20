// In-app reading view for a News tab article -- fetches the real extracted
// article body (not just GNews's truncated snippet) from the same reader-
// mode relay World Today uses (worker/src/index.js's handleArticleExtract,
// real Mozilla Readability run server-side), goes fullscreen the same way
// Maps.js's radar view does, with a fixed-size lead image floated top-right
// of the body text and a tap-to-fullscreen image overlay -- that combination
// (floated fixed-size thumbnail as a background-image div, not a flexed/
// sized <img>, plus a position:absolute close-button overlay for the full
// view) mirrors mlbatbat's app/extracted/.../views/ArticleReaderView.js,
// the closest existing precedent for a single-lead-image reader (unlike
// World Today's own PhotoGalleryView, which is a swipeable multi-photo
// gallery this app has no use for). Styled with this app's own dark/orange
// look (news.css), not either of those app's CSS.
enyo.kind({
	name: "AccuWeather.NewsArticle",
	kind: enyo.VFlexBox,
	// Anchor for fullScreenImageOverlay's position:absolute below -- needs
	// to cover this entire view, not whatever ancestor happens to be
	// position:relative further up the tree.
	className: "accuweather-body newsarticle",

	events: {
		onBack: "",
		onFullScreenToggle: ""
	},

	published: {
		fullScreen: false
	},

	ARTICLE_EXTRACT_URL_: "https://usatoday-relay.alanmorford.workers.dev/articles/extract?url=",
	RESIZE_URL_: "https://usatoday-relay.alanmorford.workers.dev/resize?path=#p#&width=#w#&height=#h#",
	// fit=inside, not the thumbnail's cropping "cover" -- the full-screen
	// view shouldn't cut anything off.
	RESIZE_FULL_URL_: "https://usatoday-relay.alanmorford.workers.dev/resize?path=#p#&width=#w#&height=#h#&fit=inside",

	components: [
		{name: "openApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
		{kind: "WebService", name: "extractService", handleAs: "json", onSuccess: "onExtractSuccess", onFailure: "onExtractFailure"},

		{kind: "HFlexBox", className: "newsarticle-toolbar", components: [
			{kind: "Button", className: "enyo-button-dark newsarticle-backbutton", content: "< Back", onclick: "onBackClick"},
			{flex: 1}
		]},

		{kind: "enyo.Scroller", name: "scroller", flex: 1, className: "newsarticle-scroller", components: [
			// Explicit padded wrapper around the actual content, rather than
			// padding on the Scroller itself -- confirmed the padding-on-
			// Scroller version wasn't visibly taking effect on-device.
			{name: "scrollerContent", className: "newsarticle-scrollercontent", components: [
				// Floated top-right, fixed size regardless of the source photo's
				// own aspect ratio (background-image + background-size:cover on
				// a plain Control, not an <img> -- sidesteps this old WebKit's
				// unreliable sizing of <img> as a replaced element, same lesson
				// learned building Maps.js's radar view). Text in articleBody
				// below wraps to its left via the float.
				{name: "imageWrapper", className: "newsarticle-imagewrapper", showing: false, onclick: "onImageTap", components: [
					{name: "articleImage", kind: "Control", className: "newsarticle-image"},
					{name: "imageCaption", className: "newsarticle-imagecaption", allowHtml: true}
				]},

				{name: "articleTitle", content: "", className: "newsarticle-title", allowHtml: true},
				{name: "articleByline", content: "", className: "newsarticle-byline"},
				{name: "articleBody", content: "", className: "newsarticle-body", allowHtml: true}
			]}
		]},

		{name: "scrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [ {kind: "SpinnerLarge", showing: true}] },

		// Full-screen image viewer -- shown/hidden in place (position:
		// absolute over this whole view) rather than a separate pane, since
		// it's a same-article detail popup, not real navigation. Header row
		// reuses the exact same kind/className as the real Back button
		// above (newsarticle-toolbar/enyo-button-dark/newsarticle-backbutton)
		// so Close matches it in both style and position, not a one-off look.
		{name: "fullScreenImageOverlay", kind: enyo.VFlexBox, className: "newsarticle-fullscreenimageoverlay", showing: false, components: [
			{kind: "HFlexBox", className: "newsarticle-toolbar", components: [
				// Plain text, not a Unicode "X" -- this old WebKit's bundled
				// fonts don't reliably have that glyph (confirmed the hard
				// way building mlbatbat's own version of this).
				{kind: "Button", className: "enyo-button-dark newsarticle-backbutton", content: "Close", onclick: "onCloseFullScreenImage"},
				{flex: 1}
			]},
			{name: "imageCenterBox", kind: enyo.VFlexBox, flex: 1, pack: "center", align: "center", components: [
				{name: "fullScreenImg", kind: "Image", className: "newsarticle-fullscreenimg"},
				{name: "fullScreenCaption", className: "newsarticle-fullscreencaption"}
			]}
		]},
	],

	create: function() {
		this.inherited(arguments);
		this.$.scrim.hide();

		// A raw HTML string can't reference "this" -- the extracted body and
		// the paywall fallback below both inject an inline onclick that opens
		// the real system browser (a plain <a href> would just navigate this
		// app's own webview away instead).
		var self = this;
		window.accuwxOpenExternal = function(url) {
			self.$.openApp.call({id: "com.palm.app.browser", params: {target: url}});
		};
	},

	fullScreenChanged: function(oldValue) {
		this.doFullScreenToggle(this.fullScreen);
	},

	onBackClick: function() {
		this.setFullScreen(false);
		this.doBack();
	},

	setArticle: function(item) {
		this.article = item;
		this.displayedImage = false;
		this.currentImageSource = "";

		this.setFullScreen(true);

		this.$.imageWrapper.hide();
		this.$.fullScreenImageOverlay.hide();

		this.$.articleTitle.setContent(item.title || "");
		this.$.articleByline.setContent(item.byline || "");

		if (item.imageSource) {
			this.applyImage(item.imageSource, item.imageCredit, item.imageCaption);
		}

		this.$.extractService.cancel();
		if (item.shortUrl) {
			this.$.scrim.show();
			this.$.articleBody.setContent("");
			this.$.extractService.setUrl(this.ARTICLE_EXTRACT_URL_ + encodeURIComponent(item.shortUrl));
			this.$.extractService.call();
		} else {
			this.$.articleBody.setContent(this.buildFallbackBody());
		}
	},

	onExtractSuccess: function(inSender, inResponse) {
		this.$.scrim.hide();

		if (!this.displayedImage && inResponse && inResponse.leadImage) {
			this.applyImage(inResponse.leadImage, this.article && this.article.source, this.article && this.article.title);
		}

		if (!inResponse || !inResponse.success || !inResponse.content) {
			this.$.articleBody.setContent(this.buildFallbackBody());
			return;
		}
		this.$.articleBody.setContent(inResponse.content);
	},

	// Any failed extraction (paywall, consent wall, non-article page, plain
	// fetch failure) shows the same "read it elsewhere" fallback -- trying
	// to distinguish every failure shape GNews's source sites can throw is a
	// losing game, same reasoning World Today's own ArticleView.js documents.
	onExtractFailure: function(inSender, inResponse) {
		this.$.scrim.hide();
		if (!this.displayedImage && inResponse && inResponse.leadImage) {
			this.applyImage(inResponse.leadImage, this.article && this.article.source, this.article && this.article.title);
		}
		this.$.articleBody.setContent(this.buildFallbackBody());
	},

	buildFallbackBody: function() {
		var abstract = (this.article && this.article.abstract) || "";
		var source = (this.article && this.article.source) || "";
		var shortUrl = (this.article && this.article.shortUrl) || "";

		var intro = source
			? "This article couldn't be loaded in-app. Read it at " + this.escapeHtmlText(source)
			: "This article couldn't be loaded in-app. Read it";

		var link = shortUrl
			? " <a href=\"#\" onclick=\"window.accuwxOpenExternal('" + this.escapeHtmlText(shortUrl) + "'); return false;\">in the browser</a>."
			: ".";

		return "<p>" + this.escapeHtmlText(abstract) + "</p><p><i>" + intro + link + "</i></p>";
	},

	escapeHtmlText: function(str) {
		return String(str).replace(/[&<>"']/g, function(c) {
			return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[c];
		});
	},

	// Applies the thumbnail regardless of where it came from (the GNews
	// image setArticle starts with, or the extraction's og:image fallback
	// above) -- source is pre-encoded already (see NewsModel.js), so it's
	// substituted into RESIZE_URL_ with a raw string replace, not
	// encodeURIComponent again.
	applyImage: function(source, credit, caption) {
		this.log("NewsArticle.applyImage: source=" + source);
		this.currentImageSource = source;
		this.currentImageCredit = credit || "";
		this.currentImageCaption = caption || "";
		this.displayedImage = true;

		var thumbSrc = this.RESIZE_URL_.replace("#p#", source).replace("#w#", "280").replace("#h#", "280");
		this.$.articleImage.applyStyle("background-image", "url(\"" + thumbSrc + "\")");
		this.$.imageCaption.setContent(credit || "");
		this.$.imageWrapper.show();
	},

	onImageTap: function(inSender, inEvent) {
		this.log("NewsArticle.onImageTap fired, currentImageSource=" + this.currentImageSource);
		if (!this.currentImageSource) return;
		var fullSrc = this.RESIZE_FULL_URL_.replace("#p#", this.currentImageSource).replace("#w#", "1024").replace("#h#", "768");
		this.log("NewsArticle.onImageTap: fullSrc=" + fullSrc);
		var caption = this.currentImageCredit + (this.currentImageCaption ? " — " + this.currentImageCaption : "");
		this.$.fullScreenCaption.setContent(caption);
		this.$.fullScreenImageOverlay.show();

		// max-width/max-height:100% CSS alone doesn't reliably render a
		// plain <img> on this device -- confirmed directly (this exact bug:
		// caption shows, image doesn't) and already worked around the same
		// way for Maps.js's radar image: wait for the real load, then set
		// explicit HTML width/height attributes computed from the natural
		// size, rather than trusting CSS sizing on the <img> itself.
		var self = this;
		var node = this.$.fullScreenImg.hasNode();
		if (node) {
			node.onload = function() {
				self.log("NewsArticle fullScreenImg onload: natural=" + node.naturalWidth + "x" + node.naturalHeight);
				self.resizeFullScreenImageToFit();
			};
			node.onerror = function() {
				self.log("NewsArticle fullScreenImg onerror: " + fullSrc);
			};
		} else {
			this.log("NewsArticle.onImageTap: fullScreenImg hasNode() returned null");
		}
		this.$.fullScreenImg.setSrc(fullSrc);
	},

	resizeFullScreenImageToFit: function() {
		var node = this.$.fullScreenImg.hasNode();
		var containerNode = this.$.imageCenterBox.hasNode();
		if (!node || !containerNode || !node.naturalWidth || !node.naturalHeight) {
			this.log("NewsArticle.resizeFullScreenImageToFit: bailing, node=" + !!node + " containerNode=" + !!containerNode);
			return;
		}

		var containerW = containerNode.clientWidth;
		var containerH = containerNode.clientHeight;
		this.log("NewsArticle.resizeFullScreenImageToFit: container=" + containerW + "x" + containerH +
			" natural=" + node.naturalWidth + "x" + node.naturalHeight);
		if (containerW <= 0 || containerH <= 0) return;

		// Never upscale past the source's own resolution -- 1024x768 already
		// requested above, so this is only ever shrinking to fit.
		var scale = Math.min(containerW / node.naturalWidth, containerH / node.naturalHeight, 1);
		// Compute both dimensions from naturalWidth/naturalHeight BEFORE
		// assigning either -- confirmed on-device that setting node.width
		// first invalidates node.naturalHeight (reads back as 0) before the
		// node.height line runs, silently zeroing the image's height.
		var targetWidth = Math.round(node.naturalWidth * scale);
		var targetHeight = Math.round(node.naturalHeight * scale);
		node.width = targetWidth;
		node.height = targetHeight;
		this.log("NewsArticle.resizeFullScreenImageToFit: set to " + node.width + "x" + node.height);
	},

	onCloseFullScreenImage: function() {
		this.log("NewsArticle.onCloseFullScreenImage fired");
		this.$.fullScreenImageOverlay.hide();
	},
});
