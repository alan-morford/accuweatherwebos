HurricaneNewsItem = {
	TITLE : "title",
	LINK: "link",
	DESCRIPTION: "description",
};

enyo.kind({
	name: "AccuWeather.HurricaneNewsModel",
	kind: enyo.Component,

	components: [
		{name: "feed",
			kind: "WebService",	
			url: "https://iphonehurr.accu-weather.com/widget/iphonehurr/hurricane_rss.xml",
			onSuccess: "feedComplete_",
			onFailure: "feedError_",
			handleAs: "xml"}
	],

	events: {
		onHurricaneNewsDidFinish: "",
		onHurricaneNewsDidFinishWithError: "",
	},

	published: {
		isDownloading: false,
	},

	// private,
	evaluator: new XPathEvaluator(),
	news: null,

	create: function() {
		this.inherited(arguments);
	},

	download: function() {
		this.setIsDownloading(true);
		this.$.feed.call();
	},

	newsNum: function() {
		return this.news ? this.news.length : 0;
	},
	
	newsItem : function(index) {
		return this.news[index];
	},

	feedComplete_: function(inSender, inResponse, inRequest) {
		this.setIsDownloading(false);

		try {
			this.parse_(inResponse);
			this.doHurricaneNewsDidFinish();
		} catch (error) {
			this.error(error);
			this.doHurricaneNewsDidFinishWithError();
		}
	},
	
	feedError_: function() {
		this.setIsDownloading(false);
		this.doHurricaneNewsDidFinishWithError();
	},

	parse_: function(doc) {
		this.news = [];

		var iterator = this.evaluator.evaluate("channel/item", doc.documentElement, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var node = iterator.iterateNext();

		while (node) {
			var newsItem = [];
			
			this.getNewsItemProperty_(newsItem, HurricaneNewsItem.TITLE, "title", node);
			this.getNewsItemProperty_(newsItem, HurricaneNewsItem.LINK, "link", node);
			this.getNewsItemProperty_(newsItem, HurricaneNewsItem.DESCRIPTION, "description", node);

			this.news.push(newsItem);
			node = iterator.iterateNext();
		}
	},

	getNewsItemProperty_: function(itemData, key, query, node) {
		var result = this.evaluator.evaluate(query, 
												node,
												null,
												XPathResult.STRING_TYPE,
												null);	

		if (result.stringValue.length > 0)
			itemData[key] = result.stringValue;
	},
});
