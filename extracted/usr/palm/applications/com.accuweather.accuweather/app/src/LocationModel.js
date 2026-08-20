
// ======================================
//  class LocationModel
// ======================================
function Location(city, state, location) {
	this.city = city;
	this.state = state;
	this.location = location;
};

Location.prototype.getShortenState = function() {
/*
	var shortenState;
	
	if (this.state.length > 3) {
		shortenState = this.state.slice(0, 3);
	} else {
		shortenState = this.state;
	}
	return '(' + shortenState + ')';
*/
	// due to the requirements that we should not display shorten
	// names return empty string for now
	return "";
}

enyo.kind({
	name: "AccuWeather.LocationModel",
	kind: enyo.Component,
	_locations: [],
	_currentLocationIndex: -1,
	
	events: {
		onCurrentLocationIndexChanged: "",
		onLocationsChanged: "",
		onLocationRemoved: "",
	},

	// ------------------
	//   methods
	// ------------------
	
	// initialize
	create: function() 
	{
		this.inherited(arguments);
		this.log("location model create.");
		
		this.loadLocationsData();
	},

	loadLocationsData: function()
	{
		// restore from cookies
		// ------------------------
		this._currentLocationIndex = enyo.getCookie("LocationModel_currentLocationIndex");
		var locations = enyo.getCookie("LocationModel_locations");
		if(locations != undefined) {
			var locations = enyo.json.parse(locations, undefined, 2);
			this._locations = [];
			
			for (var i = 0; i < locations.length; i++) {
				this._locations.push(new Location(locations[i].city, locations[i].state, locations[i].location));
			}
		}

		var resetPreferences = false;
		
		if (null == this._locations || null == this._currentLocationIndex || true == resetPreferences) {
			this.log("no preferences found - setting default preferences");
			
			this._locations = new Array(3);
		    this._locations[0] = new Location("New York", "New York", "cityId:349727");
		    this._locations[1] = new Location("Paris", "France (Île-De-France)", "cityId:623");
		    this._locations[2] = new Location("Tokyo", "Japan", "cityId:226396");
		    this._currentLocationIndex = 0;
		    
		    this.savePreferences();
		    this.log("saved preferences locations: " + enyo.json.stringify(this._locations));
			
		} else {
			this.log("location model preferences restored- locations: " + enyo.json.stringify(this._locations));
			this.log(" currentLocationIndex: " + this._currentLocationIndex);
		}
	},

	locationsDataChanged: function()
	{
/*
		var currentLocationId = this._locations[this._currentLocationIndex];
		var locations = enyo.getCookie("LocationModel_locations");

		if (locations != undefined) {
			this._locations = enyo.json.parse(locations, undefined, 2);
			
			var found = false;

			for (var i = 0; i < this._locations.length; i++) {
				if (this._locations[i].location == currentLocationId) {
					this._currentLocationIndex = i;
					found = true;
				}
			}
			if (!found) {
				this.warn("Failed to restore current location index");
				this._currentLocationIndex = 0;
			}
		}
*/
	},
	
  	savePreferences: function()
  	{
  		this.log("saving preferences");
  		this.log("locations: " + enyo.json.stringify(this._locations) + " currentLocationIndex: " + enyo.json.stringify(this._currentLocationIndex));
  		enyo.setCookie("LocationModel_currentLocationIndex", this._currentLocationIndex);
  		enyo.setCookie("LocationModel_locations", enyo.json.stringify(this._locations));
  	},
  		
	getCurrentLocationIndex: function() {
  		return this._currentLocationIndex;
  	},
  	
  	getLocations: function() {
  		return this._locations;
  	},
   	
  	setCurrentLocationByIndex: function(index, savePreferences)
  	{
		this.log("======== setting index" + index + " " + this._locations.length);
	
   		if (index >= 0 && index < this._locations.length) {
	  		this._currentLocationIndex = index;
			if (savePreferences) {
				this.savePreferences();
				this.doCurrentLocationIndexChanged(this._currentLocationIndex);
			}
   		}
  	},
  	swapLocations: function(indexA, indexB) {
  		this.log("swapping locations: indexA - " + indexA + " indexB - " + indexB);
  		
  		
  		var tmpLocation = this._locations[indexA];
  		this._locations[indexA] = this._locations[indexB];
  		this._locations[indexB] = tmpLocation;
  		
  		if (this._currentLocationIndex == indexA) {
  			this._currentLocationIndex = indexB;
  		} else if (this._currentLocationIndex == indexB) {
  			this._currentLocationIndex = indexA;
  		}
  	},
	addLocation: function(location, open) {
		var found = -1;
		
		for (var i=0; i < this._locations.length; i++) {
			if (this._locations[i].location == location.location) {
				found = i;
				break;
			}
		}
		
		if(-1 == found) {
		
			this._locations.push(location);
			found = this._locations.length - 1;
			this.savePreferences();
	   		this.doLocationsChanged(this._locations);
		}

        if (open == true) {
			this.log("======== set location index to " + found);
			this.setCurrentLocationByIndex(found, true);
//			enyo.windows.openWindow("index.html", this._locations[found].location, {locationIndex: found});		
		} else {
			return found;
		}
	},
	
	removeLocationByIndex: function(index) {
		this.log("removing location w/ index: " + index);
		
		if (index < this._locations.length && index >= 0) {
			this.log("removing index");
			var removedLocation = this._locations[index];
			
			this._locations.splice(index, 1);
			
			// adjust "current location" index if necessary
			// --------------------------------------------
			if (index < this._currentLocationIndex) {
				this._currentLocationIndex--;
			} else if (index == this._currentLocationIndex) {
				if (this._currentLocationIndex == this._locations.length ) {
					this._currentLocationIndex--;
				} // all other cases the new currentLocation will be the one after
			} // don't care when index > this._currentLocationIndex
		
			this.savePreferences();
			this.doLocationRemoved(removedLocation);
			this.doLocationsChanged(this._locations);
			this.doCurrentLocationIndexChanged(this._currentLocationIndex);
			
		} else {
			this.log("not removing index");
		}
	},

	locationsNum: function() {
		return this._locations.length;
	},

  	getCurrentLocation: function()
  	{
  		return this._locations[this._currentLocationIndex];
  	} 
});