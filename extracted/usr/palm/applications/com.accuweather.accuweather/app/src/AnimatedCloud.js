var RAINDROP_FALL_DISTANCE = 400;
var RAINDROP_FALL_DURATION = 1250;
var SNOWFLAKE_FALL_DISTANCE = 400;
var SNOWFLAKE_FALL_DURATION = 4000;
var LIGHTNING_IMAGE_PATH = "images/animated/lightning/";
var LIGHTNING_FILE_EXTENSION = ".png";

enyo.kind({
    name: "AccuWeather.AnimatedCloud",
    kind: enyo.Control,
    className: "animated-cloud",
    cloud: {},
    rainDrops: [],
    snowFlakes: [],
    published: {
    	top: 0,
    	rainBottom: 0,
    	speedFactor: 0,
    	scene: null,
    },
    events: {
    	onAnimationComplete: ""
    },
    components: [
        {name: "cloudImage", kind: "Image", className: "animated-cloud"},
        {name: "lightningImage", kind: "Image", className: "animated-lightning-image"},
        {name: "floatAnimator", kind: "Animator", easingFunc: enyo.easing.linear, onAnimate: "stepFloatingAnimation", onStop: "stopFloatingAnimation"},
        {name: "lightningAnimator", kind: "Animator", easingFunc: enyo.easing.linear, onAnimate: "stepLightningAnimation", onStop: "stopLightningAnimation"}
    ],
    
    create: function() {
    	this.inherited(arguments);
    	this.$.cloudImage.setSrc(this.getCloudFileName());
    	this.$.lightningImage.applyStyle(Css.TOP, parseInt(0.5 * this.cloud.height).toString() + Css.PX);
    	this.$.lightningImage.applyStyle(Css.LEFT, 0 + Css.PX);
    	this.applyStyle(Css.TOP, this.top + Css.PX);
    	this.applyStyle(Css.LEFT, this.left + Css.PX);
    	this.applyStyle(Css.WIDTH, this.getWidth() + Css.PX);
    	this.applyStyle(Css.HEIGHT, this.getHeight() + Css.PX);
    },
    
    getWidth: function() { return this.cloud.width; },
    getHeight: function() { return this.cloud.height; },
    topChanged: function( oldTop ) { 
    	this.applyStyle("top", this.top + "px"); 
    	this.$.lightningImage.applyStyle(Css.TOP, parseInt(0.5 * this.cloud.height).toString() + Css.PX);
	},
    
	getCloudFileName: function() { return "images/animated/" + this.cloud.filename; },

    animate: function(startLeft, endLeft, duration) {
    	
    	this.stopAnimation();
    	this.$.floatAnimator.duration = duration;
    	this.$.floatAnimator.play(startLeft, endLeft);
    	
    	if (this.scene.rainType != null) {
    		this.log("it's raining - rainAmount: " + this.scene.rainAmount + " rainType: " + this.scene.rainType);
    		var rainInterval = 0;
    		
    		switch(this.scene.rainAmount) {
    		case (SOME): rainInterval = 500; break;
    		case (MODERATE): rainInterval = 250; break;
    		case (LOTS): rainInterval = 150; break;
    		};
    		
    		this.rainDrops = new Array( Math.ceil(1000 / rainInterval) * 
    			Math.ceil(RAINDROP_FALL_DURATION / 1000) * 2 );
    		
    		for (var i=0; i < this.rainDrops.length; i++) {
    			this.rainDrops[i] = this.createComponent({kind: "AccuWeather.AnimatedRainDrop", 
        			onRainDropAnimationComplete: "onRainDropAnimationComplete",
        			rainDropID: i,
        			cloudID: this.cloudID});
        		this.rainDrops[i].render();
        		this.rainDrops[i].isIdle = true;
        		this.rainDrops[i].setRainType(this.scene.rainType);
    	    	
    		}
    		
    		this.rainTimer = setInterval(this.rainGenerator.bind(this), rainInterval);
    	}
    	
    	if (this.scene.snowAmount != null) {
    		this.log("it's snowing - snowAmount: " + this.scene.snowAmount);
    		
    		var snowInterval = 0;
    		
    		switch(this.scene.snowAmount) {
    		case (SOME): snowInterval = 750; break;
    		case (MODERATE): snowInterval = 500; break;
    		case (LOTS): snowInterval = 250; break;
    		};
    		
    		this.snowFlakes = new Array( Math.ceil(1000 / snowInterval) * 
    				Math.ceil(SNOWFLAKE_FALL_DURATION / 1000) * 2 );
    		
    		for (var i=0; i < this.snowFlakes.length; i++) {
    			this.snowFlakes[i] = this.createComponent({kind: "AccuWeather.AnimatedSnowFlake", 
        			onSnowFlakeAnimationComplete: "onSnowFlakeAnimationComplete",
        			snowFlakeID: i,
        			cloudID: this.cloudID});
        		this.snowFlakes[i].render();
        		this.snowFlakes[i].isIdle = true;
    		}
    		
    		this.snowTimer = setInterval(this.snowGenerator.bind(this), snowInterval);
    	}
    	
    	var now = new Date();
    	this.priorTick = now.getTime();
    },
    
    snowGenerator: function() {
    	
    	var id=0;
    	for (id=0; id < this.snowFlakes.length; id++){
    		if (this.snowFlakes[id].isIdle) { break; }
    	}
    	
    	if (id != this.snowFlakes.length) {
    	
	    	this.snowFlakes[id].isIdle = false;
	    	
	    	var height = this.getBounds().height;
			var width = this.getBounds().width;
			
			var left = Math.floor(Math.random() * width);
			var dropStartTop = height / 4 * 3;
			var dropDistanceFactor =  1 + (((Math.random() * 25) - 12.5)/100);
			var dropDistance = SNOWFLAKE_FALL_DISTANCE * dropDistanceFactor;
			var dropEndTop = dropStartTop + dropDistance;
			var durationFactor = 1 + (((Math.random() * 50) - 25)/100);
			var duration = dropDistance / SNOWFLAKE_FALL_DISTANCE * SNOWFLAKE_FALL_DURATION * durationFactor;
			
			this.snowFlakes[id].animate(dropStartTop, dropEndTop, left, duration);
    	} else {
    		this.error("error: could not find a snowflake");
    	}
    },
    
    rainGenerator: function() {
    	
    	// check if we can reuse a drop
    	for (var id=0; id < this.rainDrops.length; id++){
    		if (this.rainDrops[id].isIdle) { break; }
    	}
    	
    	if (id != this.rainDrops.length) {
    	
	    	this.rainDrops[id].isIdle = false;
	    	
	    	var height = this.getBounds().height;
			var width = this.getBounds().width;
			
			var left = Math.floor(Math.random() * width);
			var dropStartTop = parseInt(height / 4 * 3);
			var dropDistanceFactor =  1 + (((Math.random() * 25) - 12.5)/100);
			var dropDistance = parseInt(RAINDROP_FALL_DISTANCE * dropDistanceFactor);
			var dropEndTop = dropStartTop + dropDistance;
			var durationFactor = 1 + (((Math.random() * 50) - 25)/100);
			var duration = parseInt(dropDistance / RAINDROP_FALL_DISTANCE * RAINDROP_FALL_DURATION * durationFactor);
			
			this.rainDrops[id].animate(dropStartTop, dropEndTop, left, duration);
    	} else {
    		this.error("error: could not find an available rain drop");
    	}
    },
    
    doLightning: function() {
    	var lightningID = Math.floor(Math.random() * 3);
    	var lightningInstance = LightningCollection[lightningID];

    	this.$.lightningAnimator.lightningInstance = lightningInstance;
    	this.$.lightningAnimator.duration = 500;
    	this.$.lightningAnimator.play(1, lightningInstance.numframes);
    	
    	this.$.lightningImage.show();
    },
    
    stepLightningAnimation: function(inSender, inValue) {
    	
    	
    	var frame = Math.ceil(inValue);
    	frame = frame < 10 ? "0" + frame : frame;
    	
    	var imagePath = LIGHTNING_IMAGE_PATH + inSender.lightningInstance.filenameroot + frame + LIGHTNING_FILE_EXTENSION;
    	this.$.lightningImage.setSrc(imagePath);
    },
    
    stopLightningAnimation: function(inSender) {
    	
    	this.$.lightningImage.setSrc("");
    	this.$.lightningImage.hide();
    },
    
    onRainDropAnimationComplete: function(inSender, rainDropID) {
    	this.rainDrops[rainDropID].isIdle = true;
    },
    
    onSnowFlakeAnimationComplete: function(inSender, snowFlakeID) {
    	this.snowFlakes[snowFlakeID].isIdle = true;
    },
    
    stopAnimation: function() {
    	this.$.floatAnimator.stop();
    	this.$.lightningAnimator.stop();
    	
    	clearInterval(this.rainTimer);
    	this.rainTimer = null;
    	clearInterval(this.snowTimer);
    	this.snowTimer = null;
    	
    	for (var i=0; i < this.rainDrops.length; i++) {
    		this.rainDrops[i].destroy();
    		delete this.rainDrops[i];
    	}
    	this.rainDrops = [];
    	
    	for (var i=0; i < this.snowFlakes.length; i++) {
    		this.snowFlakes[i].destroy();
    		delete this.snowFlakes[i];
    	}
    	this.snowFlakes = [];
    },
    
    stepFloatingAnimation: function(inSender, inValue) {
    	this.applyStyle("left", inValue + "px"); 

    	var now = new Date();
    	var elapsedSinceLastStep = now - this.priorTicks;
    	
    		
    	for (var i=0; i < this.rainDrops.length; i++) {
    		if (false == this.rainDrops[i].isIdle) {
    			this.rainDrops[i].stepAnimation(elapsedSinceLastStep);
    		}
    	}
    	
    	for (var i=0; i < this.snowFlakes.length; i++) {
    		if (false == this.snowFlakes[i].isIdle) {
    			this.snowFlakes[i].stepAnimation(elapsedSinceLastStep);
    		}
    	}
    	
    	this.priorTicks = now;
    },
     
    stopFloatingAnimation: function(inSender) {
        this.doAnimationComplete(this.cloudID);
    }
});