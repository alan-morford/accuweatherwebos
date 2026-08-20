
enyo.kind({
	name: "AccuWeather.Location",
	kind: enyo.Control,
	_locationResults: [],
	published: {
		appModel: null
	},
	components: [
        {kind: "HFlexBox", className: "locationFrame", onclick: "onLocationButtonClick", components: [
            {name: "locationButton", kind: "CustomButton", className: "location-locationbutton", onclick: "onLocationButtonClick",
                	components: [{kind:"Image", src: "images/menuitem-arrow_down.PNG", 
                		className: "location-locationbuttonimage"}]},
        	{name: "locationText", kind: "Control", className: "location-locationtext"}
        ]},
        {name: "locationsDialog", kind: "ModalDialog", dismissWithClick: true, 
        	onBeforeOpen: "onBeforeLocationsDialogOpen", caption:$LL("Change Location"), components: [
	        	{kind: "RowGroup", caption: $LL("Saved Locations"),components: [
		        	{name: "locationsVirtualList", kind: "VirtualList", style: "height: 150px;", onSetupRow: "onSetupRow", components: [
		 	            {kind: "SwipeableItem", layoutKind: "HFlexLayout", 
		 	            	onclick: "onLocationItemClick", onConfirm: "onLocationDeleteItem", components: [
	                            {name: "caption", flex: 1},
	                            {name: "grabImage", kind: "Image", src: "images/grabbutton.png"}
		                ]}
		 	        ]}
	        	]},
	            {kind: "HFlexBox", components: [
	                {name: "addLocationButton", kind: "IconButton", className: "enyo-button-dark location-addlocationbutton", 
		            	onclick: "onAddLocationButtonClick",
		            	icon: "images/settings_new.png"},
	            	{name: "gpsSearchButton", kind: "IconButton", className: "enyo-button-dark location-gpssearchbutton", 
	                	onclick: "onGpsSearchButtonClick",
	                	icon: "images/nav_bar_icons/navbar_gps.png"}
	        	]}
    	]},
        {name: "scrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [ {kind: "SpinnerLarge", showing: true}] },
    	{name: "locationSearch", kind: "AccuWeather.LocationSearch", onLocationSearchComplete: "onLocationSearchComplete"},
    	{name : "gpsLocationSearch", kind : "PalmService", service : "palm://com.palm.location/", method : "getCurrentPosition",
    	    onSuccess : "gpsLocationSearchSuccess",
    	    onFailure : "gpsLocationSearchFailure"}
    ],
 	
 	create: function() {
		this.inherited(arguments);
	},
	
	appModelChanged: function() {
		this.$.locationSearch.setAppModel(this.appModel);
		this.$.locationText.setContent(this.appModel.getLocationModel().getCurrentLocation().city);
		this.$.locationText.render();
		this.$.locationSearch.render();
	},
	
	onBeforeLocationsDialogOpen: function() {
		this.$.locationsVirtualList.refresh();
	},
	
	onLocationButtonClick: function(inSender, inEvent) {
		this.$.locationsDialog.openAtEvent(inEvent);
	},
	
	onLocationDeleteItem: function(inSender, inIndex) {
		this.appModel.getLocationModel().removeLocationByIndex(inIndex);
		this.$.locationsDialog.close();
	},
	
	onAddLocationButtonClick: function() {
		this.$.locationsDialog.close();
		this.$.locationSearch.startLocationSearch();
	},
	
	doAddLocation: function() {
		this.$.locationSearch.startLocationSearch();
	},
	
	doGPSSearch: function() {
		this.$.gpsLocationSearch.call();
		this.$.scrim.show();
	},
	
	onGpsSearchButtonClick: function() {
		this.$.locationsDialog.close();
		this.doGPSSearch();
	},
	
	onSetupRow: function(inSender, inIndex) {
		if (this.appModel == null) {
			return false;
		}
		
		var locations = this.appModel.getLocationModel().getLocations(); 
		
		if (inIndex >= 0 && inIndex < locations.length) {
			this.$.caption.setContent(locations[inIndex].city + ' ' + locations[inIndex].getShortenState());
			
			if (locations.length == 1) {
				this.$.swipeableItem.setSwipeable(false);
				this.$.grabImage.hide();
			} else {
				this.$.swipeableItem.setSwipeable(true);
				this.$.grabImage.show();
			}
			
			this.$.swipeableItem.setConfirmShowing(false);
			
			return true;
		} else {
			return false;
		}
	},
	
	onLocationItemClick: function(inSender, inEvent) {
		// set new current location
		this.appModel.getLocationModel().setCurrentLocationByIndex(inEvent.rowIndex, true);
		this.$.locationsDialog.close();

		//var locations = this.appModel.getLocationModel().getLocations();
		//enyo.windows.openWindow("index.html", locations[inEvent.rowIndex].location, {locationIndex: inEvent.rowIndex});
		//this.$.locationsDialog.close();
 	},
 	
 	gpsLocationSearchSuccess: function(inSender, inResponse) {
 		var lat = inResponse.latitude;
 		var lon = inResponse.longitude;
 		
 		this.$.locationSearch.startLocationSearchByCoordinates(lat, lon);
 	},
 	
 	gpsLocationSearchFailure: function(inSender, inResponse) {
 		this.error(" gps location search failed! ");
 		this.error(enyo.json.stringify(inResponse));
 		this.$.scrim.hide();
 	},
 	
 	onLocationSearchComplete: function() {
 		this.$.scrim.hide();
 	}
});