var IMAGE_PATH = "images/animated/"


enyo.kind({
    name: "AccuWeather.AnimatedIceLayer",
    kind: enyo.Control,
    className: "animated-icelayer",
	timersStop: false,
    icicles: [],
    glows: [],
    sparkles: [],
    components: [],
    
    create: function() {
    	this.inherited(arguments);
    },
    
    renderScene: function(scene) {
    	this.log();
    	
    	// get icicle collection
    	var icicles = IcicleCollection;
    	
    	this.icicles = [];
    	
    	// place random number of icicles
    	var width = this.getBounds().width;
    	var numIcicles = Math.ceil(Math.random() * 5) + 4;
    	var avgSpacing = (width - numIcicles * 50) / numIcicles;
    	var prevIcicleRight = 0;
    	
    	// create icicles
    	this.log("creating " + numIcicles + " icicles");
    	for (var i=0; i < numIcicles; i++) {
    		this.icicles[i] = this.createComponent({kind: "Image", className: "animated-icicleImage"});
    		this.icicles[i].render();
    		
    		this.icicles[i].fileImage = IcicleCollection[Math.floor(Math.random() * IcicleCollection.length)];
    		this.icicles[i].setSrc(IMAGE_PATH + this.icicles[i].fileImage.filename);
    		this.icicles[i].applyStyle(Css.TOP, 0 + Css.PX);
    		
    		var icicleHeightFactor = ((Math.random() * 30 + 70) / 100);
    		this.icicles[i].applyStyle(Css.HEIGHT, 
    				parseInt(icicleHeightFactor * this.icicles[i].fileImage.height)+ Css.PX);
    		var icicleLeft = prevIcicleRight + parseInt(avgSpacing * (Math.random() * 2));
    		this.icicles[i].applyStyle(Css.LEFT, icicleLeft + Css.PX);
    		
    		prevIcicleRight = icicleLeft + this.icicles[i].fileImage.width;
    		this.log("created icicle: " + this.icicles[i].fileImage.filename + " left: " + icicleLeft + " right: " + prevIcicleRight);
    	}
    	
    	// create sparkles
    	var numSparkles = 3;
    	this.sparkles = [];
    	for (var i=0; i < numSparkles; i++) {
			this.sparkles[i] = this.createComponent({kind: "AccuWeather.AnimatedSparkle", 
    			onSparkleAnimationComplete: "onSparkleAnimationComplete",
    			sparkleID: i, isIdle: true});
    		this.sparkles[i].render();
		}
	
    	// create glows
    	var numGlows = 10;
    	this.glows = [];
    	for (var i=0; i < numGlows; i++) {
			this.glows[i] = this.createComponent({kind: "AccuWeather.AnimatedGlow", 
    			onGlowAnimationComplete: "onGlowAnimationComplete",
    			glowID: i, isIdle: true});
    		this.glows[i].render();
		}
    	
    	// start sparkle-generation & glow-generation timers
    	this.timersStop = false;
    	var sparkleTimeout = parseInt(Math.random() * 8) * 1000;
    	this.sparkleTimer = setTimeout(this.sparkleGenerator.bind(this), sparkleTimeout);
    	
    	var glowTimeout = parseInt(Math.random() * 5) * 500;
    	this.glowTimer = setTimeout(this.glowGenerator.bind(this), glowTimeout);
    	
    },
    
    stopRenderScene: function() {
    	
    	// stop timers
    	this.timersStop = true;
    	clearTimeout(this.sparkleTimer);
    	clearTimeout(this.glowTimer);
    	
    	// delete the sparkles
		for (id=0; id < this.sparkles.length; id++){
    		this.sparkles[id].stopAnimation();
    		this.sparkles[id].destroy();
    		this.sparkles[id] = null;
    	}
		this.sparkles = null;

		// delete the glows
		for (id=0; id < this.glows.length; id++){
    		this.glows[id].stopAnimation();
    		this.glows[id].destroy();
    		this.glows[id] = null;
    	}
		this.glows = null;
		
    	// delete icicles
    	for (var i=0; i < this.icicles.length; i++) {
    		this.icicles[i].destroy();
    		delete this.icicles[i];
    		this.icicles[i] = null;
    	}
    	this.icicles = null;
    },
    
    sparkleGenerator: function() {
    	
    	var point = this.findEffectStartLocation();
    	// find an idle sparkle to use and animate it
    	var id=0;
    	for (id=0; id < this.sparkles.length; id++){
    		if (this.sparkles[id].isIdle) { 
    			this.sparkles[id].isIdle = false; 
    			this.sparkles[id].animate(point);
    			break; 
			}
    	}
    	
    	if (id == this.sparkles.length) {
    		this.error("no sparkle found");
    	}
    	
    	if (!this.timersStop) {
    		var sparkleTimeout = parseInt(Math.random() * 8) * 1000;
    		this.sparkleTimer = setTimeout(this.sparkleGenerator.bind(this), sparkleTimeout);
    	}
    },
    
    glowGenerator: function() {
    	
    	var point = this.findEffectStartLocation();
    	
    	// find an idle glow to use and animate it
    	var id=0;
    	for (id=0; id < this.glows.length; id++){
    		if (this.glows[id].isIdle) { 
    			this.glows[id].isIdle = false; 
    			this.glows[id].animate(point);
    			break; 
			}
    	}
    	
    	if (id == this.glows.length) {
    		this.error("no glow found");
    	}
    	
    	if (!this.timersStop) {
    		var glowTimout = parseInt(Math.random() * 5) * 500;
    		this.glowTimer = setTimeout(this.glowGenerator.bind(this), glowTimout);
    	}
    },
    
    findEffectStartLocation: function() {
    	
    	var point ={};
    	point.left = 0;
    	point.top = 0;
    	
    	// choose a random icicle
    	var icicleID = Math.floor(Math.random() * this.icicles.length);
    	
    	// find a random height in the top 80% of the icicle
    	var height = Math.floor(Math.random() * 0.8 * this.icicles[icicleID].getBounds().height);
    	
    	// find a random side
    	var left = Math.floor(Math.random() * 2); // 0 == left, 1 == right
    	
    	// determine coordinates
    	point.top = height;
    	point.left = parseInt(this.icicles[icicleID].getBounds().left + 
    			((Math.random() * 0.5) + 0.25) * this.icicles[icicleID].getBounds().width);
    	
    	return point;
    },
    
    onSparkleAnimationComplete: function(inSender, sparkleID) {
    	this.sparkles[sparkleID].isIdle = true;
    },
    
    onGlowAnimationComplete: function(inSender, glowID) {
    	this.glows[glowID].isIdle = true;
    }
});
