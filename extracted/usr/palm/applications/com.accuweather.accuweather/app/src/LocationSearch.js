// ======================================
//  class LocationSearch
// ======================================
var NotificationDialog_EmptyString = 0;
var NotificationDialog_NoResults = 1;


enyo.kind({
	name: "AccuWeather.LocationSearch",
	kind: enyo.Control,
	published: {
		locationResults: [],
		appModel: {}
	},
	events: {
		onLocationSearchComplete: "",
		onLocationSearchCancel: ""
	},
	coordinateSearch_: false,
 	components: [
 		{name: "searchDialog", kind: "ModalDialog", onBeforeOpen: "onBeforeSearchDialogOpen", onOpen: "onSearchDialogOpen", components: [
            {content: $LL("Location Search")},
            {name: "searchTerm", kind: "Input", hint: $LL("enter location to search for"), onchange: "onSearchTermChange"},
            {name: "searchButton", kind: "ActivityButton", active: false, disabled: false, caption: $LL("Search"), className: "enyo-button-affirmative", onclick: "onSearchClick"},
            {name: "cancelButton", kind: "Button", caption: $LL("Cancel"), className: "enyo-button-negative", onclick: "onSearchCancelClick"}
        ]},
        {name: "resultsDialog", kind: "ModalDialog", onBeforeOpen: "onBeforeResultsDialogOpen", components: [
            {kind: "RowGroup", caption: $LL("Search Results"), components: [
	            {kind: "VirtualList", style: "height: 200px;", onSetupRow: "onResultsListSetupRow", components: [
			        {kind: "Item", layoutKind: "HFlexLayout", onclick: "onResultsItemClick",
			            components: [{name: "caption", flex: 1}]}
	        	]}
            ]},
        	{kind: "Button", caption: $LL("Cancel"), className: "enyo-button-negative", onclick: "onResultsCancelClick"}
    	]},
    	{name: "notificationDialog", kind: "Dialog", onBeforeOpen: "onBeforeNotificationDialogOpen", components: [
            {kind: "VFlexBox", components: [
                {name: "notificationDialogTitle", kind: "Control", className: "enyo-item enyo-first", style: "padding: 12px", content: ""},
                {name: "notificationDialogDescription", kind: "Control", className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", content: ""},
                {name: "notificationDialogButton", kind: "Button", content: $LL("OK"), className: "enyo-button-affirmative", onclick: "onNotificationDialogButtonClick"}
            ]}
        ]}
 	],
	
	
	// -------------------------------------
	//  create()
	//   initializes
	// -------------------------------------
	create: function() {
		this.inherited(arguments);

		this.searchURL_ = "";
	    this.CITYFINDURL_ = "http://weather.webosarchive.org/widget/accuwxiphonev4/city-find.asp";
	},

	
	startLocationSearch: function() {
		
		this.log("start location search");
		this.$.searchDialog.openAtCenter();
	},
	
	startLocationSearchBySearchTerm: function(searchTerm) {
		this.searchTermSearch = true;
		this.searchTermValue = searchTerm;
		this.$.searchDialog.openAtCenter();
	},
	
	startLocationSearchByCoordinates: function(lat, lon) {
		this.log("starting location search by coordinates");
		this.initLocationSearchByCoordinates(lat, lon);
	},
	
	onBeforeSearchDialogOpen: function() {
		
		if (this.searchTermSearch == true) {
			this.$.searchTerm.setValue(this.searchTermValue);
			this.$.searchTerm.setDisabled(true);
			this.$.cancelButton.setDisabled(true);
			this.$.searchButton.setDisabled(true);
			this.$.searchButton.setActive(true);
			this.initLocationSearchByLocationTerm(this.$.searchTerm.getValue());
		} else {
			this.$.searchTerm.setValue("");
			this.$.searchTerm.setDisabled(false);
			this.$.cancelButton.setDisabled(false);
			this.$.searchButton.setDisabled(false);
			this.$.searchButton.setActive(false);
		}
	},
	
	onSearchDialogOpen: function() {
		this.$.searchTerm.forceFocusEnableKeyboard();
	},
	
	onBeforeResultsDialogOpen: function() {
		this.$.virtualList.refresh();
	},
	
	onBeforeNotificationDialogOpen: function() {
		if (this.notificationDialogType == NotificationDialog_EmptyString) {
			this.$.notificationDialogTitle.setContent($LL("Empty Search Text"));
 			this.$.notificationDialogDescription.setContent($LL("The search term you entered was empty.  Please enter a location to search for."));
		} else if (this.notificationDialogType == NotificationDialog_NoResults) {
			this.$.notificationDialogTitle.setContent($LL("No Search Results Found"));
 			this.$.notificationDialogDescription.setContent($LL("There were no results found for the location you entered."));
		} else {
			this.$.notificationDialogTitle.setContent("");
 			this.$.notificationDialogDescription.setContent("");
		}
	},
	
	onSearchClick: function() {
 		// search button pressed
		this.startSearch();
 	},
 	
 	onSearchTermChange: function(inSender, inEvent) {
 		// enter key pressed
		// this.startSearch();
		this.$.searchTerm.forceBlur();
 	},
 	
 	startSearch: function() {
 		if ("" == this.$.searchTerm.getValue()) {
 			this.$.searchDialog.close();
 			this.notificationDialogType = NotificationDialog_EmptyString;
 			this.$.notificationDialog.toggleOpen();
 		} else {
 			
 			this.$.searchTerm.setDisabled(true);
 			this.$.cancelButton.setDisabled(true);
 			this.$.searchButton.setDisabled(true);
 			this.$.searchButton.setActive(true);
 			this.initLocationSearchByLocationTerm(this.$.searchTerm.getValue());
 		}
 	},
 	onSearchCancelClick: function() {
 		this.log("search cancel clicked");
 		this.$.searchDialog.close();
 	},
 	
 	onLocationSearchCallbackComplete: function( ) {
 		
 		this.log("search results received. length: " + this.locationResults.length);
 		
 		this.$.searchTerm.setDisabled(false);
		this.$.cancelButton.setDisabled(false);
		this.$.searchButton.setDisabled(false);
		this.$.searchButton.setActive(false);
		this.$.searchDialog.close();
 		
 		if (0 == this.locationResults.length) {
 			this.notificationDialogType = NotificationDialog_NoResults;
 			this.$.notificationDialog.toggleOpen();
 		} else {
	 		this.$.resultsDialog.openAtCenter();
 		}
 	},
 	
 	onCoordinateSearchComplete: function( ) {
 		
 		this.log("search results received. length: " + this.locationResults.length);
 		
 		if (0 == this.locationResults.length) {
 			this.error("no results");
 		} else {
 			var newLoc = this.locationResults[0];
 			this.appModel.getLocationModel().addLocation(new Location(newLoc.city, newLoc.state, newLoc.location), true);
 		}
 		
 		this.doLocationSearchComplete();
 	},
 	
 	onResultsListSetupRow: function(inSender, inIndex) {
		if (inIndex >= 0 && inIndex < this.locationResults.length) {
			this.$.caption.setContent(this.locationResults[inIndex].city + ", " + this.locationResults[inIndex].state);
			return true;
		}
 	},
	
	onResultsItemClick: function(inSender, inEvent) {
		this.log("adding new location to data model");
		var newLoc = this.locationResults[inEvent.rowIndex];
		
		var index = this.appModel.getLocationModel().addLocation(
				new Location(newLoc.city, newLoc.state, newLoc.location), 
				this.searchTermSearch == true ? false : true);
		
		if (this.searchTermSearch == true) {
			this.appModel.getLocationModel().setCurrentLocationByIndex(index, true);
		}
		
		this.$.resultsDialog.close();
		this.doLocationSearchComplete();
	},
 	
 	onResultsCancelClick: function() {
 		this.log("results cancel clicked");
 		this.$.resultsDialog.close();
 		this.doLocationSearchCancel();
 	},
	
 	onNotificationDialogButtonClick: function() {
 		this.$.notificationDialog.close();
 	},
 	
	
 	// =====================================
 	// location search routines
 	// =====================================
	
 	
	
	// -------------------------------------
	//  initLocationSearchByLocationTerm(term, callback)
	//   initializes an asynchronous location search using a search string.
	// -------------------------------------
	initLocationSearchByLocationTerm: function(term) {
		this.coordinateSearch_ = false;
		this.searchURL_ = this.CITYFINDURL_ + "?location=" + term;
		this.log("initializing search by term with URL: " + this.searchURL_);
		this.doLocationSearch_();
	},

	// -------------------------------------
	//  initLocationSearchByCoordinates(lat, lon, callback)
	//  initializes an asynchronous location search using latitude and longitude coordinates.
	// -------------------------------------
	initLocationSearchByCoordinates: function(lat, lon) {
		this.coordinateSearch_ = true;
		this.searchURL_ = this.CITYFINDURL_ + "?latitude=" + lat + "&longitude=" + lon;
		this.log("initializing search by lat/lon coordinates with URL: " + this.searchURL_);
		this.doLocationSearch_();
	},

	// -------------------------------------
	//  doLocationSearch_()
	//   initializes xmlhttp request for search
	// -------------------------------------
	doLocationSearch_: function() {
	
		this.log("doing search " + this.searchURL_);
		this.xmlhttp_=new XMLHttpRequest();
		this.xmlhttp_.onreadystatechange= this.onXMLHTTPRequestReadyStateChange.bind(this);
		this.xmlhttp_.open("GET",this.searchURL_,true);
		this.xmlhttp_.send();
	},

	// -------------------------------------
	//  onXMLHTTPRequestReadyStateChange()
	//    event callback for xmlhttpRequest ready for processing.
	//    parses resulting xml and calls callback with array of LocationModel objects.
	// -------------------------------------
	onXMLHTTPRequestReadyStateChange: function() {
	
		if (this.xmlhttp_.readyState==4 && this.xmlhttp_.status==200) {
			
			this.log("location response received.");
			
			var i, element;
			this.locationResults = [];
			
			var xmlDoc = this.xmlhttp_.responseXML;
			var locations = xmlDoc.getElementsByTagName("location");
			
			this.log("resultCount: " + locations.length);
			
			for (i=0;i<locations.length;i++)
			{
				this.locationResults.push(new Location(locations[i].getAttribute("city"), 
						locations[i].getAttribute("state"),
						locations[i].getAttribute("location")));
			}
			
			if (this.coordinateSearch_ == true) {
				this.onCoordinateSearchComplete();
			} else {
				this.onLocationSearchCallbackComplete();
			}
		}
	}
});


