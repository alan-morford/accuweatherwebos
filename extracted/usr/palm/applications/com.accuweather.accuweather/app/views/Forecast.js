var ALARM_SNOW_MIN = 1;
var ALARM_ICE_MIN = 0.1;
var ALARM_RAIN_MIN = 0.5;
var ALARM_WIND_MIN = 30;
var ALARM_GUSTS_MIN = 40;
var ALARM_THUNDERSTORM_MIN = 75;

enyo.kind({
	name: "AccuWeather.Forecast",
	kind: enyo.HFlexBox,
	className: "accuweather-body forecast",
	// UI ELEMENTS
	components: [
		{kind: "ApplicationEvents", onWindowRotated: "onWindowRotated"},
		{name: "dayList", kind: "HFlexBox", className: "forecast-daylist", components: [
            {name: "gradientImage", kind: "Image", src: "images/black_gradient.png", className:"forecast-gradientimage"},
            {name: "daylistScroller", kind: "enyo.Scroller", flex: 1, className: "forecast-daylist-scroller", autoHorizontal: false, horizontal: false, components: [
				{kind: "VirtualRepeater", className: "forecast-daylist-list", onSetupRow: "onSetupRow", onclick: "onItemClick",
					components: [
			        {kind: "Item", layoutKind: "HFlexLayout", align: "end", className: "forecast-rowitem", components: [ 
		                {name: "alertPane", kind: "Control", layoutKind: "HFlexLayout", className: "forecast-alert-pane", components: [
	                        {flex: 1},
	                        {kind: "VFlexBox", align: "center", className: "forecast-alert-imagepane", components: [ 
	                             {name: "rainAlertImage", kind: "Image", className: "forecast-alert-imagepane-image"}, 
	                             {name: "rainAlertText", kind: "Control", className: "forecast-alert-text"}, {flex: 1}]},
	                        {flex: 1},
	                        {kind: "VFlexBox", align: "center", className: "forecast-alert-imagepane", components: [ 
	                             {name: "snowAlertImage", kind: "Image", className: "forecast-alert-imagepane-image"}, 
	                             {name: "snowAlertText", kind: "Control", className: "forecast-alert-text"}, {flex: 1}]},
	                        {flex: 1},
	                        {kind: "VFlexBox", align: "center", className: "forecast-alert-imagepane", components: [ 
	                             {name: "iceAlertImage", kind: "Image", className: "forecast-alert-imagepane-image"}, 
	                             {name: "iceAlertText", kind: "Control", className: "forecast-alert-text"}, {flex: 1}]},
	                        {flex: 1},
	                        {kind: "VFlexBox", align: "center", className: "forecast-alert-imagepane", components: [ 
	                             {name: "windAlertImage", kind: "Image", className: "forecast-alert-imagepane-image"}, 
	                             {name: "windAlertText", kind: "Control", className: "forecast-alert-text-small"},
	                             {name: "windAlertTextGust", content:"sd", kind: "Control", className: "forecast-alert-text-small"}, {flex: 1}]},
	                        {flex: 1},
	                        {kind: "VFlexBox", align: "center", className: "forecast-alert-imagepane", components: [ 
	                             {name: "tstormAlertImage", kind: "Image", className: "forecast-alert-imagepane-image"}, 
	                             {name: "tstormAlertText", kind: "Control", className: "forecast-alert-text"}, {flex: 1}]},
	                        {flex: 1},
	                    ]},
		                {name: "alertImage", kind: "Image", className: "forecast-alert-image", onclick: "onAlertImageClick"},
		                {name: "weatherImage", kind: "Image", className: "forecast-rowitem-image"},
		                {kind: "VFlexBox", className: "forecast-day-column", components: [
			                {flex: 1},
	    	                {kind: "HFlexBox", align: "baseline", components: [
	    	                    {name: "dayofweek", kind: "Control", className: "forecast-rowitem-dayofweektext"},
	    	                    {name: "day", kind: "Control", className: "forecast-rowitem-daytext value-deaccented-bold"},
			                ]},
	    	                {flex: 1},
	    	                {kind: "HFlexBox", className:"forecast-hilorow", align: "baseline", components: [
	    	                    {name: "hilovalueHigh", kind: "Control", allowHtml: true, className: "forecast-rowitem-hilovalue"},
	    	                    {name: "hilovalueHighSuffix", kind: "Control", className: "forecast-rowitem-hilovalue value-suffix"},
	    	                    {name: "hilovalueLow", kind: "Control", allowHtml: true, className: "forecast-rowitem-hilovalue value-deaccented"},
	    	                    {name: "hilovalueLowSuffix", kind: "Control", className: "forecast-rowitem-hilovalue value-deaccented value-suffix"},
			                ]},
		                ]},
		                {kind: "VFlexBox", className:"forecast-temperature-column", components: [
		                    {flex: 20},
    	                    {name: "realfeeltitle", allowHtml: true, className: "forecast-rowitem-realfeeltitle"},    
    	                    {flex: 0.5},
    	                    {kind: "HFlexBox", align: "baseline", components: [
                                {name: "realfeelvalueHigh", className: "forecast-rowitem-realfeelvalue"},
                                {name: "realfeelvalueLow", className: "forecast-rowitem-realfeelvalue value-deaccented"},
                            ]},
		                ]},
		                {flex: 1},
		                {name: "rightBorder", kind: "Control", className: "forecast-rowitem-rightborder"},
		                {name: "selectorImage", kind: "Image", className: "forecast-rowitem-selectorimage", src: "images/orange_triangle.png"}
			        ]}
			    ]}
			]}
        ]},
		{name: "dayNightPane", kind: "VFlexBox", flex: 1, className: "forecast-daynightpane", components: [
            {name: "dayPane", kind: "VFlexBox", className: "forecast-daynight-individualpane", components: [
                {kind: "HFlexBox", components: [
                    {kind: "VFlexBox", components: [
                        {kind: "HFlexBox", align: "baseline", components: [
                            {name: "dayTitle", kind: "Control", className: "forecast-daynight-title", content: $LL("Day")},
                            {name: "daySubTitleHorizontal", className: "forecast-daynight-subtitle-horizontal", kind: "Control"},
                        ]},
	                    {flex: 1},
                        {name: "daySubTitle", className: "forecast-daynight-subtitle", kind: "Control"},
                    ]},
                    {name: "dayImage", className: "forecast-daynightpane-image", kind: "Image"},
                ]},
                {flex: 1},
                {name: "dayDataGrid", kind: "HFlexBox", className: "forecast-daynightpane-datagrid", components: [
	                {kind: "VFlexBox", className: "forecast-daynightpane-datagrid-pane", components: [
	                    {kind: "Control", className: "forecast-daynightpane-datagrid-header", content: $LL("Precipitation").toUpperCase()},                                                                              
		                {kind: "HFlexBox", name: "dayDataRow1", className: "forecast-daynight-darkenedrow forecast-daynight-datarow", components: [
	                        {name: "dayRainTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "dayRainValue", className: "forecast-daynightdata-value", kind: "Control"},
		                ]},
		                {kind: "HFlexBox", name: "dayDataRow2", className: "forecast-daynight-datarow", components: [
	                        {name: "dayIceTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "dayIceValue", className: "forecast-daynightdata-value", kind: "Control"},
		                ]},
		                {kind: "HFlexBox", name: "dayDataRow3", className: "forecast-daynight-darkenedrow forecast-daynight-datarow", components: [
	                        {name: "daySnowTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "daySnowValue", className: "forecast-daynightdata-value", kind: "Control"},
		                ]},
	                ]},
	                {flex: 0.7},
	                {kind: "VFlexBox", className: "forecast-daynightpane-datagrid-pane", components: [
                    	{kind: "Control", className: "forecast-daynightpane-datagrid-header", content: $LL("Wind").toUpperCase()},                                                                              
		                {kind: "HFlexBox", name: "dayDataRow4", className: "forecast-daynight-datarow", components: [
	                        {name: "dayWindDirectionTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "dayWindDirectionValue", className: "forecast-daynightdata-value", kind: "Control"},
	                    ]},
	                    {kind: "HFlexBox", name: "dayDataRow6", className: "forecast-daynight-darkenedrow forecast-daynight-datarow", components: [
	                        {name: "dayWindSpeedTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "dayWindSpeedValue", className: "forecast-daynightdata-value", kind: "Control"},
	                    ]},
	                    {kind: "HFlexBox", name: "dayDataRow5", className: "forecast-daynight-datarow", components: [
	                        {name: "dayWindGustsTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "dayWindGustsValue", className: "forecast-daynightdata-value", kind: "Control"},
	                    ]},
	                ]},
                ]},
                {flex: 1}
            ]},
            {name: "nightPane", kind: "VFlexBox", className: "forecast-daynight-individualpane", components: [
                {kind: "HFlexBox", components: [
                    {kind: "VFlexBox", components: [
                        {kind: "HFlexBox", align: "baseline", components: [
                            {name: "nightTitle", kind: "Control", className: "forecast-daynight-title", content: $LL("Night")},
                            {name: "nightSubTitleHorizontal", className: "forecast-daynight-subtitle-horizontal", kind: "Control"},
                        ]},
	                    {flex: 1},
                        {name: "nightSubTitle", className: "forecast-daynight-subtitle", kind: "Control"},
                    ]},
                    {name: "nightImage", className: "forecast-daynightpane-image", kind: "Image"},
                ]},
                {flex: 1},
                {name: "nightDataGrid", kind: "HFlexBox", className: "forecast-daynightpane-datagrid", components: [
  	                {kind: "VFlexBox", className: "forecast-daynightpane-datagrid-pane", components: [
  	                    {kind: "Control", className: "forecast-daynightpane-datagrid-header", content: $LL("Precipitation").toUpperCase()},                                                                              
  		                {kind: "HFlexBox", name: "nightDataRow1", className: "forecast-daynight-darkenedrow forecast-daynight-datarow", components: [
	                        {name: "nightRainTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "nightRainValue", className: "forecast-daynightdata-value", kind: "Control"},
  		                ]},
  		                {kind: "HFlexBox", name: "nightDataRow2", className: "forecast-daynight-datarow", components: [
	                        {name: "nightIceTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "nightIceValue", className: "forecast-daynightdata-value", kind: "Control"},
  		                ]},
  		                {kind: "HFlexBox", name: "nightDataRow3", className: "forecast-daynight-darkenedrow forecast-daynight-datarow", components: [
	                        {name: "nightSnowTitle", className: "forecast-daynightdata-title", kind: "Control"},
	                        {flex: 1},
	                        {name: "nightSnowValue", className: "forecast-daynightdata-value", kind: "Control"},
  		                ]},
  	                ]},
  	                {flex: 1},
  	                {kind: "VFlexBox", className: "forecast-daynightpane-datagrid-pane", components: [
                      	{kind: "Control", className: "forecast-daynightpane-datagrid-header", content: $LL("Wind").toUpperCase()},                                                                              
  		                {kind: "HFlexBox", name: "nightDataRow4", className: "forecast-daynight-datarow", components: [
  	                        {name: "nightWindDirectionTitle", className: "forecast-daynightdata-title", kind: "Control"},
  	                        {flex: 1},
  	                        {name: "nightWindDirectionValue", className: "forecast-daynightdata-value", kind: "Control"},
  	                    ]},
  	                    {kind: "HFlexBox", name: "nightDataRow6", className: "forecast-daynight-darkenedrow forecast-daynight-datarow", components: [
  	                        {name: "nightWindSpeedTitle", className: "forecast-daynightdata-title", kind: "Control"},
  	                        {flex: 1},
  	                        {name: "nightWindSpeedValue", className: "forecast-daynightdata-value", kind: "Control"},
  	                    ]},
  	                    {kind: "HFlexBox", name: "nightDataRow5", className: "forecast-daynight-datarow", components: [
  	                        {name: "nightWindGustsTitle", className: "forecast-daynightdata-title", kind: "Control"},
  	                        {flex: 1},
  	                        {name: "nightWindGustsValue", className: "forecast-daynightdata-value", kind: "Control"},
  	                    ]},
  	                ]}
                ]},
                {flex: 1},
            ]}
        ]}
	],
	published: {
		appModel: null // required for all views
	},
	  
	create: function()  {
		this.inherited(arguments);
		this.selectedRow = 0;
	},
	onWindowRotated: function() {
		if (this.visible == true) {
			this.$.virtualRepeater.render();
			this.setDayNightData(this.selectedRow);
		}
		this.redraw();
	},
	onShow: function() { 
		this.visible = true;
		if (this.didAppModelChange == true) {
			this.$.virtualRepeater.render();
			this.setDayNightData(this.selectedRow);
			this.didAppModelChange = false;
		}
		
		this.redraw();
		
	},
	onHide: function() { 
		this.visible = false;
	},
	
	appModelChanged: function(oldAppModel) {
		
		this.selectedRow = 0;
		this.$.daylistScroller.scrollIntoView(0, 0);
		if (this.visible == true) {
			this.$.virtualRepeater.render();
			this.setDayNightData(this.selectedRow);
		} else {
			this.log();
			this.didAppModelChange = true;
		}
	},
	
	onUnitsModelChanged: function() {
		if (this.visible == true) {
			this.$.virtualRepeater.render();
			this.setDayNightData(this.selectedRow);
		} else {
			this.log();
			this.didAppModelChange = true;
		}
	},
	
	redraw: function() {

		
		var appBounds =  this.getParent().getParent().getBounds();
		if (appBounds.width > appBounds.height) {
			// landscape
			this.$.daySubTitleHorizontal.show();
			this.$.daySubTitle.hide();
			this.$.nightSubTitleHorizontal.show();
			this.$.nightSubTitle.hide();
			this.$.dayPane.addClass("forecast-daynight-individualpane-landscape");
			this.$.nightPane.addClass("forecast-daynight-individualpane-landscape");
			this.$.dayDataRow1.addClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow2.addClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow3.addClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow4.addClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow5.addClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow6.addClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow1.addClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow2.addClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow3.addClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow4.addClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow5.addClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow6.addClass("forecast-daynight-datarow-landscape");
			this.$.dayList.addClass("forecast-daylist-landscape");
			this.$.dayDataGrid.addClass("forecast-daynightpane-datagrid-landscape");
			this.$.nightDataGrid.addClass("forecast-daynightpane-datagrid-landscape");
			this.$.dayImage.addClass("forecast-daynightpane-image-landscape");
			this.$.nightImage.addClass("forecast-daynightpane-image-landscape");
			
		} else {
			// portrait
			this.$.daySubTitleHorizontal.hide();
			this.$.daySubTitle.show();
			this.$.nightSubTitleHorizontal.hide();
			this.$.nightSubTitle.show();
			this.$.dayPane.removeClass("forecast-daynight-individualpane-landscape");
			this.$.nightPane.removeClass("forecast-daynight-individualpane-landscape");
			this.$.dayDataRow1.removeClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow2.removeClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow3.removeClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow4.removeClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow5.removeClass("forecast-daynight-datarow-landscape");
			this.$.dayDataRow6.removeClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow1.removeClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow2.removeClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow3.removeClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow4.removeClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow5.removeClass("forecast-daynight-datarow-landscape");
			this.$.nightDataRow6.removeClass("forecast-daynight-datarow-landscape");
			this.$.dayList.removeClass("forecast-daylist-landscape");
			this.$.dayDataGrid.removeClass("forecast-daynightpane-datagrid-landscape");
			this.$.nightDataGrid.removeClass("forecast-daynightpane-datagrid-landscape");
			this.$.dayImage.removeClass("forecast-daynightpane-image-landscape");
			this.$.nightImage.removeClass("forecast-daynightpane-image-landscape");
			
		}	
		
	},
	
	onSetupRow: function(inSender, inIndex)
	{
		if (null == this.appModel) {
			return false;
		}
		
		var weatherModel = this.appModel.getWeatherModel();
		var forecast = weatherModel.getForecast();
		var units = this.appModel.getUnitsModel();
		
		if (inIndex < 0 || inIndex >= forecast.length) {
			return false;
		}
		
		// Row item weather data
		// ----------------------
		var dayImgSrc = "./images/forecast/fc_" + forecast[inIndex].weathericon + ".png";
		var nightImgSrc = "./images/forecast/fc_" + forecast[inIndex].nightweathericon + ".png"
		var units = this.appModel.getUnitsModel();
	
		this.$.weatherImage.setSrc(dayImgSrc);
		this.$.dayofweek.setContent(forecast[inIndex].daycode);
		this.$.day.setContent(units.dateFromString(forecast[inIndex].obsdate));
		
		this.$.hilovalueHigh.setContent( units.temperatureFromString(forecast[inIndex].hightemperature) + "&deg;");
		this.$.hilovalueHighSuffix.setContent( units.temperatureUnitRaw());
		this.$.hilovalueLow.setContent( "/" + units.temperatureFromString(forecast[inIndex].lowtemperature) + "&deg;");
		this.$.hilovalueLowSuffix.setContent( units.temperatureUnitRaw());
		
		this.$.realfeeltitle.setContent($LL("RealFeel") + ":");
		this.$.realfeelvalueHigh.setContent( units.temperatureFromStringWithUnit(forecast[inIndex].realfeelhigh));
		this.$.realfeelvalueLow.setContent("/" + units.temperatureFromStringWithUnit(forecast[inIndex].realfeellow));
		
		// alert info
		// -----------------
		var anyAlert = false;
		var snowAmount = parseFloat(forecast[inIndex].snowamount) + parseFloat(forecast[inIndex].nightsnowamount);
		if (snowAmount >= ALARM_SNOW_MIN) {
			this.$.snowAlertImage.setSrc("images/fc_alarm_snow_alert_on@2x.png");
			this.$.snowAlertText.setContent(units.precipFromString(snowAmount));	
			anyAlert = true;
		} else {
			this.$.snowAlertImage.setSrc("images/fc_alarm_snow_alert_off@2x.png");
			this.$.snowAlertText.setContent("");
		}
		
		var iceAmount = parseFloat(forecast[inIndex].iceamount) + parseFloat(forecast[inIndex].nighticeamount);
		if (iceAmount >= ALARM_ICE_MIN) {
			this.$.iceAlertImage.setSrc("images/fc_alarm_ice_alert_on@2x.png");
			this.$.iceAlertText.setContent(units.precipFromString(iceAmount));		
			anyAlert = true;
		} else {
			this.$.iceAlertImage.setSrc("images/fc_alarm_ice_alert_off@2x.png");
			this.$.iceAlertText.setContent("");
		}
		
		var rainAmount = parseFloat(forecast[inIndex].rainamount) + parseFloat(forecast[inIndex].nightrainamount);
		if (rainAmount >= ALARM_RAIN_MIN) {
			this.$.rainAlertImage.setSrc("images/fc_alarm_rain_alert_on@2x.png");
			this.$.rainAlertText.setContent(units.precipFromString(rainAmount));		
			anyAlert = true;
		} else {
			this.$.rainAlertImage.setSrc("images/fc_alarm_rain_alert_off@2x.png");
			this.$.rainAlertText.setContent("");
		}
		
		var windAmount = Math.max(parseFloat(forecast[inIndex].windspeed), parseFloat(forecast[inIndex].nightwindspeed));
		var gustAmount = Math.max(parseFloat(forecast[inIndex].windgust), parseFloat(forecast[inIndex].nightwindgust));
		if (windAmount >= ALARM_WIND_MIN || gustAmount >= ALARM_GUSTS_MIN) {
			this.$.windAlertImage.setSrc("images/fc_alarm_wind_alert_on@2x.png");
			this.$.windAlertText.setContent(units.speedFromString(windAmount));		
			this.$.windAlertTextGust.setContent(units.speedFromString(gustAmount) + " " + $LL("gust"));
			anyAlert = true;
		} else {
			this.$.windAlertImage.setSrc("images/fc_alarm_wind_alert_off@2x.png");
			this.$.windAlertText.setContent("");
			this.$.windAlertTextGust.setContent("");
		}
		
		var tstormprob = Math.max(parseInt(forecast[inIndex].tstormprob), parseInt(forecast[inIndex].nighttstormprob));
		if (tstormprob >= ALARM_THUNDERSTORM_MIN) {
			this.$.tstormAlertImage.setSrc("images/fc_alarm_tstorms_alert_on@2x.png");
			this.$.tstormAlertText.setContent("75% +");		
			anyAlert = true;
		} else {
			this.$.tstormAlertImage.setSrc("images/fc_alarm_tstorms_alert_off@2x.png");
			this.$.tstormAlertText.setContent("");
		}
		
		if (anyAlert && inIndex < 3) {
			this.$.alertImage.show();
		} else {
			this.$.alertImage.hide();
		}
		
		// alert pane initial alignment
		this.$.alertPane.applyStyle("left", "-1000px");

		// triangle image for selected item
		if (this.selectedRow == inIndex) {
			this.$.selectorImage.show();
		} else {
			this.$.selectorImage.hide();
		}
		
		if (this.selectedRow == inIndex) {
			this.$.alertImage.setSrc("images/fc_alarm_button.png");		
			this.$.rightBorder.applyStyle("background-image", "url('images/Row_orange_line.png')");	
			this.$.item.applyStyle("border-color", "orange");
			this.$.item.applyStyle("border-style", "solid");
			this.$.item.applyStyle("border-width", "3px");
//			this.$.item.addClass("forecast-rowitem-selected");
		} else {
			this.$.alertImage.setSrc("images/fc_alarm_button.png");
			this.$.rightBorder.applyStyle("background-image", "url('images/Row_black_line.png')");
			this.$.item.applyStyle("border-color", "#555");
			this.$.item.applyStyle("border-width", "1px");
			this.$.item.applyStyle("border-style", "solid");
//			this.$.item.applyStyle("border-style", "hidden");
//			this.$.item.removeClass("forecast-rowitem-selected");
		}

		return true;
	},
	
	onItemClick: function(inSender, inEvent) {
		var oldSelectedRow = this.selectedRow;
		this.selectedRow = inEvent.rowIndex;

		this.$.virtualRepeater.renderRow(oldSelectedRow);
		this.$.virtualRepeater.renderRow(this.selectedRow);
//		this.$.virtualRepeater.render();
		this.setDayNightData(this.selectedRow);
	},
	
	setDayNightData: function(index) {
		var weatherModel = this.appModel.getWeatherModel();
		var forecast = weatherModel.getForecast();
		var units = this.appModel.getUnitsModel();
		
		var dayImgSrc = "images/forecast/fc_" + forecast[index].weathericon + ".png";
		var nightImgSrc = "images/forecast/fc_" + forecast[index].nightweathericon + ".png"
		this.$.dayImage.setSrc(dayImgSrc);
		this.$.nightImage.setSrc(nightImgSrc);
		
		this.$.daySubTitle.setContent(forecast[index].txtshort);
		this.$.daySubTitleHorizontal.setContent(forecast[index].txtshort);
		this.$.nightSubTitle.setContent(forecast[index].nighttxtshort);
		this.$.nightSubTitleHorizontal.setContent(forecast[index].nighttxtshort);
		
		this.$.dayWindDirectionTitle.setContent($LL("Direction"));
		this.$.dayWindDirectionValue.setContent(forecast[index].winddirection);
		this.$.dayRainTitle.setContent($LL("Rain"));
		this.$.dayRainValue.setContent(units.precipFromString(forecast[index].rainamount));
		this.$.dayWindGustsTitle.setContent($LL("Gust"));
		this.$.dayWindGustsValue.setContent(units.speedFromString(forecast[index].windgust));
		this.$.dayIceTitle.setContent($LL("Ice"));
		this.$.dayIceValue.setContent(units.precipFromString(forecast[index].iceamount));
		this.$.dayWindSpeedTitle.setContent($LL("Speed"));
		this.$.dayWindSpeedValue.setContent(units.speedFromString(forecast[index].windspeed));
		this.$.daySnowTitle.setContent($LL("Snow"));
		this.$.daySnowValue.setContent(units.precipFromString(forecast[index].snowamount));
		this.$.nightWindDirectionTitle.setContent($LL("Direction"));
		this.$.nightWindDirectionValue.setContent(forecast[index].nightwinddirection);
		this.$.nightRainTitle.setContent($LL("Rain"));
		this.$.nightRainValue.setContent(units.precipFromString(forecast[index].nightrainamount));
		this.$.nightWindGustsTitle.setContent($LL("Gust"));
		this.$.nightWindGustsValue.setContent(units.speedFromString(forecast[index].nightwindgust));
		this.$.nightIceTitle.setContent($LL("Ice"));
		this.$.nightIceValue.setContent(units.precipFromString(forecast[index].nighticeamount));
		this.$.nightWindSpeedTitle.setContent($LL("Speed"));
		this.$.nightWindSpeedValue.setContent(units.speedFromString(forecast[index].nightwindspeed));
		this.$.nightSnowTitle.setContent($LL("Snow"));
		this.$.nightSnowValue.setContent(units.precipFromString(forecast[index].nightsnowamount));
	},
	
	onAlertImageClick: function(inSender, inEvent) {
		inEvent.stopPropagation();
		
		// toggle alert pane
		var pane = this.$.alertPane;
		if (null != pane && pane.hasNode()) {
			var a = pane.node.animation;
			if (a) {
				a.stop();
			}
			var s = pane.node.open ? 0 : -pane.getBounds().width;
			var e = pane.node.open ? -pane.getBounds().width : 0;
			
			var ds = pane.domStyles;
			ds.left = e + "px";
			ds.display = pane.node.open ? null : "none";

			a = this.createComponent({kind: "Animator", onAnimate: "stepAnimation", onStop: "stopAnimation", node: pane.node, style: pane.node.style, open: pane.open, s: s, e: e});
			a.duration = 1000;
			a.play(s, e);
			pane.node.animation = a;
		} else {
			this.error("pane has no node?");
		}
	},
	
	stepAnimation: function(inSender, inValue) {
		inSender.style.left = Math.round(inValue) + "px";
	},
	
	stopAnimation: function(inSender, inValue) {
		if (undefined == inSender.node.open || false == inSender.node.open) {
			inSender.node.open = true;
		} else {
			inSender.style.left = "-1000px";
			inSender.node.open = false;
		}
		
		inSender.node.animation = null;
		inSender.destroy();
	}
	
});