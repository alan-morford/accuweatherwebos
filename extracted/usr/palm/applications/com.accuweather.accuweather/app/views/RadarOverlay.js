function RadarOverlayMapType(maxZoomLevel, getTileCallback, releaseTileCallback) {
	
	this.getTileCallback = getTileCallback;
	this.releaseTileCallback = releaseTileCallback;
	this.tileSize = new google.maps.Size(256, 256);
	this.isPng = true;
	this.opacity = 1;
	this.minZoom = 0;
	this.maxZoom = maxZoomLevel;
};

RadarOverlayMapType.prototype.releaseTile = function(node) {
	return this.releaseTileCallback(node);
};

RadarOverlayMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
	return this.getTileCallback(coord, zoom, ownerDocument);
};



enyo.kind({
    name: "AccuWeather.RadarOverlay",
    kind: enyo.Control,
    events: {
    	onOverlayTilesDownloaded: ""
    },
    published: {
    	appModel: null,
    	overlayOptionsModel: null
    },
    components: [
        {name: "radarOverlayModel", kind: "AccuWeather.RadarOverlayModel", 
			onDownloadTilesComplete: "onDownloadTilesComplete",
			onDownloadTilesFailed: "onDownloadTilesFailed"},
		{name: "loadingSpinner", kind: "Spinner", className: "radaroverlay-loading-spinner" }
	    	
    ],
    
    // privates
	_imageLoadingCount: 0,
	_currentFrame: 0,
	
    create: function() {
  		this.inherited(arguments);
  	}, 
  	
  	appModelChanged: function(oldAppModel) {
  		this.overlayOptionsModel = this.appModel.getOverlayOptionsModel();
  		
  		if (null == oldAppModel) {
  			// subscribe to events
  			this.appModel.subscribeToEvent(AppModelEvents.OVERLAYOPTIONS_TYPECHANGED, this.onMapOptionsOverlayTypeChanged.bind(this));
  			this.appModel.subscribeToEvent(AppModelEvents.OVERLAYOPTIONS_OPACITYCHANGED, this.onMapOptionsOverlayOpacityChanged.bind(this));
  		}
  		
  	},
  	
  	initWithMap: function(map) {
  		this.map = map;
  		this.$.loadingSpinner.hide();
  	},
  	
  	initiateTileDownload: function() {
  	
  		this.map.overlayMapTypes.clear();
  		
  		var local = this.appModel.getWeatherModel().getLocal();
//  		if (local[AccuWeather_WeatherModel_Keys.countrycode] != "US" ) {
//  			this.$.radarOverlayModel.downloadTiles(OverlayTypeSatelliteWorld);
//  		} else {
  			this.$.radarOverlayModel.downloadTiles(this.overlayOptionsModel.getOverlayType());
//  		}
  	},
  	
  	getRadarOverlayModel: function() {
  		return this.$.radarOverlayModel;
  	},
  	
  	animationStep: function() {
		
  		var frameTimes = this.$.radarOverlayModel.getFrameList().getFrameTimes();
  		var numFrames = frameTimes.length;
  		var tiles = this.$.radarOverlayModel.getTiles();
  		
		var nextFrame = (this._currentFrame + 1) % numFrames;
		for (var item_zoom in tiles) {
			for (var item_x in tiles[item_zoom]) {
				for (var item_y in tiles[item_zoom][item_x]) {
					tiles[item_zoom][item_x][item_y].childNodes[this._currentFrame].style.visibility="hidden";
					tiles[item_zoom][item_x][item_y].childNodes[nextFrame].style.visibility="visible";
				}
			}
		}
		
		this._currentFrame = nextFrame;
		var timeText = frameTimes[this._currentFrame];
		
		return timeText; 
  	},
 
  	// googleMaps callbacks
	// -----------------------
  	releaseTile: function(node) {
  		var tiles = this.$.radarOverlayModel.getTiles();
  		var substrs = node.getAttribute("name").split("_");
  		
  		delete tiles[substrs[0]][substrs[1]][substrs[2]];
  		
  		var found = false;
  		for (var item in tiles[substrs[0]][substrs[1]]) { found = true; break; }
  		if (!found) {delete tiles[substrs[0]][substrs[1]]; }
  		
  		found = false;
  		for (var item in tiles[substrs[0]]) { found = true; break; }
  		if (!found) {delete tiles[substrs[0]];}
  		
  	},
  	
	getTile: function(coordinate, zoom, ownerDocument) {
		
		var numTiles = Math.pow(2, zoom);
		var frameList = this.$.radarOverlayModel.getFrameList();
		var tiles = this.$.radarOverlayModel.getTiles();
		
		var coord ={};
		coord.x = coordinate.x % numTiles;
		if (coord.x < 0) { 
			coord.x += numTiles; 
		}
		
		coord.y = coordinate.y % numTiles;  
		if (coord.y < 0) { 
			coord.y += numTiles; 
		}
		
		//this.log("getTile() for coordinate: " + coordinate + " zoom: " + zoom + " ==  coord: " + enyo.json.stringify(coord) );
		
		if (frameList.getFrameTimes().length <=0) { this.error("framelist is empty!!"); return; }
		
		if (tiles[zoom] == null) { tiles[zoom] = {}; }
		if (tiles[zoom][coordinate.x] == null) { tiles[zoom][coordinate.x] = {}; }
		if (tiles[zoom][coordinate.x][coordinate.y] == null) {
		
			//this.log("creating new div");
			
			this.$.loadingSpinner.show();
	  		
			var parentDiv = ownerDocument.createElement('DIV');
			parentDiv.style.width = "256px";
			parentDiv.style.height = "256px";
			parentDiv.style.position = "relative";
			parentDiv.style.opacity = this.overlayOptionsModel.getOverlayOpacity();
			parentDiv.setAttribute("name", zoom + "_" + coordinate.x + "_" + coordinate.y);
			
			for (var i=0; i < frameList.getFrameTimes().length; i++) {
	            var div = ownerDocument.createElement('DIV');
	            div.style.width = "256px";
	            div.style.height = "256px";
	            div.style.position = "absolute";
	            div.style.top = "0px";
	            div.style.left = "0px";
	            
	            var url = frameList.getTileDataLocation() + "/" 
	            	+ frameList.getFrameTimes()[i] + "/" + zoom 
	            	+ "/" + coord.x + "_" + coord.y + ".png";
	            var img = new Image();
	            img.src = url;
	            img.onload = this.onImageLoadComplete.bind(this);
		  		
	            div.appendChild(img);
	            
            	div.style.visibility = "hidden";
            	parentDiv.appendChild(div);
            
            	this._imageLoadingCount++;
				
			}
			
			parentDiv.childNodes[this._currentFrame].style.visibility = "visible";
	  		
			tiles[zoom][coordinate.x][coordinate.y] = parentDiv;
			return parentDiv;
			
		} else {
			//this.log("returning cached div");
			return tiles[zoom][coordinate.x][coordinate.y];
		}
		
	},
	
	onImageLoadComplete: function() {
		if (--this._imageLoadingCount <= 0) {
			this.$.loadingSpinner.hide();
		}
	},
	
  	onMapOptionsOverlayTypeChanged: function(oldValue) {
  		this.initiateTileDownload();
  	},
  	
  	onMapOptionsOverlayOpacityChanged: function(oldValue) {
		var tiles = this.$.radarOverlayModel.getTiles();
  		
  		for (var item_zoom in tiles) {
			for (var item_x in tiles[item_zoom]) {
				for (var item_y in tiles[item_zoom][item_x]) {
					tiles[item_zoom][item_x][item_y].style.opacity = 
						this.overlayOptionsModel.getOverlayOpacity();
				}
			}
		}
  	}, 
  	
  	onDownloadTilesComplete: function() {
  		this.log("download of radar tiles complete");
  		
  		var frameList = this.$.radarOverlayModel.getFrameList();
  		this._currentFrame = frameList.getFrameCount() - 1;
  		this.map.overlayMapTypes.push(new RadarOverlayMapType(frameList.getMaxZoomLevel(), 
  				this.getTile.bind(this), this.releaseTile.bind(this)));
  	
  		this.doOverlayTilesDownloaded();
  	},
	
  	onDownloadTilesFailed: function() {
  		this.error("download of radar overlay tiles failed");
  	}
});