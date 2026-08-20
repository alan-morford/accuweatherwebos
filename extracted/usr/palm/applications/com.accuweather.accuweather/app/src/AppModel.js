var AppModelEvents = {
	OVERLAYOPTIONS_TYPECHANGED: 0,
	OVERLAYOPTIONS_OPACITYCHANGED: 1,
	OVERLAYOPTIONS_ISMAPLEGENDVISIBLECHANGED: 2,
	// ... always build from here ...
	SIZE: 3 // !!! always update to size of list above !!!
};


enyo.kind({
	name: "AccuWeather.AppModel",
	kind: enyo.Component,
	components: [
	    {name: "weatherModel", kind: "AccuWeather.WeatherModel", 
	    	onWeatherDownloadComplete: "onWeatherDownloadComplete",
	    	onWeatherDownloadFailed: "onWeatherDownloadFailed"},
	    {name: "unitsModel", kind: "AccuWeather.UnitsModel", 
	    	onUnitsModelChanged: "onUnitsModelChanged"},
	    {name: "locationModel", kind: "AccuWeather.LocationModel", 
	    	onCurrentLocationIndexChanged: "onCurrentLocationIndexChanged",
	    	onLocationsChanged: "onLocationsChanged",
			onLocationRemoved: "onLocationRemoved"},
	    {name: "lifestyleModel", kind: "AccuWeather.LifestyleModel"},
	    {name: "overlayOptionsModel", kind: "AccuWeather.OverlayOptionsModel", 
	    	onOverlayTypeChanged: "onOverlayOptionsOverlayTypeChanged",
	    	onOverlayOpacityChanged: "onOverlayOptionsOverlayOpacityChanged",
	    	onIsMapLegendVisibleChanged: "onOverlayOptionsIsMapLegedVisibleChanged"},

		{kind: "ApplicationEvents", 
			onWindowParamsChange: "windowParamsChanged"}
    ],
	events: {
	    onWeatherModelUpdated: "",
	    onWeatherModelDownloadFailed: "",
	    onLocationsUpdated: "",
	    onCurrentLocationIndexUpdated: "",
	    onUnitsUpdated: ""
	},
	
	create: function() {
		this.inherited(arguments);
		this.callbacks_= new Array(AppModelEvents.SIZE);

		for (var i=0; i < AppModelEvents.SIZE; i++) {
			this.callbacks_[i] = new Array();
		}
	},

	windowParamsChanged: function(inSender, inEvent) {
		var params = inEvent.params;
		if (params.unitsChanged)
			this.$.unitsModel.reloadPreferences();
		if (params.locationsChanged)
			this.$.locationModel.locationsDataChanged();
    },
	
	subscribeToEvent: function(eventID, callback) {
		return this.callbacks_[eventID].push(callback) - 1;
	},
	
	unsubscribeToEvent: function(eventID, index) {
		this.callbacks_[eventID][index] = null;
	},
	
	triggerEvent: function(eventID) {
		for (var i=0; i < this.callbacks_[eventID].length; i++) {
			if (null != this.callbacks_[eventID][i]) {
				this.callbacks_[eventID][i]();
			}
		}
	},
	
	onOverlayOptionsOverlayTypeChanged: function() {
		this.triggerEvent(AppModelEvents.OVERLAYOPTIONS_TYPECHANGED);
	},
	
	onOverlayOptionsOverlayOpacityChanged: function() {
		this.triggerEvent(AppModelEvents.OVERLAYOPTIONS_OPACITYCHANGED);
	},
	
	onOverlayOptionsIsMapLegedVisibleChanged: function() {
		this.triggerEvent(AppModelEvents.OVERLAYOPTIONS_ISMAPLEGENDVISIBLECHANGED);
	},
	
	onUnitsModelChanged: function(inSender, changedByUser, unitsChangedType) {

		if (changedByUser) {
			function callback(window) {
				enyo.windows.setWindowParams(window, {unitsChanged: true});
			}
			this.notifyWindows(callback);
		}
		this.doUnitsUpdated(unitsChangedType);
	},
	
	onWeatherDownloadComplete: function() {
		this.log("weather download complete");
		this.$.lifestyleModel.initFromAppModel(this);
		
		this.doWeatherModelUpdated(this.$.weatherModel);
	},
	
	onWeatherDownloadFailed: function() {
		this.error("weather model download failed");
		this.doWeatherModelDownloadFailed();
	},
	
	getLifestyleModel: function() {
		return this.$.lifestyleModel;
	},
	
	getLocationModel: function() { 
		return this.$.locationModel; 
	},
	
	getUnitsModel: function() { 
		return this.$.unitsModel; 
	},
	
	getWeatherModel: function() { 
		return this.$.weatherModel; 
	},
	
	getOverlayOptionsModel: function() {
		return this.$.overlayOptionsModel;
	},
	
	downloadWeatherForCurrentLocation: function() {
		this.log("downloading weather for current location");
		this.$.weatherModel.download(this.$.locationModel.getCurrentLocation().location, this.$.unitsModel.getMetric());
	},
	
	onCurrentLocationIndexChanged: function(inSender, index) {
		this.log("setting current location by index: " + index);
		this.doCurrentLocationIndexUpdated(index);
		
		if (-1 != index) {
			this.downloadWeatherForCurrentLocation();
		}
	},
	
	onLocationsChanged: function(inSender, locations) {
		this.log("locations changed");

		function callback(window) {
			enyo.windows.setWindowParams(window, {locationsChanged: true});
		}
		this.notifyWindows(callback);
		this.doLocationsUpdated(locations);
	},

	onLocationRemoved: function(inSender, location) {
		this.log("Location removed " + location.location);

		var window = enyo.windows.fetchWindow(location.location);
		
		if (window) {
			this.log("closing window");
			window.close();
		}
	},
	
	notifyWindows: function(callback) {
		var windows = enyo.windows.getWindows();
		var locationsModel = this.$.locationModel;

		this.log("Notify windows from " + locationsModel.getCurrentLocation().location + " " + locationsModel.getCurrentLocation().city);
		
		for (var i in windows) {
			this.log(i);
			if (i != locationsModel.getCurrentLocation().location) {
				this.log("sending");
				callback(enyo.windows.fetchWindow(i));
			}
		}
	},
});

