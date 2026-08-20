enyo.kind({
    name: "AccuWeather.AnimatedWeather",
    kind: enyo.Control,
     
    className: "accuweather-body animatedweather",
     
    components: [
        {name: "animatedSun", kind: "AccuWeather.AnimatedSun"},
        {name: "animatedCloudLayer", className: "animated-cloudlayer", kind: "AccuWeather.AnimatedCloudLayer"},
        {name: "animatedIceLayer", className: "animated-icelayer", kind: "AccuWeather.AnimatedIceLayer"},
        {name: "animatedHotLayer", className: "animated-hotlayer", kind: "AccuWeather.AnimatedHotLayer"},
        {name: "animatedColdLayer", className: "animated-coldlayer", kind: "AccuWeather.AnimatedColdLayer"},
        {name: "animatedLeafLayer", className: "animated-leaflayer", kind: "AccuWeather.AnimatedLeafLayer"},
    ],
     
    published: {
        appModel: null,
    },
    
    create: function() {
        this.inherited(arguments);
        this.log();
        this.animations = [];
    },
     
    appModelChanged: function(oldModel) {
    	
    	// get scene configuration
        var scene = AnimationMappings[this.appModel.getWeatherModel().getCurrent()["weathericon"]];
    	//scene = AnimationMappings["32"];
    	
        // cancel any previous renderings
    	this.$.animatedSun.stopRenderScene();
    	this.$.animatedSun.hide();
    	this.$.animatedCloudLayer.stopRenderScene();
    	this.$.animatedCloudLayer.hide();
    	this.$.animatedIceLayer.stopRenderScene();
    	this.$.animatedIceLayer.hide();
    	this.$.animatedHotLayer.stopRenderScene();
    	this.$.animatedHotLayer.hide();
    	this.$.animatedColdLayer.stopRenderScene();
    	this.$.animatedColdLayer.hide();
    	this.$.animatedLeafLayer.stopRenderScene();
    	this.$.animatedLeafLayer.hide();
    	
    	if (scene.sun || scene.moon) {
    		this.$.animatedSun.show();
    		this.$.animatedSun.renderScene(scene); 
    	}
    	
    	if (scene.cloudType != null) {
    		this.$.animatedCloudLayer.show();
    		this.$.animatedCloudLayer.renderScene(scene);
    	} else if (scene.ice == true) {
    		this.$.animatedIceLayer.show();
    		this.$.animatedIceLayer.renderScene(scene);
    	} else if (scene.hot == true) {
    		this.$.animatedHotLayer.show();
    		this.$.animatedHotLayer.renderScene(scene);
    	} else if (scene.cold == true) {
    		this.$.animatedColdLayer.show();
    		this.$.animatedColdLayer.renderScene(scene);
    	} else if (scene.leaves == true) {
    		this.$.animatedLeafLayer.show();
    		this.$.animatedLeafLayer.renderScene(scene);
    	} else {
    		this.error (" unknown scene type - no layer to render ");
    	}
     }
});