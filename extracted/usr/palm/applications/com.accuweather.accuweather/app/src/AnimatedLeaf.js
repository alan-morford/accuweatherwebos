var IMAGE_PATH = "images/animated/";

enyo.kind({
    name: "AccuWeather.AnimatedLeaf",
    kind: enyo.Control,
    className: "animated-leaf",
    events: {
    	onLeafAnimationComplete: ""
    },
    centerX: 0,
    frame: 0,
    published: {
    	top: -1,
    	bottom: -1
    },
    components: [
        {kind: "Image", className: "animated-leafimage"},
        {kind: "Animator", easingFunc: enyo.easing.linear, onAnimate: "onStepAnimation", onStop: "onEndAnimation"}
    ],
    
    create: function() {
    	this.inherited(arguments);
    },
    
    animate: function(left, duration) {
    	
    	var leafImageID = Math.floor(Math.random() * LeafCollection.length);
    	this.$.image.setSrc(IMAGE_PATH + LeafCollection[leafImageID].filename);
    	
    	this.applyStyle(Css.TOP, this.top + Css.PX);
    	this.applyStyle(Css.LEFT, left + Css.PX);
    	this.applyStyle(Css.WIDTH, LeafCollection[leafImageID].width + Css.PX);
    	this.applyStyle(Css.HEIGHT, LeafCollection[leafImageID].height + Css.PX);
    	this.applyStyle(Css.VISIBILITY, Css.VISIBLE);
    	
    	this.centerX = left;
    	this.frame = 0;
    	
    	this.animationFactor = Math.random() * 1.2 + 0.5;
    	this.floatWaveHeightFactor = (Math.random() * 0.2 + 0.8) * this.animationFactor;
    	this.floatWaveLengthFactor = (Math.random() * 0.2 + 0.8) * this.animationFactor;
    	
    	this.floatWaveHeightFactor *= 20;
    	this.floatWaveLengthFactor *= 10;
    	
    	
    	this.$.animator.duration = duration;
    	this.$.animator.play(this.top, this.bottom);
    },
    
    onStepAnimation: function(inSender, inValue) {
    	this.applyStyle(Css.TOP, parseInt(inValue) + Css.PX);
    	this.applyStyle(Css.LEFT, (this.centerX + this.floatWaveHeightFactor * 
    			Math.sin(this.frame++ / this.floatWaveLengthFactor)) + Css.PX);
    },
    
    onEndAnimation: function(inSender) {
    	this.doLeafAnimationComplete(this.leafID);
    }
});