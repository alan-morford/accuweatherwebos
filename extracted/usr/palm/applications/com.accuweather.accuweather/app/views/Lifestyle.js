enyo.kind({
	name: "AccuWeather.Lifestyle",
	kind: enyo.VFlexBox,
	className: "accuweather-body lifestyle",
	
	// UI ELEMENTS
	components: [
        {kind: "ApplicationEvents", onWindowRotated: "onWindowRotated", onLoad: "onLoad"},
        {name: "gradientImage", kind: "Image", src: "images/black_gradient.png", className:"lifestyle-gradientimage"},
        {kind: "HFlexBox", flex: 1, components: [
	        {kind: "enyo.Scroller", flex: 1, className: "lifestyle-column", autoHorizontal: false, horizontal: false, components: [
		        {name: "virtualRepeaterLeft", kind: "VirtualRepeater", onSetupRow: "onSetupRowLeft", components: [ 
					{kind: "Item", layoutKind: "HFlexLayout", className: "lifestyle-rowitem", components: [
		             	{kind: "HFlexBox", className: "lifestyle-rowitem-left", components: [
		                     {kind: "Control", flex: 1},
		                     {kind: "VFlexBox", style: "position: relative; width: 40px ", components: [
		                             {name: "imageLeft", kind: "Image", className: "lifestyle-rowitem-image"}, 
		                             {name: "imageLeftBackground", kind: "Image", className: "lifestyle-rowitem-imagebackground"}
		                     ]},
		                     {kind: "Control", flex: 1}
		                ]},
		             	{kind: "VFlexBox", className: "lifestyle-rowitem-right", components: [
		                     {name: "traitTitleLeft", kind:"Control", className: "lifestyle-trait-title"},
		                     {name: "traitValueLeft", kind:"Control", className: "lifestyle-trait-value"}
		                ]}
		            ]}
		        ]}
	        ]},
	        {kind: "enyo.Scroller", flex: 1, className: "lifestyle-column", autoHorizontal: false, horizontal: false, components: [
	   	        {name: "virtualRepeaterCenter", kind: "VirtualRepeater", onSetupRow: "onSetupRowCenter", components: [ 
	   				{kind: "Item", layoutKind: "HFlexLayout", className: "lifestyle-rowitem", components: [
	   	             	{kind: "HFlexBox", className: "lifestyle-rowitem-left", components: [
	   	                     {kind: "Control", flex: 1},
	   	                     {kind: "VFlexBox", style: "position: relative; width: 40px ", components: [
	   	                             {name: "imageCenter", kind: "Image", className: "lifestyle-rowitem-image"}, 
	   	                             {name: "imageCenterBackground", kind: "Image", className: "lifestyle-rowitem-imagebackground"}
	   	                     ]},
	   	                     {kind: "Control", flex: 1}
	   	                ]},
	   	             	{kind: "VFlexBox", className: "lifestyle-rowitem-right", components: [
	   	                     {name: "traitTitleCenter", kind:"Control", className: "lifestyle-trait-title"},
	   	                     {name: "traitValueCenter", kind:"Control", className: "lifestyle-trait-value"}
	   	                ]}
	   	            ]}
	   	        ]}
	         ]},
	         {kind: "enyo.Scroller", flex: 1, className: "lifestyle-column", autoHorizontal: false, horizontal: false, components: [
	   	        {name: "virtualRepeaterRight", kind: "VirtualRepeater", onSetupRow: "onSetupRowRight", components: [ 
	   				{kind: "Item", layoutKind: "HFlexLayout", className: "lifestyle-rowitem", components: [
	   	             	{kind: "HFlexBox", className: "lifestyle-rowitem-left", components: [
	   	                     {flex: 1},
	   	                     {kind: "VFlexBox", className: "lifestyle-rowitem-left-inner", components: [
	   	                             {name: "imageRight", kind: "Image", className: "lifestyle-rowitem-image"}, 
	   	                             {name: "imageRightBackground", kind: "Image", className: "lifestyle-rowitem-imagebackground"}
	   	                     ]},
	   	                     {flex: 1}
	   	                ]},
	   	             	{kind: "VFlexBox", className: "lifestyle-rowitem-right", components: [
	   	                     {name: "traitTitleRight", kind:"Control", className: "lifestyle-trait-title"},
	   	                     {name: "traitValueRight", kind:"Control", className: "lifestyle-trait-value"}
	   	                ]}
	   	            ]}
	   	        ]}
	        ]}
        ]}
	],	               
	published: {
		appModel: null // required for all views
	},
	  
	create: function() {
		this.log("created");
		this.inherited(arguments);
	},

	onShow: function() { 
		this.log("on show"); 
		this.visible = true;
		
		if (this.didAppModelChange) {
			this.$.virtualRepeaterLeft.render();
			this.$.virtualRepeaterCenter.render();
			this.$.virtualRepeaterRight.render();
			
			this.didAppModelChange = false;
		}
	},
	
	onHide: function() { 
		this.log("on hide"); 
		this.visible = false;
	},
	
	appModelChanged: function(oldAppModel) {
		
		if (this.visible) {
			this.$.virtualRepeaterLeft.render();
			this.$.virtualRepeaterCenter.render();
			this.$.virtualRepeaterRight.render();
		} else {
			this.didAppModelChange = true;
		}
	},
		
	onSetupRowLeft: function(inSender, inIndex) {
		
		if (null == this.appModel) {
			return false;
		}
		
		var lifestyleModel = this.appModel.getLifestyleModel();
		var indices = lifestyleModel.getLifestyleTraits();
		var sizeLeft = Math.floor(indices.length / 3);
		var offset = 0;
		
		if (inIndex >= 0 && inIndex < sizeLeft) {
			
			var imageSrc = "images/lifestyle/" + indices[inIndex+offset].getName() + ".png";
			var backgroundImageSrc = "images/lifestyle/" + indices[inIndex+offset].getDisplayColorIndex() + ".png";
			
			this.$.imageLeft.setSrc(imageSrc);
			this.$.imageLeftBackground.setSrc(backgroundImageSrc);
			this.$.traitTitleLeft.setContent(indices[inIndex+offset].getDisplayName());
			this.$.traitValueLeft.setContent(indices[inIndex+offset].getDisplayValue());
			return true;
		}
		return false;
	},
	
	onSetupRowCenter: function(inSender, inIndex) {
		
		if (null == this.appModel) {
			return false;
		}
		
		var lifestyleModel = this.appModel.getLifestyleModel();
		var indices = lifestyleModel.getLifestyleTraits();
		var sizeLeft = Math.floor(indices.length / 3);
		var size = Math.floor((indices.length - sizeLeft) / 2);
		var offset = sizeLeft;

		if (inIndex >= 0 && inIndex < size) {
			var imageSrc = "images/lifestyle/" + indices[inIndex+offset].getName() + ".png";
			var backgroundImageSrc = "images/lifestyle/" + indices[inIndex+offset].getDisplayColorIndex() + ".png";
			
			this.$.imageCenter.setSrc(imageSrc);
			this.$.imageCenterBackground.setSrc(backgroundImageSrc);
			this.$.traitTitleCenter.setContent(indices[inIndex+offset].getDisplayName());
			this.$.traitValueCenter.setContent(indices[inIndex+offset].getDisplayValue());
			
			return true;
		}
		return false;
		
	},
	
	onSetupRowRight: function(inSender, inIndex) {
		
		if (null == this.appModel) {
			return false;
		}
		
		var lifestyleModel = this.appModel.getLifestyleModel();
		var indices = lifestyleModel.getLifestyleTraits();
		
		var sizeLeft = Math.floor(indices.length / 3);
		var sizeCenter = Math.floor((indices.length - sizeLeft) / 2);
		var size = indices.length - sizeLeft - sizeCenter;
		var offset = sizeLeft + sizeCenter;
		
		if (inIndex >= 0 && inIndex < size) {
			
			var imageSrc = "images/lifestyle/" + indices[inIndex+offset].getName() + ".png";
			var backgroundImageSrc = "images/lifestyle/" + indices[inIndex+offset].getDisplayColorIndex() + ".png";
			
			this.$.imageRight.setSrc(imageSrc);
			this.$.imageRightBackground.setSrc(backgroundImageSrc);
			this.$.traitTitleRight.setContent(indices[inIndex+offset].getDisplayName());
			this.$.traitValueRight.setContent(indices[inIndex+offset].getDisplayValue());
			
			return true;
		}
		return false;
		
	}
});


