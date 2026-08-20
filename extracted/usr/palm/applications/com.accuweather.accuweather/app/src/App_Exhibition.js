enyo.kind({
	name: "AccuWeather.App_Exhibition",
	kind: enyo.VFlexBox,
	components: [
		{kind: "ApplicationEvents", onLoad: "onLoad", onWindowActivated: "onWindowActivated", onWindowDeactivated : "onWindowDeactivated"},
    	{name: "appModel", kind: "AccuWeather.AppModel", 
	    	onCurrentLocationIndexUpdated: "onCurrentLocationIndexUpdated",
	    	onWeatherModelUpdated: "onWeatherModelUpdated",
	    	onWeatherModelDownloadFailed: "onWeatherModelDownloadFailed"},
    	{name: "scrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [ {kind: "SpinnerLarge", showing: true}] },
    	{name: "pane", kind: "Pane", flex: 1, onSelectView: "onViewSelected", components: [ 
		    {name: "exhibition", kind: "AccuWeather.Exhibition"}
	    ]}
    ],
    
	activateEventCount : 0,
	timer: null,

    create: function() {
    	this.log();
    	this.inherited(arguments);
    	this.$.pane.selectViewByName("exhibition");
    },
    
    onViewSelected: function(inSender, inView, inPreviousView) {
    	this.log("view selected: " + inView.name);
    	
    	if (inView.onShow != null) {
    		inView.onShow();
    	}
    	
    	if(undefined != inPreviousView) {
    		if (inPreviousView.onHide != null) {
    			inPreviousView.onHide();
        	}
    	}
    },
    
    onLoad: function(inSender) {
    	this.log("window loaded")
    	this.$.scrim.show();
    	this.$.appModel.downloadWeatherForCurrentLocation();
    },
    
	onWindowActivated: function(inSender) {
		if (++this.activateEventCount > 0) {
			this.log("window reload");
//			this.$.appModel.downloadWeatherForCurrentLocation();
			locationModel = this.$.appModel.getLocationModel();
			locationModel.loadLocationsData();
			this.$.appModel.downloadWeatherForCurrentLocation();
		}
	},

    onWindowDeactivated: function(inSender) {
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    },

    cityTimerAdvance: function() {
    	this.log("advancing to the next city");
    	
    	var locationModel = this.$.appModel.getLocationModel();
    	var length = locationModel.getLocations().length;
    	var index = locationModel.getCurrentLocationIndex();
    	locationModel.setCurrentLocationByIndex( (index + 1) % length, false );
		this.$.appModel.downloadWeatherForCurrentLocation();
    },
    
    onWeatherModelUpdated: function() {
    	this.log("weather model updated");
    	
    	this.$.scrim.hide();
    	
    	var viewList = this.$.pane.getViewList();
    	for (var i = 0; i < viewList.length; i++) 
    	{
    		viewList[i].setAppModel(this.$.appModel);
    	}
    	
    	this.log("starting timer");
    	this.timer = setTimeout(this.cityTimerAdvance.bind(this), 180000 /5);
    }
});