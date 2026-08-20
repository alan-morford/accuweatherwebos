enyo.kind({
	name: "AccuWeather.Current",
	kind: enyo.Control,
    className: "accuweather-body current",
	components: [
		{kind: "ApplicationEvents", onWindowRotated: "onWindowRotated" },
		{name : "launchBrowserCall", kind : "PalmService", service : "palm://com.palm.applicationManager/", method : "launch"},
		{name: "weatherAlertButton", kind: "Image", src: "images/alert01_whiteBorder60.png", showing: false, className: "current-conditions-weatheralert-button", onclick: "onWeatherAlertButtonClick"},
        {name: "weatherAlertsDialog", kind: "ModalDialog", dismissWithClick: true, className:"current-weatheralerts-dialog",
        	onBeforeOpen: "onBeforeWeatherAlertsDialogOpen", caption:$LL("Weather Alerts"), components: [
                {kind: "RowGroup", caption:$LL("Alerts"), components: [
                    {name: "alertsDialogVirtualRepeater", kind: "VirtualRepeater", onSetupRow: "alertDialogSetupRow", components: [
                        {kind: "Item", layoutKind: "HFlexLayout", components: [ {name: "caption", flex: 1} ]}
                    ]}
                ]},
				{kind: "HFlexBox", components: [
                    {flex: 1},
	                {name: "dismissButton", kind: "Button", caption: $LL("Dismiss"), 
		            	onclick: "onWeatherAlertsDismissButtonClick"},
	            	{name: "gotowebButton", kind: "Button", caption: $LL("Go to AccuWeather.com"), 
	                	onclick: "onWeatherAlertsGoToWebButtonClick"},
	            	{flex: 1}
	        	]}
        ]},
        {name: "box", kind: "HFlexBox", components: [
            {flex:1 },
		    {kind: "VFlexBox", align: "end", className: "current-conditions-rightpane", components: [
			    {kind: "VFlexBox", width: "100%", align: "end", className: "current-conditions-header", components: [
				    {kind: "HFlexBox", width: "100%", align: "end", components: [
					    {flex:1},
					    {kind: "VFlexBox", components: [
	                        {flex: 1},
					        {name: "time", kind: "Control", className: "current-conditions-time" },
					        {name: "location", kind: "AccuWeather.Location"},
		                ]},
		                {name: "temperature", kind: "Control", allowHtml: true, className: "current-conditions-temperature" },
		                {name: "temperatureUnit", kind: "Control", className: "current-conditions-temperatureunit" },
	                ]},
				    {name: "currentWeatherText", kind: "Control", className: "current-conditions-weathertext"}
                ]},
                {kind: "HFlexBox", components: [
				    {kind: "VFlexBox", name: "dataPane1", className: "current-conditions-datapane", components: [
	                    {kind: "HFlexBox", name: "dataRow1", className: "current-conditions-datarow", components: [
		                    {kind: "Control", allowHtml: true, content: $LL("RealFeel"), className: "current-conditions-label" },
		                    {flex: 1, className: "current-conditions-spacer"},
		                    {kind: "Control", name: "realFeel", className: "current-conditions-value" }
	                    ]},
	                    {kind: "HFlexBox", name: "dataRow2", className: "current-conditions-datarow", components: [
		                    {kind: "Control", content: $LL("Humidity"), className: "current-conditions-label" },
		                    {flex: 1, className: "current-conditions-spacer"},
		                    {kind: "Control", name: "humidity", className: "current-conditions-value" }
	                    ]},
	                    {kind: "HFlexBox", name: "dataRow3", className: "current-conditions-datarow", components: [
		                    {kind: "Control", content: $LL("Visibility"), className: "current-conditions-label" },
		                    {flex: 1, className: "current-conditions-spacer"},
		                    {kind: "Control", name: "visibility", className: "current-conditions-value" }
	                    ]},
	                ]},
	                {flex: 1},
	                {kind: "VFlexBox", name: "dataPane2", className: "current-conditions-datapane", components: [
	                    {kind: "HFlexBox", name: "dataRow6", className: "current-conditions-datarow-right", components: [
		                    {kind: "Control", content: $LL("Wind Direction"), className: "current-conditions-label" },
		                    {flex: 1, className: "current-conditions-spacer"},
		                    {kind: "Control", name: "windDirection", className: "current-conditions-value" }
	                    ]},
	                    {kind: "HFlexBox", name: "dataRow4", className: "current-conditions-datarow-right", components: [
		                    {kind: "Control", content: $LL("Wind Speed"), className: "current-conditions-label" },
		                    {flex: 1, className: "current-conditions-spacer"},
		                    {kind: "Control", name: "windSpeed", className: "current-conditions-value" }
	                    ]},
	                    {kind: "HFlexBox", name: "dataRow5", className: "current-conditions-datarow-right", components: [
		                    {kind: "Control", content: $LL("Wind Gusts"), className: "current-conditions-label" },
		                    {flex: 1, className: "current-conditions-spacer"},
		                    {kind: "Control", name: "windGusts", className: "current-conditions-value" }
	                    ]},
	                ]}
			    ]},
			    {flex: 1}
			]}
	    ]}
    ],
	               
	published: {
		appModel: {}
	},
	  
	create: function() 
	{
		this.inherited(arguments);
	},
	
	appModelChanged: function(oldAppModel) {
		this.$.location.setAppModel(this.appModel);
		this.updateUi_();
		this.redraw();
	},
	
	onUnitsModelChanged: function() {
		this.log();
		this.updateUi_();
	},
	
	onWindowRotated: function(inSender) {
		this.updateUi_();
		this.redraw();
	},
	
	getLocation: function() {
		return this.$.location;
	},
	
	redraw: function() {
		var appBounds =  this.getParent().getBounds();
		if (appBounds.width > appBounds.height) {
			// landscape
			this.$.dataRow1.addClass("current-conditions-datarow-landscape");
			this.$.dataRow2.addClass("current-conditions-datarow-landscape");
			this.$.dataRow3.addClass("current-conditions-datarow-landscape");
			this.$.dataRow4.addClass("current-conditions-datarow-landscape-right");
			this.$.dataRow5.addClass("current-conditions-datarow-landscape-right");
			this.$.dataRow6.addClass("current-conditions-datarow-landscape-right");
			this.$.dataPane1.addClass("current-conditions-datapane-landscape");
			this.$.dataPane2.addClass("current-conditions-datapane-landscape");
			this.$.temperatureUnit.addClass("current-conditions-temperatureunit-landscape");
			this.$.currentWeatherText.addClass("current-conditions-weathertext-landscape");

		} else {
			// portrait
			this.$.dataRow1.removeClass("current-conditions-datarow-landscape");
			this.$.dataRow2.removeClass("current-conditions-datarow-landscape");
			this.$.dataRow3.removeClass("current-conditions-datarow-landscape");
			this.$.dataRow4.removeClass("current-conditions-datarow-landscape-right");
			this.$.dataRow5.removeClass("current-conditions-datarow-landscape-right");
			this.$.dataRow6.removeClass("current-conditions-datarow-landscape-right");
			this.$.dataPane1.removeClass("current-conditions-datapane-landscape");
			this.$.dataPane2.removeClass("current-conditions-datapane-landscape");

			this.$.temperatureUnit.removeClass("current-conditions-temperatureunit-landscape");
			this.$.currentWeatherText.removeClass("current-conditions-weathertext-landscape");
		}
	},
	
	updateUi_: function()
	{
		var weatherModel = this.appModel.getWeatherModel();
		var unitsModel = this.appModel.getUnitsModel();
		var conditions = weatherModel.getCurrent();
		var severe = weatherModel.getSevere();
		var local = weatherModel.getLocal();
		var forecast = weatherModel.getForecast();
		var iconFile = getIconUrlForCondition(conditions["weathericon"]); 
		
		this.applyStyle("background-image", "url('" + iconFile + "')");

		this.$.time.setContent($LL("at ") + " " + unitsModel.timeFromString(local[AccuWeather_WeatherModel_Keys.time]));
		this.$.temperature.setContent(unitsModel.temperatureFromString(conditions[AccuWeather_WeatherModel_Keys.temperature]) + "&deg;");
		this.$.temperatureUnit.setContent(unitsModel.temperatureUnitRaw());
		this.$.currentWeatherText.setContent(conditions[AccuWeather_WeatherModel_Keys.weathertext]);
		
		this.$.realFeel.setContent(unitsModel.temperatureFromStringWithUnit(conditions[AccuWeather_WeatherModel_Keys.realfeel]));
		this.$.humidity.setContent(conditions[AccuWeather_WeatherModel_Keys.humidity]);
		this.$.visibility.setContent(unitsModel.distanceFromString(conditions[AccuWeather_WeatherModel_Keys.visibility]));
		//this.$.pressure.setContent(unitsModel.pressureFromString(conditions[AccuWeather_WeatherModel_Keys.pressure]));
		
		this.$.windSpeed.setContent(unitsModel.speedFromString(conditions[AccuWeather_WeatherModel_Keys.windspeed]));
		this.$.windGusts.setContent(unitsModel.speedFromString(conditions[AccuWeather_WeatherModel_Keys.windgusts]));
		this.$.windDirection.setContent(conditions[AccuWeather_WeatherModel_Keys.winddirection]);
		//if (forecast.length > 0) {
		//	this.$.sunrise.show();
		//	this.$.sunset.show();
		//	this.$.sunrise.setContent(unitsModel.timeFromString(forecast[0][AccuWeather_WeatherModel_Keys.sunrise]));
		//	this.$.sunset.setContent(unitsModel.timeFromString(forecast[0][AccuWeather_WeatherModel_Keys.sunset]));
		//} else {
		//	this.$.sunrise.hide();
		//	this.$.sunset.hide();
		//}
		
		if (severe[AccuWeather_WeatherModel_Keys.warningtype] != null) {
			this.$.weatherAlertButton.show();
		} else {
			this.$.weatherAlertButton.hide();
		}
	},
	
	onWeatherAlertButtonClick: function() {
		this.$.weatherAlertsDialog.openAtCenter();
	},
	
	alertDialogSetupRow: function(inSender, inIndex) {
		var severe = this.appModel.getWeatherModel().getSevere();
		if (severe[AccuWeather_WeatherModel_Keys.warningtype] != null && 
				inIndex >= 0 && 
				inIndex < severe[AccuWeather_WeatherModel_Keys.warningtype].length) {
			this.$.caption.setContent( severe[AccuWeather_WeatherModel_Keys.warningtype][inIndex]);
			return true;
		}
	},
	
	onBeforeWeatherAlertsDialogOpen: function() {
		this.$.alertsDialogVirtualRepeater.render();
	},
	
	onWeatherAlertsDismissButtonClick: function() {
		this.$.weatherAlertsDialog.close();
	},
	
	onWeatherAlertsGoToWebButtonClick: function() {
		var severe = this.appModel.getWeatherModel().getSevere();
		var url = severe[AccuWeather_WeatherModel_Keys.url];
		this.$.launchBrowserCall.call({id: "com.palm.app.browser", params:{target: url}});
	}
});
