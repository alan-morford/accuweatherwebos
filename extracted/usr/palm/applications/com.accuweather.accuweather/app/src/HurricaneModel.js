HurricaneKeys =
{
	NAME : "name",
	LEVEL : "level",
	LEVEL_CODE: "levelCode",
	SPEED : "speed",
	LATITUDE : "lat",
	LONGITUDE : "lon",
	WIND_SPEED : "wspeed",
	DIRECTION : "dir",
	GUST : "gust",
	PRES : "pres",
};

enyo.kind({
	name: "AccuWeather.HurricaneModel",
	kind: enyo.Component,

	published: {
		basins: null,
		storms: null,
		isDownloading: false,
	},

	components: [
		{name: "feed",
			kind: "WebService",	
			url: "http://iphonehurr.accu-weather.com/widget/iphonehurr/hurricane_data.xml",
			onSuccess: "feedComplete_",
			onFailure: "feedError_",
			handleAs: "xml"}
	],

	events: {
		onHurricaneModelDidFinish: "",
		onHurricaneModelDidFinishWithError: "",
	},

	// private,
	evaluator: new XPathEvaluator(),

	create: function() {
		this.inherited(arguments);
	},

	download: function() {
		this.setIsDownloading(true);
		this.$.feed.call();
	},

	feedComplete_: function(inSender, inResponse, inRequest) {
		this.setIsDownloading(false);

		try {
			this.parseStorms_(inResponse);
			this.parseBasins_(inResponse);
			this.doHurricaneModelDidFinish();
		} catch (error) {
			this.log("ERR: "+ error);
			this.doHurricaneModelDidFinishWithError();
		}
	},
	
	feedError_: function() {
		this.setIsDownloading(false);
		this.doHurricaneModelDidFinishWithError();
	},
	
	parseStorms_: function(doc) {
		var storms = [];

		var iterator = this.evaluator.evaluate("hurricane/basin/storms/storm", doc.documentElement, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var node = iterator.iterateNext();

		while (node) {
			var stormData = [];
			stormData[HurricaneKeys.NAME] = node.getAttribute("name");
			
			var levelCode = this.evaluator.evaluate("level", 
															node,
															null,
															XPathResult.STRING_TYPE,
															null).stringValue
			
			stormData[HurricaneKeys.LEVEL] = this.translateLevel_(levelCode);
			stormData[HurricaneKeys.LEVEL_CODE] = levelCode;
			this.getStormProperty_(stormData, HurricaneKeys.PRES, "pres", node);
			this.getStormProperty_(stormData, HurricaneKeys.SPEED, "speed", node)
			this.getStormProperty_(stormData, HurricaneKeys.LATITUDE, "position/lat", node);
			this.getStormProperty_(stormData, HurricaneKeys.LONGITUDE, "position/lon", node);
			this.getStormProperty_(stormData, HurricaneKeys.WIND_SPEED, "wind/wspeed", node);
			this.getStormProperty_(stormData, HurricaneKeys.DIRECTION, "wind/dir", node);
			this.getStormProperty_(stormData, HurricaneKeys.GUST, "wind/gust", node);
			storms.push(stormData);
			node = iterator.iterateNext();
		}
		

		var stormData = [];
		stormData[HurricaneKeys.NAME] = "Test hurricane";
		var levelCode = "H3"
	
		stormData[HurricaneKeys.LEVEL] = this.translateLevel_(levelCode);
		stormData[HurricaneKeys.LEVEL_CODE] = levelCode;
		stormData[HurricaneKeys.PRES] = "12";
		stormData[HurricaneKeys.SPEED] = "42";
		stormData[HurricaneKeys.LATITUDE] = "40.71427";
		stormData[HurricaneKeys.LONGITUDE] = "-74.00597";
		stormData[HurricaneKeys.WIND_SPEED] = "43";
		stormData[HurricaneKeys.DIRECTION] = "NE";
		stormData[HurricaneKeys.GUST] = "23";
		stormData[HurricaneKeys.PRES] = "44";
		storms.push(stormData);

		this.setStorms(storms);
	},

	parseBasins_: function(doc) {
		var basins = {};

		var iterator = this.evaluator.evaluate("hurricane/basin", doc.documentElement, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var node = iterator.iterateNext();

		while (node) {
			basins[node.getAttribute("name")] = parseInt(node.getAttribute("active")) != 0;
			node = iterator.iterateNext();
		}
		
		this.setBasins(basins);
	},

	getStormProperty_: function(stormData, key, query, node) {
		var result = this.evaluator.evaluate(query, 
												node,
												null,
												XPathResult.STRING_TYPE,
												null);	

		if (result.stringValue.length > 0)
			stormData[key] = result.stringValue;
	},

	translateLevel_: function(level) {
		if (level == "ST") return "Sub-Tropical Storm";
        else if (level == "TS") return "Tropical Storm";
        else if (level == "TD") return "Tropical Depression";
        else if (level == "TR") return "Tropical Rain-Storm";
        else if (level == "H1") return "Category 1 Hurricane";
        else if (level == "H2") return "Category 2 Hurricane";
        else if (level == "H3") return "Category 3 Hurricane";
        else if (level == "H4") return "Category 4 Hurricane";
        else if (level == "H5") return "Category 5 Hurricane";
        else if (level =="level") return "";
	},
});
