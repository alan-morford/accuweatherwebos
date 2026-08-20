enyo.kind({
	name: "AccuWeather.App_Interactive_Entry",
	kind: enyo.VFlexBox,

	components: 
	[
	    {kind: "ApplicationEvents", onLoad: "onLoad", onUnload:"unLoad"},
		{name: "pane", kind: "Pane", flex: 1, onSelectView: "onViewSelected", components: [ 
            {name: "interactive", kind: "AccuWeather.App_Interactive", lazy: true},
        ]}
    ],
    
    create: function() {
    	this.log();
    	this.inherited(arguments);
    },

    onLoad: function() {
		this.$.pane.selectViewByName("interactive");
    },
	
	unLoad: function() {
		var winRoot = enyo.windows.getRootWindow();

		if(winRoot) {
			enyo.windows.setWindowParams(winRoot, {source:this.name, cmd: "unload_interactive"});
		}	
	},
    
    onViewSelected: function(inSender, inView, inPreviousView) {
    	this.log("view selected");
    },

    onGoogleMapsLoad: function() {
		this.log("on google maps loaded");
		var viewList = this.$.pane.getViewList();
		for (var i = 0; i < viewList.length; i++) 
		{
			if (viewList[i].onGoogleMapsLoad != null) {
				viewList[i].onGoogleMapsLoad();
			}
		}
	},
});
   