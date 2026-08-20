enyo.kind({
	name: "AccuWeather.Exhibition",
	kind: enyo.VFlexBox,
	className: "accuweather-body exhibition",
	published: {
		appModel: null
	},
	components: [
	             
        // UI Elements
//        {name: "weatherAnimation", kind: "AccuWeather.AnimatedWeather", className: "exhibition-weatheranimation"},

		// to enable animations remove following two elements and uncomment
		// one commented out in the top. also uncomment this.$.weatherAnimation.setAppModel(this.appModel);
		// at the end of the file
		{name: "conditionIcon", kind: "Image", className: "exhibition-condition-image"},
		{flex: 1},

        {kind: "HFlexBox", className: "exhibition-bottom", components: [
            {kind: "VFlexBox", className: "exhibition-left", components: [
                {name: "cityName", kind: "Control", className: "exhibition-cityname"},
                {name: "temperature", allowHtml: true, kind: "Control", className: "exhibition-temperature"},
                {name: "updateTime", kind: "Control", className: "exhibition-updatetime"},
                {kind: "Image", className: "exhibition-logobanner", src: "images/accuweather_logotype_bw.png"}
            ]},
            {kind: "VFlexBox", className: "exhibition-forecast", components: [
                {kind: "VFlexBox", className: "exhibition-forecast-dayrow", components: [ 
                    {flex: 1},
                    {name: "forecastDayImage1", kind: "Image", className:"exhibition-forecast-dayrow-image"},
                    {name: "forecastDayName1", kind: "Control", className: "exhibition-forecast-dayrow-name"},
                    {name: "forecastDayTemp1", allowHtml: true, kind: "Control", className: "exhibition-forecast-dayrow-temp"},
                    {flex: 1}
                ]},
                {kind: "VFlexBox", className: "exhibition-forecast-dayrow exhibition-forecast-dayrow-middle", components: [ 
                    {flex: 1},
                    {name: "forecastDayImage2", kind: "Image", className:"exhibition-forecast-dayrow-image"},
                    {name: "forecastDayName2", kind: "Control", className: "exhibition-forecast-dayrow-name"},
                    {name: "forecastDayTemp2", allowHtml: true, kind: "Control", className: "exhibition-forecast-dayrow-temp"},
                    {flex: 1}
                ]},
                {kind: "VFlexBox", className: "exhibition-forecast-dayrow", components: [ 
                    {flex: 1},
	                {name: "forecastDayImage3", kind: "Image", className:"exhibition-forecast-dayrow-image"},
	                {name: "forecastDayName3", kind: "Control", className: "exhibition-forecast-dayrow-name"},
	                {name: "forecastDayTemp3", allowHtml: true, kind: "Control", className: "exhibition-forecast-dayrow-temp"},
	                {flex: 1}
	            ]}
            ]},
        ]}
    ],
    
    create: function() {
    	this.inherited(arguments);
    	this.log();
    },
    onShow: function() { this.visible = true; this.log("showing exhibition view"); },
    onHide: function() { this.visible = false; this.log("hiding exhibition view"); },
    
    appModelChanged: function() {
 
    	this.log();
    	
    	if (this.visible) {
    		
    		var weatherModel = this.appModel.getWeatherModel();
    		var forecast = weatherModel.getForecast();
    		var units = this.appModel.getUnitsModel();
    		var local = weatherModel.getLocal();
    		var current = weatherModel.getCurrent();
    		
	    	this.log("updating display content");
	    	this.$.cityName.setContent(local["city"]);
	    	this.$.temperature.setContent(units.temperatureFromStringWithUnit(current["temperature"]));
	    	this.$.updateTime.setContent($LL("updated at ") + units.timeFromString(local["time"]));
	    	
	    	var d = new Date(forecast[0].obsdate);
			var dayString = (d.getMonth() + 1).toString() + "/" + d.getDate();
			var temperatureString = units.temperatureFromString(forecast[0].hightemperature) + " / " + 
				units.temperatureFromStringWithUnit(forecast[0].lowtemperature);
	    	this.$.forecastDayImage1.setSrc("./images/forecast/fc_" + forecast[0].weathericon + ".png");
	    	this.$.forecastDayName1.setContent(forecast[0].daycode + " " + dayString);
	    	this.$.forecastDayTemp1.setContent(temperatureString);
	    	
	    	d = new Date(forecast[1].obsdate);
			dayString = (d.getMonth() + 1).toString() + "/" + d.getDate();
			temperatureString = units.temperatureFromString(forecast[1].hightemperature) + " / " + 
				units.temperatureFromStringWithUnit(forecast[1].lowtemperature);
	    	this.$.forecastDayImage2.setSrc("./images/forecast/fc_" + forecast[1].weathericon + ".png");
	    	this.$.forecastDayName2.setContent(forecast[1].daycode + " " + dayString);
	    	this.$.forecastDayTemp2.setContent(temperatureString);
	    	
	    	d = new Date(forecast[2].obsdate);
			dayString = (d.getMonth() + 1).toString() + "/" + d.getDate();
			temperatureString = units.temperatureFromString(forecast[2].hightemperature) + " / " + 
				units.temperatureFromStringWithUnit(forecast[2].lowtemperature);
	    	this.$.forecastDayImage3.setSrc("./images/forecast/fc_" + forecast[2].weathericon + ".png");
	    	this.$.forecastDayName3.setContent(forecast[2].daycode + " " + dayString);
	    	this.$.forecastDayTemp3.setContent(temperatureString);
	    	
			this.$.conditionIcon.setSrc("images/exhibition_static/icon_" +current["weathericon"] + ".png");
			
//	    	this.$.weatherAnimation.setAppModel(this.appModel);
    	}
    },
});