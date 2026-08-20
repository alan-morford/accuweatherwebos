AccuWeather_WeatherModel_Keys = {
local : "local",
watchwarnareas : "watchwarnareas",
currentconditions : "currentconditions",
video : "video",
forecast : "forecast",
indices : "indices",

city : "city",
state : "state",
country : "country",
countrycode : "code",
lat : "lat",
lon : "lon",
lon  : "lon",
time  : "time",

url : "url",
warningtype : "warningtype",


temperature : "temperature",
realfeel : "realfeel",
humidity : "humidity",
pressure : "pressure" ,
weathertext : "weathertext",
weathericon : "weathericon",
windgusts : "windgusts",
windspeed  : "windspeed" ,
winddirection : "winddirection",
visibility : "visibility" ,
observationtime : "observationtime",
precip : "precip",
dewpoint : "dewpoint",

clipCode: "clipCode",

obsdate: "obsdate",
daycode : "daycode",
sunrise : "sunrise",
sunset : "sunset",

daytime : "daytime",
txtshort :"txtshort",
weathericon :"weathericon",
hightemperature :"hightemperature",
lowtemperature :"lowtemperature",
realfeelhigh :"realfeelhigh",
realfeellow : "realfeellow",
windspeed :"windspeed",
winddirection :"winddirection",
windgust :"windgust",
rainamount :"rainamount",
snowamount :"snowamount",
iceamount :"iceamount",
precipamount :"precipamount",
tstormprob :"tstormprob",

nighttime :"nighttime",
	
nighttxtshort :"nighttxtshort",
nightweathericon :"nightweathericon",
nighthightemperature :"nighthightemperature",
nightlowtemperature :"nightlowtemperature",
nightrealfeelhigh :"nightrealfeelhigh",		
nightrealfeellow :"nightrealfeellow",
nightwindspeed :"nightwindspeed",
nightwinddirection :"nightwinddirection",
nightwindgust :"nightwindgust",
nightrainamount :"nightrainamount",
nightsnowamount :"nightsnowamount",
nighticeamount :"nighticeamount",
nightprecipamount :"nightprecipamount",
nighttstormprob :"nighttstormprob",


hourly :"hourly",
hour :"hour",

txtshort :"txtshort",
weathericon :"weathericon",
temperature :"temperature",
realfeel :"realfeel",
windspeed :"windspeed",
winddirection :"winddirection",
windgust :"windgust",
precipamount :"precipamount",
precip :"precip",
rainamount :"rainamount",
rain :"rain",
snowamount :"snowamount",
snow :"snow",
iceamount :"iceamount",
ice :"ice",
humidity :"humidity",
obsdate :"obsdate",
dewpoint :"dewpoint",

today :"today",
AM :"AM",
_12 :"_12",
PM :"PM",

indice :"indice",
name :"name",
value :"value",

};

