
enyo.kind({
    name: "AccuWeather.AnimatedColdLayer",
    kind: enyo.HFlexBox,
	
    current: 1,
    components: [
        {flex: 1},
        {kind: "Image", src: "images/animated/cold_01.png"},
        {kind: "Animator", easingFunc: enyo.easing.linear, onAnimate: "onStepAnimation", onStop: "onEndAnimation"}
    ],
    
    create: function() {
    	this.inherited(arguments);
    },
    
    renderScene: function(scene) {
    	this.isAnimating = true;
    	this.$.image.show();
    	this.animateToPoint();
    },
    
    stopRenderScene: function() {
    	this.isAnimating = false;
    	this.$.image.hide();
    },
    
    animateToPoint: function() {
    	var target = Math.ceil(Math.random() * 10);
    	this.$.animator.duration = 1000 * Math.abs(target-this.current);
    	this.$.animator.play(this.current, target);
    	this.current = target;
    },
    
    onStepAnimation: function(inSender, inValue) {
    	var val = parseInt(inValue);
    	var tick = val < 10 ? "0" + val : val;
    	this.$.image.setSrc("images/animated/cold_" + tick + ".png");
    },
    
    onEndAnimation: function(inSender) {
    	if (this.isAnimating) {
    		this.animateToPoint();
    	}
    }
});
