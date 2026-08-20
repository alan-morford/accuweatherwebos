var UnitsChangedType = {
		METRIC: 1,
		WIND: 2,
		PRESSURE: 4,
		ADVANCED: 8,
		AMPM: 16,
		MMDD: 32,
		ALL: 63 // <- keep in sync with sum of all items above
};

enyo.kind({
	name: "AccuWeather.UnitsModel",
	kind: enyo.Component,

	published: {
		metric: 0,
		wind: 0,
		pressure: 0,
		ampm: 1,
		mmdd: 1,
		advanced: false
	},
	events: {
		onUnitsModelChanged: "",
		onUnitsModelRestoredFromPreferences: ""
	},
	
	// ------------------
	// methods
	// ------------------
	
	// initialize
	// ----------
	create: function()
	{
		this.inherited(arguments);
		this.log("units model create.");
		this.loadPreferences();
	},

	reloadPreferences: function()
	{
		this.loadPreferences();
		this.doUnitsModelChanged(false, UnitsChangedType.ALL);
	},

	loadPreferences: function()
	{
		// restore from cookies
		// ------------------------
		this.metric = enyo.getCookie("UnitsModel_metric");
		this.wind = enyo.getCookie("UnitsModel_wind");
		this.pressure = enyo.getCookie("UnitsModel_pressure");
		this.advanced = enyo.getCookie("UnitsModel_advanced") == 1 ? true : false;
		this.ampm = enyo.getCookie("UnitsModel_ampm");
		this.mmdd = enyo.getCookie("UnitsModel_mmdd");
		
		var reset=false;// = true;
		
		if (null == this.metric || null == this.wind || null == this.pressure || 
				null == this.advanced || null == this.ampm || null == this.mmdd ||
				true == reset ) {
			this.log("no preferences found - setting default preferences");
			
			this.metric = 0;
		    this.wind = 0;
		    this.pressure = 0;
		    this.advanced = false;
		    this.ampm = 1;
		    this.mmdd = 1;
		    this.savePreferences();
		} else {
			this.log("units model preferences found - metric: " + this.metric + " wind: " + 
					this.wind + " pressure: " + this.pressure + " advanced: " + this.advanced +
					" ampm: " + this.ampm + " mmdd: " + this.mmdd);
		}
	},

  	savePreferences: function()
  	{
  		this.log("saving preferences - metric: " + this.metric + " wind: " + this.wind + " pressure: " +
  				this.pressure + " advanced: " + this.advanced + " ampm: " + this.ampm + " mmdd: " + this.mmdd);
  		enyo.setCookie("UnitsModel_metric", this.metric);
  		enyo.setCookie("UnitsModel_wind", this.wind);
  		enyo.setCookie("UnitsModel_pressure", this.pressure);
  		enyo.setCookie("UnitsModel_advanced", this.advanced == true ? 1 : 0);
  		enyo.setCookie("UnitsModel_ampm", this.ampm);
  		enyo.setCookie("UnitsModel_mmdd", this.mmdd);
  	},
	
	// property set/get notifications
	// ------------------------------
	metricChanged: function()
	{
		this.wind = this.pressure = this.metric;
		this.ampm = this.mmdd = (this.metric == 1 ? 0 : 1);

		this.savePreferences();
		this.doUnitsModelChanged(true, UnitsChangedType.ALL);
	},
	
	windChanged: function()
	{
		this.savePreferences();
		this.doUnitsModelChanged(true, UnitsChangedType.WIND);
	},
	
	pressureChanged: function()
	{
		this.savePreferences();
		this.doUnitsModelChanged(true, UnitsChangedType.PRESSURE);
	},
	
	advancedChanged: function()
	{
		this.savePreferences();
		this.doUnitsModelChanged(true, UnitsChangedType.ADVANCED);
	},
	
	ampmChanged: function()
	{
		this.savePreferences();
		this.doUnitsModelChanged(true, UnitsChangedType.AMPM)
	},

	mmddChanged: function()
	{
		this.savePreferences();
		this.doUnitsModelChanged(true, UnitsChangedType.MMDD)
	},
	
	// unit utility functions
	// ----------------------
	roundedNumberFromFloat: function(number, digits)
	{
		var num = new Number(number);
		return num.toFixed(digits);
	},
	
	temperatureFromString: function(tempString)
	{
		var temp = parseFloat(tempString);

		if (this.metric == 1)
			temp = (temp - 32) * (5.0 / 9.0);
		return this.roundedNumberFromFloat(temp, 0);
	},
	
	temperatureFromStringWithUnit: function(tempString)
	{
		return this.temperatureFromString(tempString) + this.temperatureUnit();
	},

	temperatureUnit: function()
	{
		if (this.metric == 0)
			return "\u2109";
		return "\u2103";
	},

	temperatureUnitRaw: function() {
		if (this.metric == 0) {
			return "F";
		} else {
			return "C";
		}
	},
	
	distanceFromString: function(distanceString)
	{
		var distance = parseFloat(distanceString);
		var unit = "";
		
		if (this.metric == 0)
			unit = " mi";
		else {
			distance *= 1.609;
			unit = " km";
		}
		return this.roundedNumberFromFloat(distance, 0) + unit;
	},

	pressureFromString: function(pressureString)
	{
		var pressure = parseFloat(pressureString);
		var digits = 1;
		var unit = "";
		
		if (this.pressure == 0) {
			digits = 2;
			unit = " in";
		} else if (this.pressure == 1) {
			pressure *= 3.38637526;
			unit = " kPa";
		} else {
			pressure *= 33.8637526;
			unit = " mb";
		}
		return this.roundedNumberFromFloat(pressure, digits) + unit;
	},

	humidityFromString: function(humidityString)
	{
		return humidityString + "%";
	},

	precipFromString: function(precipString)
	{
		var percip = parseFloat(precipString);
		var unit = " in";
		
		if (this.metric == 1) {
			percip /= 0.03937;
			unit = " mm";
		}
		
		if (percip < 0)
			return "trace";
		return  this.roundedNumberFromFloat(percip, 2) + unit;
	},

	timeFromString: function(timeString)
	{
		var time = null;

		if (timeString.split(" ").length == 2)
			time = this.parseTime12_(timeString);
		else
			time = this.parseTime24_(timeString);
		var timeStr;
		var hours = time.getHours();
		var minutes = time.getMinutes();
		
		minutes = minutes < 10 ? "0" + minutes : minutes;
		
		if (this.ampm == true) {
			var suffix;
			if (hours > 12) {
				hours -= 12;
				suffix = " pm";
			} else if (hours == 12) {
				suffix = " pm";
			} else if (hours == 0) {
				hours = 12;
				suffix = " am";
			} else {
				suffix = " am";
			}
				
			timeStr = hours + ":" + minutes + suffix;
		} else {
			timeStr = hours + ":" + minutes;
		}
		return timeStr;
	},

	speedFromString: function(speedString)
	{
		var speed = parseFloat(speedString);
		if (this.wind == 1)
			speed *= 1.609344;
		else if (this.wind == 2)
			speed /= 1.15;
		return this.roundedNumberFromFloat(speed, 0) + this.speedUnit();
	},

	speedUnit: function()
	{
		var unit;

		if (this.wind == 0) {
			unit = " mph";
		} else if (this.wind == 1) {
			unit = " kph";
		} else if (this.wind == 2) {
			unit = " kts";
		}
		return unit;
	},
	
	dateFromString: function(date)
	{
		var d = new Date(date);
		var dayString;
		
		if (this.mmdd == 1) {
			dayString = (d.getMonth() + 1).toString() + "/" + d.getDate();
		} else {
			dayString = d.getDate() + "/" + (d.getMonth() + 1).toString();
		}
		
		return dayString;
	},

	parseTime24_: function(timeString)
	{
		var time = timeString.match(/(\d?\d):?(\d?\d?)/);
		var h = parseInt(time[1], 10);
		var m = parseInt(time[2], 10) || 0;

		if (h > 24) {
			// try a different format
			time = timeString.match(/(\d)(\d?\d?)/);
			h = parseInt(time[1], 10);
			m = parseInt(time[2], 10) || 0;
		} 
		var d = new Date();
		d.setHours(h);
		d.setMinutes(m);
		return d;     
	},

	parseTime12_: function(timeString)
	{
		if (timeString == '')
			return null;

		var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i); 
		if (time == null)
			return null;
	
		var hours = parseInt(time[1],10);    
		if (hours == 12 && !time[4]) {
			hours = 0;
		}
		else {
			hours += (hours < 12 && time[4])? 12 : 0;
		}
		var d = new Date();
		d.setHours(hours);
		d.setMinutes(parseInt(time[3],10) || 0);
		d.setSeconds(0, 0); 
		return d;
	},
});
