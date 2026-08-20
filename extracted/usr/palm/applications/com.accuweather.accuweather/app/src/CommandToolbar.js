var OrientationType = {
	HORIZONTAL: 0,
	VERTICAL: 1
};

enyo.kind({
    name: "AccuWeather.CommandToolbar",
	kind: enyo.Control,
	className: "accuweather-body",
	published: {
        orientation: OrientationType.VERTICAL,
        selected: -1,
        isWeatherAlert: false,
	},
	events: {
		onCommandSelected: "",
		onRefreshSelected: "",
		onGPSSelected: ""
	},
	components: [
		{name: "verticalCommandToolbar", kind: "VFlexBox", flex: 1, showing: false, className: "accuweather-commandtoolbar vertical-commandtoolbar", components:[
 	    	{height: "50px"},
 	    	{name: "verticalCommandToolbarTray", kind: "Control", layoutKind: "VFlexLayout", components:[ 
                {viewName: "forecast", viewID: 0, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical verticalfirst", onclick: "doCmdPress", components: [
   			        {name: "verticalAlertImage", kind: "Image", src: "images/alert01_whiteBorder20.png", className: "commandtoolbar-alertbuttonimage"},
   			        {kind: "Image", src: "images/nav_bar_icons/navbar_forecast.png", className: "commandtoolbar-buttonimage"}
   			    ]},
   	            {viewName: "hourly", viewID: 1, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical ", onclick: "doCmdPress", components: [
    			    {kind: "Image", src: "images/nav_bar_icons/navbar_hourly.png", className: "commandtoolbar-buttonimage"}
   			    ]},
   			    {viewName: "maps", viewID: 2, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical", onclick: "doCmdPress", components: [
     			    {kind: "Image", src: "images/nav_bar_icons/navbar_maps.png", className: "commandtoolbar-buttonimage"}
    			]},
    			{viewName: "news", viewID: 3, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical", onclick: "doCmdPress", components: [
    			    {kind: "Image", src: "images/nav_bar_icons/navbar_news.png", className: "commandtoolbar-buttonimage"}
                ]},
    			// Lifestyle and Video are both dead (neither loads real content
    			// any more) -- hidden rather than removed, so viewID-indexed
    			// selectedChanged() above still lines up correctly.
    			{viewName: "lifestyle", viewID: 4, showing: false, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical", onclick: "doCmdPress", components: [
   			        {kind: "Image", src: "images/nav_bar_icons/navbar_lifestyle.png", className: "commandtoolbar-buttonimage"}
                ]},
                {viewName: "video", viewID: 5, showing: false, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical", onclick: "doCmdPress", components: [
   			        {kind: "Image", src: "images/nav_bar_icons/navbar_video.png", className: "commandtoolbar-buttonimage"}
  			    ]},
//  			    {viewName: "hurricane", viewID: 6, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical", onclick: "doCmdPress", components: [
//  			        {kind: "Image", src: "images/nav_bar_icons/navbar_hurricane.png", className: "commandtoolbar-buttonimage"}
//                ]},
  			    {viewName: "settings", viewID: 6, kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical verticallast", onclick: "doCmdPress", components: [
  		            {kind: "Image", src: "images/nav_bar_icons/navbar_settings.png", className: "commandtoolbar-buttonimage"}
                ]},
 	        ]},
 	        {height: "30px"},
 	        {kind: "VFlexBox", components: [
                {cmd: "gps", kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical verticalfirst", onclick: "doCmdPress", components: [
 			        {kind: "Image", src: "images/nav_bar_icons/navbar_gps.png", className: "commandtoolbar-buttonimage"}
                ]},
                {cmd: "refresh", kind: "CustomButton", className: "commandtoolbar-button commandtoolbar-button-vertical verticallast", onclick: "doCmdPress", components: [
                    {kind: "Image", src: "images/nav_bar_icons/navbar_refresh.png", className: "commandtoolbar-buttonimage"}
                ]},
             ]},
        ]},
        {name: "horizontalCommandToolbar", kind: "HFlexBox", flex: 1, showing: false, className: "accuweather-commandbar horizontal-commandtoolbar", components:[
 	    	{width: "10%"},
 	    	{name: "horizontalCommandToolbarTray", kind: "Control", layoutKind: "HFlexLayout", components:[ 
 			    {viewName: "forecast", viewID: 0, kind: "CustomButton", className: "commandtoolbar-button horizontalfirst", onclick: "doCmdPress", components: [
 			        {name: "horizontalAlertImage", kind: "Image", src: "images/alert01_whiteBorder20.png", className: "commandtoolbar-alertbuttonimage"},
   			        {kind: "Image", src: "images/nav_bar_icons/navbar_forecast.png", className: "commandtoolbar-buttonimage"}
 			    ]},
 	            {viewName: "hourly", viewID: 1, kind: "CustomButton", className: "commandtoolbar-button", onclick: "doCmdPress", components: [
  			        {kind: "Image", src: "images/nav_bar_icons/navbar_hourly.png", className: "commandtoolbar-buttonimage"}
 			    ]},
 			    {viewName: "maps", viewID: 2, kind: "CustomButton", className: "commandtoolbar-button", onclick: "doCmdPress", components: [
   			        {kind: "Image", src: "images/nav_bar_icons/navbar_maps.png", className: "commandtoolbar-buttonimage"}
  			    ]},
  			    {viewName: "news", viewID: 3, kind: "CustomButton", className: "commandtoolbar-button", onclick: "doCmdPress", components: [
  			        {kind: "Image", src: "images/nav_bar_icons/navbar_news.png", className: "commandtoolbar-buttonimage"}
                ]},
  			    {viewName: "lifestyle", viewID: 4, showing: false, kind: "CustomButton", className: "commandtoolbar-button", onclick: "doCmdPress", components: [
 			        {kind: "Image", src: "images/nav_bar_icons/navbar_lifestyle.png", className: "commandtoolbar-buttonimage"}
                ]},
                {viewName: "video", viewID: 5, showing: false, kind: "CustomButton", className: "commandtoolbar-button", onclick: "doCmdPress", components: [
 			        {kind: "Image", src: "images/nav_bar_icons/navbar_video.png", className: "commandtoolbar-buttonimage"}
			    ]},
//			    {viewName: "hurricane", viewID: 6, kind: "CustomButton", className: "commandtoolbar-button", onclick: "doCmdPress", components: [
//			        {kind: "Image", src: "images/nav_bar_icons/navbar_hurricane.png", className: "commandtoolbar-buttonimage"}
 //               ]},
			    {viewName: "settings", viewID: 6, kind: "CustomButton", className: "commandtoolbar-button horizontallast", onclick: "doCmdPress", components: [
		            {kind: "Image", src: "images/nav_bar_icons/navbar_settings.png", className: "commandtoolbar-buttonimage"}
                ]},
 	        ]},
 	        {flex: 1},
 	        {kind: "HFlexBox", components: [
 	            {cmd: "gps", kind: "CustomButton", className: "commandtoolbar-button horizontalfirst", onclick: "doCmdPress", components: [
 	                {kind: "Image", src: "images/nav_bar_icons/navbar_gps.png", className: "commandtoolbar-buttonimage"}
 	            ]},
 	            {cmd: "refresh", kind: "CustomButton", className: "commandtoolbar-button horizontallast", onclick: "doCmdPress", components: [
 	                {kind: "Image", src: "images/nav_bar_icons/navbar_refresh.png", className: "commandtoolbar-buttonimage"}
 	            ]},
 	        ]},
 	       {width: "10%"},
        ]},
	],
	
	create: function() {
		this.inherited(arguments);
		this.orientationChanged();
		this.selectedChanged(-1);
		
		this.$.verticalAlertImage.setShowing(this.isWeatherAlert);
		this.$.horizontalAlertImage.setShowing(this.isWeatherAlert);
	},
	
	orientationChanged: function() {
		this.updateUILayout();
	},
	
	isWeatherAlertChanged: function() {
		this.$.verticalAlertImage.setShowing(this.isWeatherAlert);
		this.$.horizontalAlertImage.setShowing(this.isWeatherAlert);	
	},
	
	selectedChanged: function(previousSelected) {
		if (previousSelected == this.selected) return;
		
		var items = this.$.horizontalCommandToolbarTray.getControls();

		items[this.selected].addClass("commandtoolbutton-selected");
		if (items[previousSelected]) {
			items[previousSelected].removeClass("commandtoolbutton-selected");
		}
				
		items = this.$.verticalCommandToolbarTray.getControls();
		items[this.selected].addClass("commandtoolbutton-selected");
		if (items[previousSelected]) {
			items[previousSelected].removeClass("commandtoolbutton-selected");
		}
	},
	
	updateUILayout: function() {
		if (this.orientation == OrientationType.HORIZONTAL) {
			this.$.verticalCommandToolbar.hide();
			this.$.horizontalCommandToolbar.show();
		} else {
			this.$.verticalCommandToolbar.show();
			this.$.horizontalCommandToolbar.hide();
		}
	},
	
	doCmdPress: function(inSender, inEvent) {
		
		if (inSender.viewName != null) {
			if (inSender.viewID == this.selected) {
				return;
			}
			
			this.setSelected(inSender.viewID);
			this.doCommandSelected(inSender.viewName);
		} else if ("gps" == inSender.cmd) {
			this.doGPSSelected();
		} else if ("refresh" == inSender.cmd) {
			this.doRefreshSelected();
		}
	},
});