enyo.kind({
	name: "AccuWeather.App",
	kind: enyo.VFlexBox,

	components: 
	[
	    {kind: "ApplicationEvents", 
			onLoad: "onLoad",
			onApplicationRelaunch: "onLoad",
			onWindowParamsChange: "windowParamsChangeHandler"},
    ],

	appWindow: null,
	dockWindow:	null,    

    create: function() {
    	this.log();
    	this.inherited(arguments);
    },

	windowParamsChangeHandler: function() {
		if (enyo.windowParams.cmd == "unload_interactive") {
			this.appWindow = null;
		} else if (enyo.windowParams.cmd == "unload_exhibition") {
			this.dockWindow = null;
		}
	},

    onLoad: function() {
		this.log(enyo.windowParams);
		if (enyo.windowParams
				&& enyo.windowParams.windowType == "dockModeWindow"
				&& enyo.windowParams.dockMode == true) {

			if (this.dockWindow) {
				this.log("dock view exists")
				enyo.windows.activateWindow(this.dockWindow);
			} else
				this.dockWindow = enyo.windows.openWindow("index_exhibition.html","ExhibitionView",{},{window:"dockMode"});
		} else {
			if (this.appWindow){
				this.log("app view exists")
				enyo.windows.activateWindow(this.appWindow);
			} else
				this.appWindow = enyo.windows.openWindow("index_interactive.html","AppView",{});
		}
    },
});
    