enyo.kind({
	name: "AccuWeather.WeatherModel",
	kind: enyo.Component,
  
	published: {
		isDownloading: [],
		local: [],
		severe: [],
		current: [],
		video: [],
		forecast: [],
		hourly: [],
		radar: [],
		indices: []
	},

	events : {
		onWeatherDownloadComplete: "",
		onWeatherDownloadFailed: ""
	},

	attempts: 0,
	url : 0,

	// ------------------
	//   methods
	// ------------------
	
	// initialize
	create: function()
	{
		this.inherited(arguments);
		this.log("weather model create.");
		this.isDownloading = false;
		this.request_ = null;
		this.resetData_();
	},
	
	// starts a background job to download weather data
	download: function( locationId, metric )
	{
		this.log("download - locationId: " + locationId + " metric: " + metric);
		if (this.getIsDownloading()) {
			// do nothing as we're already downloading something
			this.warn("download called while there's already a pending networking activity");
			return;
		}
		// query current location
		var local = enyo.g11n.currentLocale();
		this.url = "http://weather.webosarchive.org/widget/blstreamhptablet/weather-data.asp?location=" + locationId + "&metric=0&lang=" + local.language;
		this.attempts = 0;

		// start async http request
		this.log("starting download job for location " + locationId);
		this.log("WeatherModel: url is " + this.url);
		this.isDownloading = true;
		this.resetData_();

		this.request_ = new XMLHttpRequest();
		this.request_.onreadystatechange = this.xmlRequestCallback_.bind(this);
		this.request_.open("GET", this.url, true);
		this.request_.send();
	},

	// handles the xml request response
	xmlRequestCallback_: function() { 
		if (this.request_.readyState == 4) {
			if (this.request_.status == 200) {
				this.log("received server response: " + this.request_.responseXML);
				if (this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.local).length != 0) {
					this.parseLocal_(this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.local)[0]);
				}
				if (this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.watchwarnareas).length != 0) {
					this.parseSevere_(this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.watchwarnareas)[0]);
				}
				if (this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.currentconditions).length != 0) {
					this.parseCurrent_(this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.currentconditions)[0]);
				}
				if (this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.video).length != 0) {
					this.parseVideo_(this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.video)[0]);
				}
				if (this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.forecast).length != 0) {
					this.parseForecast_(this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.forecast)[0]);
				}
				
				if (this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.indices).length != 0) {
					this.parseIndices_(this.request_.responseXML.getElementsByTagName(AccuWeather_WeatherModel_Keys.indices)[0]);
				}
				this.isDownloading = false;
				this.log("weather model loaded for city: " + this.local["city"]);
				this.doWeatherDownloadComplete();
				
			} else if (this.request_.status == 0) {
				
				// internet connection failed
				if (++this.attempts == 4) {
					this.isDownloading = false;
					this.error("failed to get weather model data");
					this.doWeatherDownloadFailed();
				} else {
					this.request_ = new XMLHttpRequest();
					this.request_.onreadystatechange = this.xmlRequestCallback_.bind(this);
					this.request_.open("GET", this.url, true);
					this.request_.send();
				}
			}
		} else
			this.isDownloading = false;
	},

	parseLocal_: function(localElement) {
		this.log("Parse local");
	
		this.copyChildValue_(this.local, localElement, AccuWeather_WeatherModel_Keys.city, AccuWeather_WeatherModel_Keys.city);
		// The real feed's tag is <adminArea>, not <state> -- copyChildValue_
		// silently no-ops when the tag it's told to look for isn't found, so
		// this was quietly leaving local["state"] empty always. Only
		// mattered once News.js needed real state data for its search
		// fallback cascade (NewsModel.js) -- nothing else in this app reads
		// local["state"].
		this.copyChildValue_(this.local, localElement, AccuWeather_WeatherModel_Keys.state, "adminArea");
		this.copyChildValue_(this.local, localElement, AccuWeather_WeatherModel_Keys.country, AccuWeather_WeatherModel_Keys.country);
		this.copyChildValue_(this.local, localElement, AccuWeather_WeatherModel_Keys.lat, AccuWeather_WeatherModel_Keys.lat);
		this.copyChildValue_(this.local, localElement, AccuWeather_WeatherModel_Keys.lon, AccuWeather_WeatherModel_Keys.lon);
		this.copyChildValue_(this.local, localElement, AccuWeather_WeatherModel_Keys.time, AccuWeather_WeatherModel_Keys.time);
		
		var countryElements = localElement.getElementsByTagName(AccuWeather_WeatherModel_Keys.country);
		this.local[AccuWeather_WeatherModel_Keys.countrycode] = countryElements[0].getAttribute(AccuWeather_WeatherModel_Keys.countrycode);
	},

	parseSevere_: function(severeElement) {
		this.log("Parse severe");

		this.copyChildValue_(this.severe, severeElement, AccuWeather_WeatherModel_Keys.url, AccuWeather_WeatherModel_Keys.url);
		this.copyChildArrayValue_(this.severe, severeElement, AccuWeather_WeatherModel_Keys.warningtype, AccuWeather_WeatherModel_Keys.warningtype);
	},

	parseCurrent_: function(currentElement) {
		this.log("Parse current");
	
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.url, AccuWeather_WeatherModel_Keys.url);
	    this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.temperature, AccuWeather_WeatherModel_Keys.temperature);
	    this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.realfeel, AccuWeather_WeatherModel_Keys.realfeel);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.humidity, AccuWeather_WeatherModel_Keys.humidity);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.pressure, AccuWeather_WeatherModel_Keys.pressure);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.weathertext, AccuWeather_WeatherModel_Keys.weathertext);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.weathericon, AccuWeather_WeatherModel_Keys.weathericon);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.windgusts, AccuWeather_WeatherModel_Keys.windgusts);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.windspeed, AccuWeather_WeatherModel_Keys.windspeed);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.winddirection, AccuWeather_WeatherModel_Keys.winddirection);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.visibility, AccuWeather_WeatherModel_Keys.visibility);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.observationtime, AccuWeather_WeatherModel_Keys.observationtime);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.precip, AccuWeather_WeatherModel_Keys.precip);
		this.copyChildValue_(this.current, currentElement, AccuWeather_WeatherModel_Keys.dewpoint, AccuWeather_WeatherModel_Keys.dewpoint);
	},

	parseVideo_: function(videoElement) {
		this.log("Parse video");
	
		this.copyChildValue_(this.video, videoElement, AccuWeather_WeatherModel_Keys.clipCode, AccuWeather_WeatherModel_Keys.clipCode);
	
		this.log(this.video.length);
		this.log(this.video["clipCode"]);
	},

	parseForecast_: function(forecastElement) {
		this.log("Parse forecast");
	
		// loop through all "day" elements
		var dayElements = forecastElement.getElementsByTagName("day");
		var i;
	
		for (i = 0; i < dayElements.length; i++) {
			var dayElement = dayElements.item(i);
			var dayData = {};
	
			this.copyChildValue_(dayData, dayElement, AccuWeather_WeatherModel_Keys.url, AccuWeather_WeatherModel_Keys.url);
			this.copyChildValue_(dayData, dayElement, AccuWeather_WeatherModel_Keys.obsdate, AccuWeather_WeatherModel_Keys.obsdate);
			this.copyChildValue_(dayData, dayElement, AccuWeather_WeatherModel_Keys.daycode, AccuWeather_WeatherModel_Keys.daycode);
			this.copyChildValue_(dayData, dayElement, AccuWeather_WeatherModel_Keys.sunrise, AccuWeather_WeatherModel_Keys.sunrise);
			this.copyChildValue_(dayData, dayElement, AccuWeather_WeatherModel_Keys.sunset, AccuWeather_WeatherModel_Keys.sunset);
	
			if (dayElement.getElementsByTagName(AccuWeather_WeatherModel_Keys.daytime).length > 0) {
				var dayTimeElement = dayElement.getElementsByTagName(AccuWeather_WeatherModel_Keys.daytime)[0];
	
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.txtshort, AccuWeather_WeatherModel_Keys.txtshort);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.weathericon, AccuWeather_WeatherModel_Keys.weathericon);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.hightemperature, AccuWeather_WeatherModel_Keys.hightemperature);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.lowtemperature, AccuWeather_WeatherModel_Keys.lowtemperature);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.realfeelhigh, AccuWeather_WeatherModel_Keys.realfeelhigh);		
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.realfeellow, AccuWeather_WeatherModel_Keys.realfeellow);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.windspeed, AccuWeather_WeatherModel_Keys.windspeed);		
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.winddirection, AccuWeather_WeatherModel_Keys.winddirection);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.windgust, AccuWeather_WeatherModel_Keys.windgust);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.rainamount, AccuWeather_WeatherModel_Keys.rainamount);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.snowamount, AccuWeather_WeatherModel_Keys.snowamount);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.iceamount, AccuWeather_WeatherModel_Keys.iceamount);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.precipamount, AccuWeather_WeatherModel_Keys.precipamount);
				this.copyChildValue_(dayData, dayTimeElement, AccuWeather_WeatherModel_Keys.tstormprob, AccuWeather_WeatherModel_Keys.tstormprob);
			
				
			}
			if (dayElement.getElementsByTagName(AccuWeather_WeatherModel_Keys.nighttime).length > 0) {
				var nightTimeElement = dayElement.getElementsByTagName(AccuWeather_WeatherModel_Keys.nighttime)[0];
	
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nighttxtshort, AccuWeather_WeatherModel_Keys.txtshort);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightweathericon, AccuWeather_WeatherModel_Keys.weathericon);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nighthightemperature, AccuWeather_WeatherModel_Keys.hightemperature);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightlowtemperature, AccuWeather_WeatherModel_Keys.lowtemperature);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightrealfeelhigh, AccuWeather_WeatherModel_Keys.realfeelhigh);		
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightrealfeellow, AccuWeather_WeatherModel_Keys.realfeellow);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightwindspeed, AccuWeather_WeatherModel_Keys.windspeed);		
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightwinddirection, AccuWeather_WeatherModel_Keys.winddirection);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightwindgust, AccuWeather_WeatherModel_Keys.windgust);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightrainamount, AccuWeather_WeatherModel_Keys.rainamount);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightsnowamount, AccuWeather_WeatherModel_Keys.snowamount);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nighticeamount, AccuWeather_WeatherModel_Keys.iceamount);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nightprecipamount, AccuWeather_WeatherModel_Keys.precipamount);
				this.copyChildValue_(dayData, nightTimeElement, AccuWeather_WeatherModel_Keys.nighttstormprob, AccuWeather_WeatherModel_Keys.tstormprob);
			}
			this.forecast.push(dayData);
		}
	
		// loop through "hour" elements
		if (forecastElement.getElementsByTagName(AccuWeather_WeatherModel_Keys.hourly).length > 0) {
			var hourElements = forecastElement.getElementsByTagName(AccuWeather_WeatherModel_Keys.hourly)[0]
									.getElementsByTagName(AccuWeather_WeatherModel_Keys.hour);
//			var todayDate = "";
			var afterMidnight = false;
		
			for (i = 0; i < hourElements.length; i++) {
				var hourElement = hourElements.item(i);
				var hourData = {};
				var ampm;
	
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.txtshort, AccuWeather_WeatherModel_Keys.txtshort);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.weathericon, AccuWeather_WeatherModel_Keys.weathericon);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.temperature, AccuWeather_WeatherModel_Keys.temperature);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.realfeel, AccuWeather_WeatherModel_Keys.realfeel);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.windspeed, AccuWeather_WeatherModel_Keys.windspeed);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.winddirection, AccuWeather_WeatherModel_Keys.winddirection);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.windgust, AccuWeather_WeatherModel_Keys.windgust);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.precipamount, AccuWeather_WeatherModel_Keys.precip);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.rainamount, AccuWeather_WeatherModel_Keys.rain);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.snowamount, AccuWeather_WeatherModel_Keys.snow);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.iceamount, AccuWeather_WeatherModel_Keys.ice);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.humidity, AccuWeather_WeatherModel_Keys.humidity);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.obsdate, AccuWeather_WeatherModel_Keys.obsdate);
				this.copyChildValue_(hourData, hourElement, AccuWeather_WeatherModel_Keys.dewpoint, AccuWeather_WeatherModel_Keys.dewpoint);

				//hourData[AccuWeather_WeatherModel_Keys.hour] = hourElement.getAttribute(AccuWeather_WeatherModel_Keys.time).split(" ")[0];
				hourData[AccuWeather_WeatherModel_Keys.hour] = hourElement.getAttribute(AccuWeather_WeatherModel_Keys.time);
				//ampm = hourElement.getAttribute(AccuWeather_WeatherModel_Keys.time).split(" ")[1];
				
