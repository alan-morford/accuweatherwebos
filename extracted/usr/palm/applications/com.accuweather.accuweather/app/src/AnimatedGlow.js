enyo.kind({
    name: "AccuWeather.AnimatedGlow",
    kind: enyo.Control,
    className: "animated-glow",
    events: { onGlowAnimationComplete: "" },
    components: [
        {kind: "Image", className: "animated-glow-image"},
        {kind: "Animator", easingFunc: enyo.easing.linear, onAnimate: "onStepAnimation", onStop: "onEndAnimation"}
    ],
    
    create: function() {
    	this.inherited(arguments);
    	this.imageSrcPathRoot = "images/animated/glow";
    	this.$.image.hide();
    },
    
    animate: function(point) {
    	this.$.image.show();
    	
    	this.$.image.applyStyle(Css.TOP, (point.top - 25) + Css.PX);
    	this.$.image.applyStyle(Css.LEFT, (point.left - 25) + Css.PX);
    	this.$.image.setSrc(this.imageSrcPathRoot + "01.png");
    	
    	var start = 1;
    	var end = 40; // 40 frames
    	
    	this.$.animator.duration = 2000;
    	this.$.animator.play(start, end);
    },
    
    onStepAnimation: function(inSender, inValue) {
    	var fileName = this.imageSrcPathRoot;
    	var frameNum = parseInt(inValue);
    	fileName += (frameNum < 10 ? "0" + frameNum : frameNum);
    	fileName += ".png";
    	this.$.image.setSrc(fileName);
    },
    
    onEndAnimation: function(inSender) {
    	this.$.image.hide();
    	this.doGlowAnimationComplete(this.glowID);
    },
    
    stopAnimation: function(inSender) {
    	this.$.animator.stop();
    }
});