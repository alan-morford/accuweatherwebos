enyo.kind({
	name: "AccuWeather.App_Exhibition_Entry",
	kind: enyo.VFlexBox,

	components: 
	[
	    {kind: "ApplicationEvents", onLoad: "onLoad", onUnload:"unLoad"},
		{name: "pane", kind: "Pane", flex: 1, onSelectView: "onViewSelected", components: [ 
    	 	{name: "exhibition", kind: "AccuWeather.App_Exhibition", lazy: true}
        ]}
    ],
    
    create: function() {
    	this.log();
    	this.inherited(arguments);
    },

    onLoad: function() {
   		this.log("exhibition mode");
   		this.$.pane.selectViewByName("exhibition");
    },

	unLoad: function() {
		var winRoot = enyo.windows.getRootWindow();

		if(winRoot) {
			enyo.windows.setWindowParams(winRoot, {source:this.name, cmd: "unload_exhibition"});
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
    