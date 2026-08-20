enyo.kind({
	name: "AccuWeather.Hourly",
	className: "accuweather-body hourly",
    kind: enyo.VFlexBox,

	
	// UI ELEMENTS
	components: [
		{kind: "enyo.Scroller", flex: 1, components: [
			{name: "list", kind: "VirtualRepeater", onSetupRow: "onSetupRow", components: [
				{kind: "Item", name: "item", className: "hourly-row-item", components: [
					{layoutKind: "HFlexLayout", components: [
						{kind: "Image", name: "icon", className: "hourly-rowitem-image"},
						{layoutKind: "VFlexLayout", className: "hourly-column-1", components: [
							{flex: 1},
							{layoutKind: "HFlexLayout", components: [
								{name: "day", className: "hourly-day"},
								{name: "time", className: "hourly-time"},
							]},
							{name: "description", className: "hourly-description"},
							{flex: 1},
						]},
						{layoutKind: "VFlexLayout", className: "hourly-column-2", components: [
							{flex: 1},
							{layoutKind: "HFlexLayout", align: "baseline", className: "hourly-column-2", components: [
								{name: "temperature", className: "hourly-temperature", allowHtml:true},
								{name: "temperatureSuffix", className: "hourly-temperature-suffix"},
							]},
							{flex: 1},
						]},
						{flex: 1},
						{layoutKind: "VFlexLayout", className: "hourly-column-3", components: [
							{flex: 1},
							{kind: "HFlexBox", components: [
                                {name: "realfeelTitle", className: "hourly-title"},
                                {flex: 1},
                                {name: "realfeelData", className: "hourly-data"},
                            ]},
                            {kind: "HFlexBox", components: [
                                {name: "humidityTitle", className: "hourly-title"},
                                {flex: 1},
                                {name: "humidityData", className: "hourly-data"},
                            ]},
							{flex: 1},
						]},
					]},
				]},
			]},
		]},
		{name: "gradientImage", kind: "Image", src: "images/black_gradient.png", className:"hourly-gradientimage"}
	],
            
	// PROPERTIES { getXxxXxx() setXxxXxx(value) }
	published: {
		appModel: null // required for all views
	},
	  
	// create
	create: function() {
		this.inherited(arguments);
	},
	  
	onShow: function() {
		this.isVisible = true;
		
		if (this.appModelUpdated) {
			this.redrawUI();
			this.appModelUpdated = false;
		} 
	},
	
	onWindowRotated: function() { },
	
	onHide: function() {
		this.isVisible = false;
	},

	onLoad: function() { },
	
	redrawUI: function() {
		this.$.list.render();
	},
	
	onSetupRow: function(inSender, index) {
		// get weather model
		if (this.getAppModel() == null)
			return false;
		
		var units = this.appModel.getUnitsModel();
		var weatherModel = this.appModel.getWeatherModel();
		var hourly = weatherModel.getHourly();
		
		if (null == weatherModel || null == hourly ||
				index < 0 || index >= hourly.length)
			return false;
		
		var forecast = hourly[index];

		this.$.icon.setSrc("images/forecast/fc_" + forecast["weathericon"] + ".png");
		this.$.day.setContent(forecast["today"] ? $LL("Today") : $LL("Tomorrow"));
		this.$.time.setContent(units.timeFromString(forecast["hour"]));
		this.$.description.setContent(forecast["txtshort"]);
		this.$.temperature.setContent(units.temperatureFromString(forecast["temperature"])+ "&deg;");
		this.$.temperatureSuffix.setContent(units.temperatureUnitRaw());
		this.$.realfeelTitle.setContent($LL("RealFeel") + ":");
		this.$.realfeelData.setContent(units.temperatureFromStringWithUnit(forecast["realfeel"]));
		this.$.humidityTitle.setContent($LL("Humidity") + ":");
		this.$.humidityData.setContent(units.humidityFromString(forecast["humidity"]));

		return true;

	},

	onUnitsModelChanged: function () {
		if (this.isVisible) {
			this.redrawUI();
		} else {
			this.appModelUpdated = true;
		}
	},
	
	appModelChanged: function(oldAppModel) {
		if (this.isVisible) {
			this.redrawUI();
		} else {
			this.appModelUpdated = true;
		}
	},
});
