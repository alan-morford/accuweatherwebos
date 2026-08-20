enyo.kind({
    name: "AccuWeather.AnimatedSun",
    kind: enyo.VFlexBox,
    className: "animated-sun",
    
    animations: [],
    
    components: [
    	{name: "base", kind: "Image", className: "animated-sunshinebaseimage"},
        {name: "upper", kind: "Image", className: "animated-sunshineupperimage"},
        {name: "ray1", kind: "Image", className: "animated-sunrayimage"},
        {name: "ray2", kind: "Image", className: "animated-sunrayimage"}
    ],
    
    create: function() {
        this.inherited(arguments);
    },
    
    stepOpacityAnimation: function(inSender, inValue) {
        var opacity = parseFloat(inValue) / 100.0;
        inSender.control.node.style.opacity = opacity;
    },
    
    renderScene: function(scene) {
    	this.stopRenderScene();
    	
        if (scene.sun == true) {
        	this.renderSun();
        } else if (scene.moon == true) {
        	this.renderMoon();
        }
    },
    
    stopRenderScene: function() {
    	this.$.base.setSrc("");
    	this.$.upper.setSrc("");
    	this.$.ray1.setSrc("");
    	this.$.ray2.setSrc("");
    	
    	for (var i=0; i < this.animations.length; i++) {
			this.animations[i].stop();
			delete this.animations[i];
			this.animations[i] = null;
		}
    	
    	this.animations = [];
    },
    
    renderMoon: function() {
    	this.$.base.setSrc("images/animated/moon.png");
    },
    
    renderSun: function() {
    	this.log("rendering sun");
        this.$.base.setSrc("images/animated/sun_shine_bottomLayer.png");
        this.$.ray1.setSrc("images/animated/sun_ray1.png");
        this.$.ray2.setSrc("images/animated/sun_ray2.png");
        this.$.upper.setSrc("images/animated/sun_upperLayer.png");
        
	    // start ray animation
	   	this.$.ray1.setStyle("opacity", "0");
	   	this.animations[0] = this.createComponent({kind: "Animator", easingFunc: enyo.easing.linear, 
	   	    onAnimate: "stepOpacityAnimation", onStop: "stopOpacityAnimation", 
	   		s: 0, e: 100, control: this.$.ray1 });
        this.animations[0].duration = 2000;
		this.animations[0].play(0,100);
			 
		this.$.ray2.setStyle("opacity", "1");
	   	this.animations[1] = this.createComponent({kind: "Animator", easingFunc: enyo.easing.linear,
	   	    onAnimate: "stepOpacityAnimation", onStop: "stopOpacityAnimation", 
	   		s: 100, e: 0, control: this.$.ray2 });
        this.animations[1].duration = 2000;
		this.animations[1].play(100,0);
    },
    
    stepOpacityAnimation: function(inSender, inValue) {
    	inSender.control.node.style.opacity = parseFloat(inValue) / 100.0 ; 
     },
     
    stopOpacityAnimation: function(inSender) {
        var end = inSender.e;
        var start = inSender.s;
        inSender.s = end;
        inSender.e = start;
        inSender.play(end, start);
    }
});