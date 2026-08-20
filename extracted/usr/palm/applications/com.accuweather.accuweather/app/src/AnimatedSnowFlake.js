enyo.kind({
    name: "AccuWeather.AnimatedSnowFlake",
    kind: enyo.Control,
    className: "animated-snowflake",
    events: {
    	onSnowFlakeAnimationComplete: ""
    },
    published: {
    	fileName: "images/animated/snow_medium.png",
    },
    components: [
        {kind: "Image", className: "animated-snowflakeimage"},
    ],
    
    create: function() {
    	this.inherited(arguments);
    },

    centerX: 0,
    frame: 0,
    
    animate: function(startTop, endTop, left, duration) {
    	this.$.image.setSrc(this.fileName);
    	this.applyStyle(Css.TOP, startTop + Css.PX);
    	this.applyStyle(Css.LEFT, left + Css.PX);
    	this.applyStyle(Css.WIDTH, this.$.image.getBounds().width + Css.PX);
    	this.applyStyle(Css.HEIGHT, this.$.image.getBounds().height + Css.PX);
    	this.centerX = left;
    	this.frame = 0;
    	this.floatWaveHeightFactor = 10 * (1 + (((Math.random() * 25) - 12.5) / 100));
    	this.floatWaveLengthFactor = 5 * (1 + (((Math.random() * 25) - 12.5) / 100));
    	this.applyStyle(Css.VISIBILITY, Css.VISIBLE);
    	
    	this.startTop = startTop;
    	this.endTop = endTop;
    	this.duration = duration;
    	
    	this.totalElapsedTicks = 0;
    	
    },
    
    stepAnimation: function(elapsedTicks) {
    	this.totalElapsedTicks += elapsedTicks
    	
    	var currentTop = this.startTop + (this.totalElapsedTicks / this.duration * (this.endTop - this.startTop));
    	
    	this.applyStyle(Css.TOP, currentTop + Css.PX);
    	this.applyStyle(Css.LEFT, (this.centerX + this.floatWaveHeightFactor * 
    			Math.sin(this.frame++ / this.floatWaveLengthFactor)) + Css.PX);
    	
    	if (currentTop > this.endTop) {
    		this.applyStyle(Css.VISIBILITY, Css.HIDDEN);
        	this.doSnowFlakeAnimationComplete(this.snowFlakeID);
    	}
    },
});