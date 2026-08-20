enyo.kind({
	name: "AccuWeather.VideoModel",
	kind: enyo.Component,

	published: {
		videos: [],
		isDownloading: false,
	},

	components: [
		{name: "feed",
			kind: "WebService",	
			url: "http://api.brightcove.com/services/library?token=cSHJ4flajK4L9_fwXTXHvZo5KS4BT9p9XsohGo2POD4.&command=find_playlist_by_reference_id&output=mrss&page_size=1",
			onSuccess: "feedComplete_",
			onFailure: "feedError_",
			handleAs: "xml"}
	],

	events: {
		onVideoModelDidFinishRetrieving : "",
		onVideoModelDidFinishRetrievingWithError : "",
	},

	create: function() {
		this.inherited(arguments);
	},

	cancel: function() {
		this.$.feed.cancelCall();
	},

	retrieveLocalVideosForCode : function(code) {
		this.setIsDownloading(true);
		this.$.feed.call({reference_id: code});
	},

	retrieveNationalVideos : function() {
		this.setIsDownloading(true);
		this.$.feed.call({reference_id: "NATIONAL"});
	},

	retrieveInternationalVideos: function() {
		this.setIsDownloading(true);
		this.$.feed.call({reference_id: "WORLD"});
	},

	retrieveHurricaneVideos: function() {
		this.setIsDownloading(true);
		this.$.feed.call({reference_id: "TROPICS"});
	},

	feedComplete_: function(inSender, inResponse, inRequest) {
		try {
			this.setIsDownloading(false);
			this.parse_(inResponse);
			this.doVideoModelDidFinishRetrieving();
		} catch (err) {
			this.log(err);
			this.doVideoModelDidFinishRetrievingWithError();
		}
	},

	feedError_: function(document) {
		this.setIsDownloading(false);
		this.doVideoModelDidFinishRetrievingWithError();
	},

	// parses xml response, might throw exception if xpath query fails
	parse_: function(doc) {
		var videos = [];
		
		function nsResolve(prefix) {
           return "http://search.yahoo.com/mrss/";
		}
		var evaluator = new XPathEvaluator();

		var iterator = evaluator.evaluate("channel/item", doc.documentElement, nsResolve, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var node = iterator.iterateNext();

		while (node) {
			var video = [];
			video["title"] = evaluator.evaluate("title", node, nsResolve, XPathResult.STRING_TYPE, null).stringValue;
			video["description"] = evaluator.evaluate("description", node, nsResolve, XPathResult.STRING_TYPE, null).stringValue;
			video["url"] = evaluator.evaluate("media:content/attribute::url", node, nsResolve, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).nodeValue;
			video["thumbnail"] = evaluator.evaluate("media:thumbnail/attribute::url", node, nsResolve, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).nodeValue;
			video["width"] = evaluator.evaluate("media:thumbnail/attribute::width", node, nsResolve, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).nodeValue;
			video["height"] = evaluator.evaluate("media:thumbnail/attribute::height", node, nsResolve, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).nodeValue;

			videos.push(video);
			node = iterator.iterateNext();
		}
		this.setVideos(videos);
	},
});
