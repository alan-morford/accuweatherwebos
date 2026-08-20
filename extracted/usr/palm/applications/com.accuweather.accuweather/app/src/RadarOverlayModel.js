enyo.kind({
	name: "AccuWeather.RadarOverlayModel",
	kind: enyo.Component,
	
	published: {
		tiles: []
	},
	events: {
		onDownloadTilesComplete: "",
		onDownloadTilesFailed: ""
	},
	
	components: [
		{name: "frameList", kind: "AccuWeather.FrameListModel", 
			onFrameListDownloadComplete: "onFrameListDownloadComplete",
			onFrameListDownloadFailed: "onFrameListDownloadFailed"}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	getFrameList: function() { 
		return this.$.frameList; 
	},
	
	downloadTiles: function(overlayType) {
		
		this.tiles = {};
		this.$.frameList.getFrameList(overlayType);
	},
	
	onFrameListDownloadComplete: function() {
  		this.doDownloadTilesComplete();
  	},
  	
  	onFrameListDownloadFailed: function() {
  		this.error(" failed to download tile list data");
  	}
	
});