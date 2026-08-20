var OverlayTypeLevel2Radar = 0;
var OverlayTypeSatelliteContinentalUS = 1;
var OverlayTypeSatelliteWorld = 2;

enyo.kind({
	name: "AccuWeather.OverlayOptionsModel",
	kind: enyo.Component,
	published: {
		overlayType: 0,
		overlayOpacity: 0.0,
		isMapLegendVisible: false
	},
	events: {
		onOverlayTypeChanged: "",
		onOverlayOpacityChanged: "",
		onIsMapLegendVisibleChanged: ""
	},
	
	create: function() 
	{
		this.inherited(arguments);
		
		// restore from cookies
		// ------------------------
		this.overlayType = enyo.getCookie("OverlayOptionsModel_overlayType");
		this.overlayOpacity = enyo.getCookie("OverlayOptionsModel_overlayOpacity");
		this.isMapLegendVisible = enyo.getCookie("OverlayOptionsModel_isMapLegendVisible");
		
		var resetPreferences = false;
		
		if (null == this.overlayType || null == this.overlayOpacity || null == this.isMapLegendVisible
				|| true == resetPreferences) {
			this.log("setting default preferences");
			
			this.overlayType = OverlayTypeLevel2Radar;
		    this.overlayOpacity = 0.50;
		    this.isMapLegendVisible = true;
		    this.savePreferences();
			
		} else {
			this.log("overlay options model preferences restored");
		}
	},
	
	isMapLegendVisibleChanged: function(oldValue) {
		this.savePreferences(); 
		this.doIsMapLegendVisibleChanged();
	},
	
	overlayTypeChanged: function(oldValue) { 
		this.savePreferences(); 
		this.doOverlayTypeChanged();
	},
	
	overlayOpacityChanged: function(oldValue) { 
		this.savePreferences(); 
		this.doOverlayOpacityChanged();
	},
	
  	savePreferences: function()
  	{
  		enyo.setCookie("OverlayOptionsModel_overlayType", this.overlayType);
  		enyo.setCookie("OverlayOptionsModel_overlayOpacity", this.overlayOpacity);
  		enyo.setCookie("OverlayOptionsModel_isMapLegendVisible", this.isMapLegendVisible);
  	}
});