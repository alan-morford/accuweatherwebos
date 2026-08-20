// News tab. The article list itself keeps this app's own look (news.css) --
// only the underlying data source and the "tap an article" behavior changed:
// real weather-news articles, scoped to the user's current location, from
// the same shared relay World Today and MLB At Bat already use (see
// NewsModel.js), opened in an in-app reading view (NewsArticle.js) instead
// of launching the system browser, the same way World Today's own
// ArticleView works (worker/src/index.js's handleArticleExtract) -- just
// restyled to match this app instead of copying World Today's CSS.
enyo.kind({
	name: "AccuWeather.News",
	kind: enyo.VFlexBox,
	className: "accuweather-body news",

	events: {
		onFullScreenToggle: ""
	},

	// UI ELEMENTS
	components: [
	    {kind: "ApplicationEvents"},
		{name: "newsModel", kind: "AccuWeather.NewsModel", onNewsModelDownloadComplete: "onNewsModelDownloadComplete", onNewsModelDownloadFailed: "onNewsModelDownloadFailed"},

		{name: "newsPane", kind: "Pane", flex: 1, components: [
			{name: "list", kind: enyo.VFlexBox, components: [
				{kind: "enyo.Scroller", flex: 1, components: [
					{kind: "VirtualRepeater", name: "internationalRepeater", onSetupRow: "onInternationalSetupRow", components: [
						{kind: "Item", name: "internationalItem", layoutKind: "VFlexLayout", className: "news-rowitem", onclick: "onInternatioanlRowItemClick", components: [
							{name: "internationalTitle", kind: "Control", className: "news-titletext"},
							{name: "internationalDescription", kind: "Control", className: "news-descriptiontext"},
						]}
					]}
				]},
				{name: "gradientImage", kind: "Image", src: "images/black_gradient.png", className:"news-gradientimage"},
				{name: "scrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [ {kind: "SpinnerLarge", showing: true}] }
			]},
			{name: "article", kind: "AccuWeather.NewsArticle", onBack: "onArticleBack", onFullScreenToggle: "onArticleFullScreenToggle"}
		]}
	],

	published: {
		appModel: null // required for all views
	},
	selectedItemIndex: -1,
	selectedRepeater: null,
	_newsArticles: [],
	downloadsCount: 0,

	create: function()  {
		this.inherited(arguments);
	},

	onShow: function() {
		this.visible = true;
		this.$.newsPane.selectViewByName("list", true);
		this.refreshNews();
	},

	onHide: function() {
		this.log("hiding");
		this.visible = false;
		// So re-opening the tab later always starts back at the list, not
		// mid-article with the header chrome still hidden.
		this.$.article.setFullScreen(false);
		this.$.newsPane.selectViewByName("list", true);
	},

	// Fires on every weather update, including the periodic background
	// refresh (App_Interactive.js's DATA_REFRESH_INTERVAL) for the SAME
	// location -- only actually re-search when the city genuinely changed
	// (and only while this tab is the one showing), so switching locations
	// while already on the News tab picks up the new city's results
	// without re-hitting the shared relay's GNews quota on every unrelated
	// weather refresh.
	appModelChanged: function(oldAppModel) {
		if (!this.visible) return;

		var city = this.appModel && this.appModel.getWeatherModel().getLocal()[AccuWeather_WeatherModel_Keys.city];
		if (city && city !== this._lastFetchedCity) {
			this.$.newsPane.selectViewByName("list", true);
			this.refreshNews();
		}
	},

	refreshNews: function() {
		var local = this.appModel && this.appModel.getWeatherModel().getLocal();
		var city = local && local[AccuWeather_WeatherModel_Keys.city];
		var countryCode = local && local[AccuWeather_WeatherModel_Keys.countrycode];
		var state = local && local[AccuWeather_WeatherModel_Keys.state];
		this._lastFetchedCity = city;
		this.$.scrim.show();
		this.$.newsModel.startDownload(city, countryCode && countryCode.toLowerCase(), state);
	},

	onNewsModelDownloadComplete: function() {
		this.log("news model download complete");
		this._newsArticles = this.$.newsModel.getNewsArticles();
		this.$.internationalRepeater.render();

		this.updateUI();
	},

	onNewsModelDownloadFailed: function() {
		this.log("news model download failed");
		this._newsArticles = [];
		this.$.internationalRepeater.render();
		this.updateUI();
	},

	updateUI: function() {
		if (++this.downloadsCount == 1) {
			this.$.scrim.hide();
			this.downloadsCount = 0;
		}
	},

	onInternationalSetupRow: function(inSender, inIndex) {
		if (inIndex >= 0 && inIndex < this._newsArticles.length) {
			this.$.internationalTitle.setContent(this._newsArticles[inIndex].title);
			this.$.internationalDescription.setContent(this._newsArticles[inIndex].abstract);

			if (this.selectedItemIndex == inIndex) {
				this.$.internationalItem.addClass("news-rowitem-selected");
			} else {
				this.$.internationalItem.removeClass("news-rowitem-selected");
			}

			return true;
		}
		return false;
	},

	onInternatioanlRowItemClick: function(inSender, inEvent) {
		var previousSelected = this.selectedItemIndex;
		this.selectedItemIndex = inEvent.rowIndex;

		if (-1 != previousSelected) {
			this.selectedRepeater.renderRow(previousSelected);
		}
		this.$.internationalRepeater.renderRow(this.selectedItemIndex);

		this.selectedRepeater = this.$.internationalRepeater;

		var item = this._newsArticles[inEvent.rowIndex];
		if (!item) return;

		this.$.article.setArticle(item);
		this.$.newsPane.selectViewByName("article", true);
	},

	onArticleBack: function() {
		this.$.newsPane.selectViewByName("list", true);
	},

	// Relayed up to App_Interactive the same way Maps.js's own fullscreen
	// toggle is -- see App_Interactive.js's onSectionFullScreenToggle.
	onArticleFullScreenToggle: function(inSender, fullScreen) {
		this.doFullScreenToggle(fullScreen);
	},
});
