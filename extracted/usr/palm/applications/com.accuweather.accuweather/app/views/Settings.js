

enyo.kind({
	name: "AccuWeather.Settings",
	kind: enyo.HFlexBox,
	className: "accuweather-body",  
	components: [
        {kind: "ApplicationEvents", onWindowRotated: "onWindowRotated"},
    	
        {name: "settings", kind: "HFlexBox", className: "settings", components: [
	        {flex: 1},
	        {kind: "VFlexBox", className: "settings-locationscolumn", components: [
		    	{kind: "RowGroup", caption: $LL("Saved Locations"), className: "settings-location-rowgroup", components: [
		        	{name: "locationsVirtualList", kind: "VirtualList", style: "height: 150px;", onSetupRow: "onSetupRow", components: [
	        	        {kind: "SwipeableItem", layoutKind: "HFlexLayout", onclick: "onLocationItemClick", onConfirm: "onLocationDeleteItem", components: [
	                        {name: "caption"},
	                        {flex: 1},
                			{name: "grabImage", kind: "Image", src: "images/grabbutton.png"}
                        ]},
		 	        ]},
		    	]},
                {name: "addLocationButton", kind: "IconButton", className: "enyo-button-dark settings-addlocationbutton", 
	            	onclick: "onAddLocationButtonClick",
	            	icon: "images/settings_new.png", width: "32px"},
	        	{flex: 1},
	        	{kind: "VFlexBox", name: "moreportrait", components: [
		        	{content: $LL("More"), className: "settings-headertext"},
					{kind: "Button", content: $LL("Support"), onclick: "onSupportClick"},
					{kind: "Button", content: $LL("Terms & Conditions"), onclick: "onTermsClick"},
					{kind: "Button", content: $LL("About AccuWeather.com"), onclick: "onAboutClick"},
				]}
	        ]},
	        {flex: 1},
	    	{name: "unitsColumn", kind: "VFlexBox", className: "settings-unitscolumn", components: [
                {kind: "HFlexBox", name: "advancedSettingsPortrait", className: "settings-advancedsettings-portrait", components: [
					{kind: "Control", content: $LL("Advanced Settings"), className: "settings-titletext-advanced"},
					{flex: 1},
					{name: "advancedToggleButtonPortrait", kind: "ToggleButton", onChange: "onAdvancedToggleChange"},
				]},
				{name: "settingsSpacer", kind: "Control", className: "settings-spacer"},
				{kind: "VFlexBox", align: "center", components: [
                    {content: $LL("Units"), className: "settings-titletext-units"},
		            {name: "unitsRadioGroup", className: "settings-unitsradio ", kind: "RadioGroup", onChange: "unitsChanged", components: [
	                    {label: $LL("Imperial")}, 
	                    {label: $LL("Metric")}
	                ]}
                ]},
                {flex: 1},
                {name: "unitsDivider", kind: "Control", className: "settings-divider"},
                {flex: 1},
                {name: "advancedSettings", kind: "VFlexBox", className: "settings-advancedsettings", components: [
                    {kind: "HFlexBox", components: [
	                    {kind: "Control", className: "settings-unittitle", content: $LL("Wind Speed")},
						{flex: 1},
						{name: "windSpeed", kind: "RadioGroup", onChange: "windSpeedChanged", components: [
	                        {label: "mph"}, 
	                        {label: "kph"},
	                        {label: "kts"}, 
	                    ]},
                    ]},
                    {kind: "HFlexBox", components: [
	                    {kind: "Control", className: "settings-unittitle", content: $LL("Time Format")},
	                    {flex: 1},
						{name: "timeFormat", kind: "RadioGroup", onChange: "timeUnitsChanged", components: [
	                        {label: "24 h"}, 
	                        {label: "12 h"}
	                    ]}
                    ]},
                    {kind: "HFlexBox", components: [
                        {kind: "Control", className: "settings-unittitle", content: $LL("Date Format")},
                        {flex: 1},
						{name: "dateFormat", kind: "RadioGroup", onChange: "dateFormatChanged", components: [
	                        {label: $LL("DD/MM")}, 
	                        {label: $LL("MM/DD")}
	                    ]}
                    ]}
                ]},
            ]},
	    	{flex: 1},
	    	{kind: "VFlexBox", name: "morecolumn", className: "settings-morecolumn", components: [
              	{kind: "VFlexBox", components: [
					{kind: "Control", content: $LL("Advanced Settings"), className: "settings-titletext-advanced"},
					{name: "advancedToggleButton", kind: "ToggleButton", onChange: "onAdvancedToggleChange"},
				]},
                {flex: 1},
                {content: $LL("More"), className: "settings-headertext"},
				{kind: "Button", content: $LL("Support"), onclick: "onSupportClick"},
				{kind: "Button", content: $LL("Terms & Conditions"), onclick: "onTermsClick"},
				{kind: "Button", content: $LL("About AccuWeather.com"), onclick: "onAboutClick"},
	    	]},
	    	{name: "moreFlex", flex: 1},
        ]},
     
		{name: "termsDialog", kind: "AccuWeather.TermsDialog"},
		{name: "aboutDialog", kind: "AccuWeather.AboutDialog"},
		{name: "supportDialog", kind: "AccuWeather.SupportDialog"},
    ],
    uiStale: true,
	               
	published: {
		appModel: {},
	},
	
	events: {
		onAddNewLocation: "",
	},
	  
	create: function() {
		this.inherited(arguments);
	},
	 
	onShow: function() { 
		this.visible = true;
		if (this.uiStale) {
			this.redrawUI();
		}
	},
	
	onHide: function() { 
		this.visible = false;
	},
	
	onWindowRotated: function() {
		this.redrawUI();
	},
	
	appModelChanged: function(oldAppModel) {
		if (this.visible) {
			this.redrawUI();
		} else {
			this.uiStale = true;
		}
	},
	
	onUnitsModelChanged: function() {
	    if (this.visible) {
			this.redrawUI();
		} else {
			this.uiStale = true;
		}
	},

	redrawUI: function() {
		
		this.$.locationsVirtualList.refresh();
		
		var units = this.appModel.getUnitsModel();
		this.$.unitsRadioGroup.setValue(units.getMetric());
		this.$.advancedToggleButton.setState(units.getAdvanced());
		this.$.advancedToggleButtonPortrait.setState(units.getAdvanced());
		this.$.windSpeed.setValue(units.getWind());
		this.$.timeFormat.setValue(units.getAmpm());
		this.$.dateFormat.setValue(units.getMmdd());
		
		if(units.getAdvanced()) {
			this.$.advancedSettings.show();
			this.$.unitsDivider.show();
		} else {
			this.$.advancedSettings.hide();
			this.$.unitsDivider.hide();
		}
		
		var appBounds =  this.getParent().getParent().getBounds();
		if (appBounds.width > appBounds.height) {
			// landscape
			this.$.moreportrait.hide();
			this.$.settingsSpacer.hide();
			this.$.morecolumn.show();
			this.$.moreFlex.show();
			this.$.advancedSettingsPortrait.hide();
			
			this.$.settings.removeClass("settings-portrait");

		} else {
			// portrait
			this.$.moreportrait.show();
			this.$.settingsSpacer.show();
			this.$.morecolumn.hide();
			this.$.moreFlex.hide();
			this.$.advancedSettingsPortrait.show();
			this.$.settings.addClass("settings-portrait");
		}
	},

	windSpeedChanged: function(inSender, inValue) {
		this.appModel.getUnitsModel().setWind(inValue);
	},
	
	unitsChanged: function (inSender, inValue) {
		this.appModel.getUnitsModel().setMetric(inValue);
	},
	
	onAdvancedToggleChange: function(inSender, inState) {
		this.appModel.getUnitsModel().setAdvanced(inState);
		this.$.advancedToggleButton.setState(inState);
		this.$.advancedToggleButtonPortrait.setState(inState);
		
		// reset advanced settings back to default
		if (false == inState) {
			this.appModel.getUnitsModel().setMetric(this.appModel.getUnitsModel().getMetric());
		}
	},

	timeUnitsChanged: function(inSender, inValue) {
		this.appModel.getUnitsModel().setAmpm(inValue);
	},
	
	dateFormatChanged: function(inSender, inValue) {
		this.appModel.getUnitsModel().setMmdd(inValue);
	},
	
	onSetupRow: function(inSender, inIndex) {
		var locations = this.appModel.getLocationModel().getLocations();
		if (inIndex >=0 && inIndex < locations.length) {
			this.$.caption.setContent(locations[inIndex].city + ' ' + locations[inIndex].getShortenState());
			
			if (locations.length == 1) {
				this.$.swipeableItem.setSwipeable(false);
				this.$.grabImage.hide();
			} else {
				this.$.swipeableItem.setSwipeable(true);
				this.$.grabImage.show();
			}
			
			return true;
		}
	},
	
	onLocationDeleteItem: function (inSender, inIndex) {
		this.appModel.getLocationModel().removeLocationByIndex(inIndex);
	},
	
	onAddLocationButtonClick: function() {
		this.doAddNewLocation();
	},

	onLocationItemClick: function(inSender, inEvent) {
		this.appModel.getLocationModel().setCurrentLocationByIndex(inEvent.rowIndex, true);
	},
	
	onTermsClick: function() { this.$.termsDialog.open(); },
	
	onAboutClick: function() { this.$.aboutDialog.open(); },
	
	onSupportClick: function() { this.$.supportDialog.open(); },
});