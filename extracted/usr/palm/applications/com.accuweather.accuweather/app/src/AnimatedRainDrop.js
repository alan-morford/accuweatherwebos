var AccuWeather_AnimatedRainDropConsts = {
	RAIN_DROP_PATH : "images/animated/rain_drop.png",
	FREEZING_RAIN_DROP_PATH : "images/animated/freezing_rain_drop.png",
	HAIL_DROP_PATH : "images/animated/hail_small.png",
};

enyo.kind({
    name: "AccuWeather.AnimatedRainDrop",
    kind: enyo.Control,
    className: "animated-drop",
    events: {
    	onRainDropAnimationComplete: ""
    },
    published: {
    	rainType: null,
    	fileName: "",
    },
    components: [
        {kind: "Image"},
    ],
    
    create: function() {
    	this.inherited(arguments);
    },

    rainTypeChanged: function(oldRainType) {
     	if (RAIN == this.rainType) {
    		this.fileName = AccuWeather_AnimatedRainDropConsts.RAIN_DROP_PATH;
    	} else if(FREEZING == this.rainType) {
    		this.fileName = AccuWeather_AnimatedRainDropConsts.FREEZING_RAIN_DROP_PATH;
    	} else if (HAIL == this.rainType) {
    		this.fileName = AccuWeather_AnimatedRainDropConsts.HAIL_DROP_PATH;
    	}
    },

    animate: function(startTop, endTop, left, duration) {
    	this.$.image.setSrc(this.fileName);
    	this.applyStyle(Css.TOP, startTop + Css.PX);
    	this.applyStyle(Css.LEFT, left + Css.PX);
    	this.applyStyle(Css.WIDTH, this.$.image.getBounds().width + Css.PX);
    	this.applyStyle(Css.HEIGHT, this.$.image.getBounds().height + Css.PX);
    	this.applyStyle(Css.VISIBILITY, Css.VISIBLE);
    	this.startTop = startTop;
    	this.endTop = endTop;
    	this.duration = duration;
    	
    	this.totalElapsedTicks = 0;
    	this.y = startTop;
    },
    
    stepAnimation: function(elapsedTicks) {
    	
    	this.totalElapsedTicks += elapsedTicks;
    	var currentTop = this.startTop + parseInt(this.totalElapsedTicks / this.duration * (this.endTop - this.startTop));
    	this.applyStyle(Css.TOP, currentTop + Css.PX);
    	
    	if (currentTop > this.endTop) {
    		this.applyStyle(Css.VISIBILITY, Css.HIDDEN);
        	this.doRainDropAnimationComplete(this.rainDropID);
    	}
    }
});