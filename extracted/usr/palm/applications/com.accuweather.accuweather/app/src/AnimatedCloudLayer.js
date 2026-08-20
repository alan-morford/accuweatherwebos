var CLOUD_SPEED_CONSTANT = 100000.0;
    			

enyo.kind({
    name: "AccuWeather.AnimatedCloudLayer",
    kind: enyo.Control,
    className: "animated-cloudlayer",
	
    clouds: [],
    components: [
        {kind: "ApplicationEvents", onWindowRotated: "onWindowRotated"},
        {flex: 1},
        {kind: "Image", src: "images/animated/black_gradient.png", 
        	className: "animated-leaflayer-gradient", 
        	height: "30px", 
        	width: "100%"}
    ],
    
    create: function() {
    	this.inherited(arguments);
    },
    
    onWindowRotated: function(inSender) {
    	this.log();
    	var newBounds = this.getBounds();
    	
    	var yScaling = newBounds.height / this.viewBounds.height;
    	for (var i=0; i < this.clouds.length; i++) {
    		this.clouds[i].setTop(parseInt(this.clouds[i].getTop() * yScaling));
    	}
    	
    	this.viewBounds = this.getBounds();
    },
    
    stopRenderScene: function() {
    	
    	this.stopLightning = true;
    	
    	for (var i=0 ; i < this.clouds.length; i++) {
    		this.clouds[i].stopAnimation();
    		this.clouds[i].destroy();
    		delete this.clouds[i];
    	}
    },
    
    renderScene: function(scene) {
    	
    	this.stopRenderScene();
    	
    	var cloudCollection = [];
    	this.clouds =[];
    	this.viewBounds = this.getBounds();

		this.log("cloud type: " + scene.cloudType + " cloud amount: " + scene.cloudAmount);
		
		cloudCollection = CloudCollections[scene.cloudType];
		this.log(cloudCollection);
		
		var cloudCount = 0;
		
		switch (scene.cloudAmount) {
			case (SOME): cloudCount = Math.ceil(Math.random()*4 + 3); break;
			case (MODERATE): cloudCount = Math.ceil(Math.random()*4 + 7); break;
			case (LOTS): cloudCount = Math.ceil(Math.random()*4 + 10); break;
		}

		this.log("creating " + cloudCount + " clouds.");
		this.clouds = [];
		
		for (var i=0; i < cloudCount; i++) {
			
			var height = this.getBounds().height;
			var width = this.getBounds().width;
			
			var cloudTop;
			if (scene.lightning == true) {
				cloudTop = Math.floor((Math.random() * 0.45 * height) - (0.10 * height));
			} else {
				cloudTop = Math.floor((Math.random() * 0.6 * height) - (0.15 * height));
			}
				
			var cloud = cloudCollection[Math.floor(Math.random() * cloudCollection.length)]
			this.clouds[i] = this.createComponent({kind: "AccuWeather.AnimatedCloud", 
				onAnimationComplete: "onCloudAnimationComplete",
				cloudID: i, cloud: cloud, top: cloudTop, left: startLeft});
			
			this.clouds[i].applyStyle("z-index", 6 + 2*i);
			this.clouds[i].setScene(scene);
			var speedFactor = ((cloudCount + 2 - i) / cloudCount) * 1.5;
			this.clouds[i].setSpeedFactor(speedFactor);
			this.clouds[i].render();
			
			var startLeft = parseInt(Math.random() * width * 1.25);
			var endLeft = parseInt(0 - this.clouds[i].getWidth());
			var actualDistance = startLeft - endLeft;
			var duration = (actualDistance / width * (CLOUD_SPEED_CONSTANT * speedFactor));
			this.clouds[i].animate(startLeft, endLeft, duration);
		}
		
		if (scene.lightning == true) {
			
			this.stopLightning = false;
			
			// start lightning timer
			this.lightningTimer = setTimeout(this.onLightning.bind(this), 
					parseInt(Math.random() * 2000));
		}
    },
    
    onLightning: function() {
    	
    	// find random cloud & do lightning
    	var cloudID = Math.floor(Math.random() * this.clouds.length);
    	this.clouds[cloudID].doLightning();
    	
    	// flash white screen
    	this.applyStyle("background-color", "#FFFFFF");
    	setTimeout(this.onEndLightningFlash.bind(this), parseInt(Math.random() * 200));
    	
    	// set next lightning timer
    	if (this.stopLightning == false) {
			this.lightningTimer = setTimeout(this.onLightning.bind(this), parseInt(Math.random() * 5000));
    	}
    },
    
    onEndLightningFlash: function() {
    	this.applyStyle("background-color", "null");
    },
    
    onCloudAnimationComplete: function(inSender, cloudID) {
    	
    	var height = this.getBounds().height;
		var width = this.getBounds().width;
		var cloudTop = Math.floor(Math.random() * 0.8 * height) - (0.25 * height);
		
		var startLeft = Math.floor(width * (1 + (Math.random() * 0.25)));
		var endLeft = - inSender.getWidth();
		
		var actualDistance = startLeft - endLeft;
		var duration = (actualDistance / width * (CLOUD_SPEED_CONSTANT * inSender.getSpeedFactor()));
		
		inSender.setTop(cloudTop);
		inSender.animate(startLeft, endLeft, duration)
    }
});
