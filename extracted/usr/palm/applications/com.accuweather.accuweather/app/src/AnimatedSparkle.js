enyo.kind({
    name: "AccuWeather.AnimatedSparkle",
    kind: enyo.Control,
    className: "animated-sparkle",
    events: { onSparkleAnimationComplete: "" },
    components: [
        {kind: "Image", className: "animated-sparkle-image"},
        {kind: "Animator", easingFunc: enyo.easing.linear, onAnimate: "onStepAnimation", onStop: "onEndAnimation"}
    ],
    
    create: function() {
    	this.inherited(arguments);
    	this.imageSrcPathRoot = "images/animated/sparkle00";
    },
    
    animate: function(point) {
    	
    	this.$.image.show();
    	this.$.image.applyStyle(Css.TOP, (point.top - 75) + Css.PX);
    	this.$.image.applyStyle(Css.LEFT, (point.left - 75) + Css.PX);
    	this.$.image.setSrc(this.imageSrcPathRoot + "01.png");
    	
    	var start = 1;
    	var end = 23; // 23 frames
    	
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
    	this.doSparkleAnimationComplete(this.sparkleID);
    },
    
    stopAnimation: function() {
    	this.$.animator.stop();
    }
});