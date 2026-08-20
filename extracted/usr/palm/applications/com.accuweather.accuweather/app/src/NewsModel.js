// AccuWeather's own news feed (rss.accuweather.com) has been dead for years
// -- this now pulls from the same shared news relay World Today
// (com.usatoday.webos) and MLB At Bat already use, querying its "weather"
// section (real weather-news articles via GNews, added specifically for
// this app -- see worker/src/index.js's SECTION_CONFIG/NEWS_COUNTRIES).
// Response shape is that relay's "legacy" JSON (stories[0].xml[0].article[]),
// the same shape World Today's own client parses -- see that project's
// worker/src/index.js reshapeToLegacy() for the exact fields.

function NewsArticle(item) {
    this.title = item.title || "";
    this.abstract = item.abstract || "";
    this.byline = item.byline || "";
    this.source = item.source || "";
    this.shortUrl = item.shortUrl || "";
    // Only the shape NewsArticle.js (the reading view) actually needs --
    // the large_4_3 thumbnail's pre-encoded source, plus its credit/caption.
    this.imageSource = "";
    this.imageCredit = "";
    this.imageCaption = "";
    if (item.images && item.images[0] && item.images[0].image) {
        for (var i = 0; i < item.images[0].image.length; i++) {
            var image = item.images[0].image[i];
            if (image.format === "large_4_3") {
                this.imageSource = image.source || "";
                this.imageCredit = image.credit || "";
                this.imageCaption = image.caption || "";
                break;
            }
        }
    }
};

enyo.kind({
    name: "AccuWeather.NewsModel",
    kind: enyo.Component,
    published: {
        newsArticles: []
    },
    NEWSURL_: "https://usatoday-relay.alanmorford.workers.dev/articles/weather",
    events: {
        onNewsModelDownloadComplete: "",
        onNewsModelDownloadFailed: ""
    },

    create: function() {
        this.inherited(arguments);
        this.log("created");
    },

    // location narrows results to weather news about that place (e.g.
    // "Chicago" -> a "Chicago weather" search server-side, see worker/
    // src/index.js's handleArticles) instead of generic weather news.
    // country (a 2-letter code, e.g. "nl", "de") selects which language/
    // country-restricted GNews search to run -- without it the relay
    // defaults to country=us + English "weather", which returns nothing for
    // a search like "Nuth weather" (a small NL town no US outlet covers) or
    // "München weather" (US sources don't write "München", they'd say
    // "Munich", plus in English, not German).
    // state (e.g. "Illinois", "Limburg") is a fallback the relay only tries
    // if the city-level search comes back empty -- a small town frequently
    // has no dedicated news coverage of its own (confirmed live for a real
    // small Dutch town) even though its state/region does.
    startDownload: function(location, country, state) {
        this.log("starting to download news, location: " + location + " country: " + country + " state: " + state);

        var url = this.NEWSURL_;
        var params = [];
        if (location) params.push("location=" + encodeURIComponent(location));
        if (country) params.push("country=" + encodeURIComponent(country));
        if (state) params.push("state=" + encodeURIComponent(state));
        if (params.length) url += "?" + params.join("&");

        this.xmlhttp_ = new XMLHttpRequest();
        this.xmlhttp_.onreadystatechange = this.onXMLHTTPRequestReadyStateChange.bind(this);
        this.xmlhttp_.open("GET", url, true);
        this.xmlhttp_.send();
    },

    onXMLHTTPRequestReadyStateChange: function() {
        if (this.xmlhttp_.readyState != 4) return;

        if (this.xmlhttp_.status != 200) {
            this.error("news download failed, status: " + this.xmlhttp_.status);
            this.doNewsModelDownloadFailed();
            return;
        }

        this.log("news response received.");

        var data;
        try {
            data = JSON.parse(this.xmlhttp_.responseText);
        } catch (e) {
            this.error("news response was not valid JSON: " + e);
            this.doNewsModelDownloadFailed();
            return;
        }

        var items = (data.stories && data.stories[0] && data.stories[0].xml &&
            data.stories[0].xml[0] && data.stories[0].xml[0].article) || [];

        this.log("result count: " + items.length);

        this.newsArticles = [];
        for (var i = 0; i < items.length; i++) {
            this.newsArticles.push(new NewsArticle(items[i]));
        }

        this.doNewsModelDownloadComplete();
    }

});
