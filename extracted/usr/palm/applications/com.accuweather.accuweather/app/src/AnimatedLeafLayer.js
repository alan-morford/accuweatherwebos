var LEAF_FALLINGSPEED_CONSTANT = 9000;
var LEAF_DISTANCE_PARAMETER = 200;   			

enyo.kind({
    name: "AccuWeather.AnimatedLeafLayer",
    kind: enyo.Control,
    className: "animated-leaflayer",
	
    leaves: [],
    components: [
        {flex: 1},
        {kind: "Image", src: "images/animated/black_gradient.png", 
        	className: "animated-leaflayer-gradient", 
        	height: "30px", 
        	width: "100%"}
    ],
    
    create: function() {
    	this.inherited(arguments);
    	this.log(this.leaves.length);
    },
    
    stopRenderScene: function() {
    	for (var i=0 ; i < this.leaves.length; i++) {
    		this.leaves[i].stopAnimation();
    		this.leaves[i].destroy();
    		delete this.leaves[i];
    	}
    	
    	this.leaves = [];
    },
    
    renderScene: function(scene) {
    	this.stopRenderScene();
    	
    	this.viewBounds = this.getBounds();
    	
    	var numLeaves = Math.ceil(Math.random() * 10) + 30;

		this.log("creating " + numLeaves + " leaves.");
		this.leaves = [numLeaves];
		
		for (var i=0; i < numLeaves; i++) {
			this.leaves[i] = this.createComponent({kind: "AccuWeather.AnimatedLeaf", 
				className: "animated-leaf",
				onLeafAnimationComplete: "onLeafAnimationComplete",
				top: -20, 
				bottom: this.getBounds().height * 1.5,
				leafID: i,
				state: 0});
			this.leaves[i].render();
		}
		
		// start the leaf generator
		var leafTimeout = Math.random() * 3000;
		this.leafTimer = setTimeout(this.leafGenerator.bind(this), leafTimeout);
    },
    
    leafGenerator: function() {
    	var i;
    	
    	// first search for an idle leaf
    	for (i=0; i<this.leaves.length; i++) {
    		if (this.leaves[i].state == 0) {
    			this.leaves[i].state = 1;
    			this.dropLeaf(i);
    			break;
    		}
    	}
    	
    	// then reuse from the ones already fallen
    	if (i == this.leaves.length) {
    		var start = Math.floor(Math.random() * this.leaves.length);
    		
    		for (i=start; i<this.leaves.length; i++) {
        		if (this.leaves[i].state == 2) {
        			this.leaves[i].state = 1;
        			this.dropLeaf(i);
        			break;
        		}
        	}
    	}
    	
    	var leafTimeout = Math.random() * 5000;
    	this.leafTimer = setTimeout(this.leafGenerator.bind(this), leafTimeout);
    },
    
    
    dropLeaf: function(leafID) {
    	var left = Math.floor(Math.random() * (this.getBounds().width - 20));
		var durationFactor = Math.random() * .5 + 0.3;
		var duration = parseInt(this.getBounds().height / LEAF_DISTANCE_PARAMETER * 
			LEAF_FALLINGSPEED_CONSTANT * durationFactor);
		this.leaves[leafID].animate(left, duration);	
    },
    
    onLeafAnimationComplete: function(inSender, leafID) {
    	this.leaves[leafID].state = 2;
    }
});