//				if (0 == i) {
//					todayDate = hourData[AccuWeather_WeatherModel_Keys.obsdate];
//				}
				
				hourData[AccuWeather_WeatherModel_Keys.today] = !afterMidnight; //(hourData[AccuWeather_WeatherModel_Keys.obsdate] == todayDate) ? true : false;

				if (hourElement.getAttribute(AccuWeather_WeatherModel_Keys.time) == "11 PM")
					afterMidnight = true;
			
				/*
				if (AccuWeather_WeatherModel_Keys.AM == ampm && AccuWeather_WeatherModel_Keys._12 == hourData[AccuWeather_WeatherModel_Keys.hour]) {
					hourData[AccuWeather_WeatherModel_Keys.hour] = 0;
				} else if (AccuWeather_WeatherModel_Keys.PM == ampm && AccuWeather_WeatherModel_Keys._12 != hourData[AccuWeather_WeatherModel_Keys.hour]) {
					hourData[AccuWeather_WeatherModel_Keys.hour] = Number(hourData[AccuWeather_WeatherModel_Keys.hour]) + 12;
				}
				*/
				this.hourly.push(hourData);
			}

		}
	},

	parseRadar_: function(radarElement) {
		this.warn("doesn't do anything");
	},

	parseIndices_: function(indicesElement) {
		this.log("Parse indices");
	
		// loop through all "indice" elements
		var indiceElements = indicesElement.getElementsByTagName("indice");
		var i;
	
		for (i = 0; i < indiceElements.length; i++) {
			var indiceElement = indiceElements.item(i);
			var indiceData = {};
	
			indiceData[AccuWeather_WeatherModel_Keys.name] = indiceElement.getAttribute(AccuWeather_WeatherModel_Keys.name);
			indiceData[AccuWeather_WeatherModel_Keys.value] = indiceElement.getAttribute(AccuWeather_WeatherModel_Keys.value);
	
			this.indices.push(indiceData);
		}
	},

	// gets texts of all child elements with tag name 'domKey' concatenates them
	// and puts into destination array under 'destKey' index
	copyChildValue_: function(dest, parentNode, destKey, domKey) {
		var children = parentNode.getElementsByTagName(domKey);
	
		// nothing to do?
		if (children.length == 0)
			return;
		var value;

		if (children.length == 1)
			value = children.item(0).textContent;
		else {
			value = "";
			var i;
	
			for (i = 0; i < children.length;i++) {
				var child = children.item(i); 
				value += child.textContent;
			}
		}
		dest[destKey] = value;
	},
	
	copyChildArrayValue_: function(dest, parentNode, destKey, domKey) {
		var children = parentNode.getElementsByTagName(domKey);
	
		if (children.length == 0) return;
		
		var value = [children.length];

		for (var i = 0; i < children.length; i++) {
			value[i] = children.item(i).textContent;
		}
		dest[destKey] = value;
	},

	// removes all weather data
	resetData_: function() {
		this.local = {};
		this.severe = {};
		this.current = {};
		this.video = {};
		this.forecast = [];
		this.hourly = [];
		this.radar = [];
		this.indices = [];
	},
	hourlySortFunction: function(a, b) {
		this.log("a: " + a["hour"] + " b: " + b["hour"]);
		Number(b["hour"]) - Number(a["hour"]);
	}
});

