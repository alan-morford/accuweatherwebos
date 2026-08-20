
var MAX_FRAMES = 6;

enyo.kind({
	name: "AccuWeather.FrameListModel",
	kind: enyo.Component,
	components: [
        { kind: "WebService", handleAs: "xml", onSuccess: "onWebServiceSuccess", onFailure: "onWebServiceFailure"}
    ],
	
	events: {
		onFrameListDownloadComplete: "",
		onFrameListDownloadFailed: ""
	},
	published: {
		frameTimes: [],
		frameCount: 0,
		tileDataLocation: "",
		maxZoomLevel: 0
	},
	
	create: function() {
		this.inherited(arguments);
	},
	
	getFrameList: function(overlayType) {
		var feedLocation = "https://vortex.accuweather.com/tiles/xml/";
		
		if (overlayType == OverlayTypeLevel2Radar) {
			feedLocation += "l2radar";
		}
		else if (overlayType == OverlayTypeSatelliteContinentalUS) {
			feedLocation += "satconus";
		}
		else { // overlayType == OverlayTypeSatelliteWorld
			feedLocation += "worldsat";
		}
		
		feedLocation += ".xml?cbt=";
		
		// Round minutes of current time and date to 5 minutes
		var dateFormatter = new enyo.g11n.DateFmt("yyyyMMddHHmm");
		var date = new Date();
		date.setMinutes(Math.floor(date.getMinutes() / 5) * 5);
		
		feedLocation += dateFormatter.format(date);
		this.log("feedLocation: " + feedLocation);
		this.frameTimes = [];
		this.tileDataLocation = "";
		this.maxZoomLevel = 0;
		
		this.$.webService.setUrl(feedLocation);
		this.$.webService.call();
	},
	
	onWebServiceSuccess: function(inSender, inResponse, inRequest) {
		this.log("web service call succeeded");
		var frames = inResponse.getElementsByTagName("frame");
		
		// get the frame times
		for (var i=0; i < frames.length; i++) {
			this.frameTimes.push(frames[i].getAttribute("hhmm"));
		}
		
		// trim the array to a max of MAX_FRAMES
		this.frameTimes.splice(0, this.frameTimes.length - MAX_FRAMES);
		this.frameCount = this.frameTimes.length;
		
		// get the other attributes
		this.tileDataLocation = inResponse.getElementsByTagName("dataLocation")[0].getAttribute("url");
		this.maxZoomLevel = inResponse.getElementsByTagName("max_zoom_level")[0].childNodes[0].nodeValue;
			
		this.doFrameListDownloadComplete();
	},
	
	onWebServiceFailure: function(inSender, inResponse, inRequest) {
		this.error("web service call failure");
		this.doFrameListDownloadFailed();
	}
});
