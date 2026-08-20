// Radar map view.
//
// Originally an interactive Google Maps canvas with a custom AccuWeather
// tile overlay (see the now-unused RadarOverlay.js/RadarOverlayModel.js/
// FrameListModel.js/OverlayOptionsModel.js) -- broken in this build because
// index_interactive.html/index_exhibition.html never actually call the
// loadGoogleMapsScript() they define. Replaced with the same fixed-image
// approach World Today (com.usatoday.webos) uses for its own "Map Radar"
// feature: a single static image, with Play swapping in an animated one.
// Real radar either way, just not pannable/zoomable -- see that project's
// worker/src/index.js (buildWeatherXml's isUS branch) for the original.
//
// US locations: NWS's own pre-rendered station-loop GIF
// (radar.weather.gov/ridge/standard/{region}_loop.gif) -- genuinely live,
// per-station real NEXRAD imagery. Via maps-proxy's us-radar-static.php/
// us-radar-gif.php, which resolve the region (ported from that worker's
// nearestRadarStation()/usRadarRegion()) AND fetch the actual image bytes,
// entirely server-side, relaying them to the device over plain HTTP.
//
// That relay is deliberate, not incidental: this device is never trusted to
// make its own HTTPS requests to third-party hosts anywhere else in this
// project either (OSM tiles, weather-data.asp, all proxied the same way,
// because the old WebKit TLS stack can't reach many modern HTTPS hosts
// directly -- see maps-proxy's README on tiles.php). An earlier version of
// this file built https://radar.weather.gov and https://wsrv.nl URLs
// directly and set them as the image src -- which on-device just showed
// solid black, almost certainly this exact problem.
//
// Everywhere else: maps-proxy's existing radar-map.php/radar-gif.php
// (OSM basemap + RainViewer overlay, already deployed and already used by
// World Today's own non-US path) -- lat/lon go straight in, no lookup step
// needed. Always been plain HTTP, unaffected by the above.
//
// A raw multi-frame GIF auto-plays the instant a browser loads it with no
// way to pause via HTML/CSS alone, so "static" here is a genuinely single-
// frame image, not a paused animated one -- us-radar-static.php/
// radar-map.php each do that server-side, one way or another.

var MAPS_PROXY_BASE = "http://maps.webosarchive.org";

enyo.kind({
	name: "AccuWeather.Maps",
  	kind: enyo.VFlexBox,
    className: "accuweather-body maps",
	// UI ELEMENTS
	components: [
        {kind: "ApplicationEvents", onWindowRotated: "onWindowRotated"},
        {kind: "HFlexBox", className: "maps-buttongroup", components: [
		    {name: "playpauseButton", kind: "Button", className: "enyo-button-dark playpause-button", onclick: "onPlayPauseClick", components: [
		        {name: "playpauseButtonImage", kind: "Image", src: "images/maps_video_play.png", className: "playpause-button-image"}
		    ]},
		    {name: "fullscreenButton", kind: "Button", className: "enyo-button-dark fullscreen-button", onclick: "onFullScreenClick", components: [
  		        {name: "fullscreenButtonImage", kind: "Image", src: "images/Fullscreen.png", className: "fullscreen-button-image"}
		    ]},
	        {flex: 1},
        ]},
        // A flexed HFlexBox (not the <img> itself -- see setImage()/
        // resizeImageToFit() below for why) that fills the remaining space
        // and centers the image within it via pack/align, since the image
        // is explicitly sized to its own aspect ratio and usually won't
        // exactly fill both container dimensions.
        {name: "mapContainer", className: "maps-map-canvas", kind: "HFlexBox", flex: 1, pack: "center", align: "center", components: [
            {name: "map", className: "maps-map-image", kind: "Image"}
        ]},
        {name: "loadingSpinner", kind: "Spinner", className: "radaroverlay-loading-spinner"}
    ],

    events: {
    	onFullScreenToggle: ""
	},

	published: {
		appModel: null, // required for all views
		fullScreen: false
	},

	// privates
	_isPlaying: false,
	_staticUrl: "",
	_animatedUrl: "",
	_naturalWidth: 0,
	_naturalHeight: 0,
	_loadGeneration: 0,
	_loadTimeoutId: null,
	_retryCount: 0,

	create: function() {
		this.inherited(arguments);
		this.$.loadingSpinner.hide();
	},

	fullScreenChanged: function(oldValue) {
		this.doFullScreenToggle(this.fullScreen);
		// doFullScreenToggle bubbles up to App_Interactive.onMapsFullScreenToggle,
		// which hides/shows sibling chrome (the current-conditions bar,
		// logo banner) -- that changes how much space mapContainer actually
		// has, but the browser hasn't necessarily reflowed yet by the time
		// this returns, so defer the re-fit a tick rather than measure a
		// stale size.
		var self = this;
		setTimeout(function() { self.resizeImageToFit(); }, 0);
	},

	onShow: function() {
		this.log("Maps.onShow fired");
		this.visible = true;
		// No real reason to see the small view first any more now that the
		// ad space below it (see App_Interactive.onMapsFullScreenToggle) is
		// reclaimed for fullscreen too -- go straight there every time.
		this.setFullScreen(true);
		this.refreshRadar();
	},

	onHide: function() {
		this.log("Maps.onHide fired");
		this.visible = false;
		this.setFullScreen(false);
	},

	onPlayPauseClick: function(inSender) {
		if (this._isPlaying) {
			this.showStatic();
		} else {
			this.showAnimated();
		}
	},

	showStatic: function() {
		this._isPlaying = false;
		this.$.playpauseButtonImage.setSrc("images/maps_video_play.png");
		this.$.playpauseButtonImage.removeClass("playpause-button-image-pause");
		if (this._staticUrl) this.setImage(this._staticUrl);
	},

	showAnimated: function() {
		this._isPlaying = true;
		this.$.playpauseButtonImage.setSrc("images/maps_video_pause.png");
		this.$.playpauseButtonImage.addClass("playpause-button-image-pause");
		if (this._animatedUrl) this.setImage(this._animatedUrl);
	},

	setImage: function(url, isRetry) {
		if (!isRetry) this._retryCount = 0;

		// Force a genuinely fresh request every time, even when called twice
		// in a row for the same lat/lon (e.g. once from a background
		// appModelChanged preload, then again from onShow when the user
		// actually taps the tab) -- browsers treat re-assigning an <img> to
		// its already-current src as a no-op (no new request, no onload),
		// so a tab that was preloaded while hidden never got a real
		// load/repaint once it became visible. Harmless server-side: the
		// backing endpoints only look at lat/lon, so this doesn't defeat
		// their own caching.
		var bustedUrl = url + (url.indexOf("?") >= 0 ? "&" : "?") + "cb=" + new Date().getTime();

		this.log("Maps.setImage: " + bustedUrl);
		this.$.loadingSpinner.show();
		this._naturalWidth = 0;
		this._naturalHeight = 0;

		var self = this;
		// Identifies this specific load attempt, so a stale timeout/retry
		// from an earlier setImage() call (e.g. the user already switched
		// locations again) can't fire after a newer one has taken over.
		var myGeneration = ++this._loadGeneration;
		var node = this.$.map.hasNode();

		var clearLoadTimeout = function() {
			if (self._loadTimeoutId) {
				clearTimeout(self._loadTimeoutId);
				self._loadTimeoutId = null;
			}
		};

		if (node) {
			node.onload = function() {
				clearLoadTimeout();
				if (myGeneration !== self._loadGeneration) return;
				self.log("Maps image onload: " + bustedUrl + " natural=" + node.naturalWidth + "x" + node.naturalHeight);
				// Real dimensions of whatever actually loaded -- non-US
				// radar-map.php/radar-gif.php are a fixed square, but the US
				// NWS imagery's aspect ratio varies per station/region, so
				// this can't be assumed ahead of time.
				self._naturalWidth = node.naturalWidth;
				self._naturalHeight = node.naturalHeight;
				self.resizeImageToFit();
				self.$.loadingSpinner.hide();
			};
			node.onerror = function() {
				clearLoadTimeout();
				if (myGeneration !== self._loadGeneration) return;
				self.log("Maps image onerror: " + bustedUrl);
				self.$.loadingSpinner.hide();
			};
		} else {
			this.log("Maps.setImage: hasNode() returned null, no onload/onerror wired");
		}
		this.$.map.setSrc(bustedUrl);

		// Confirmed on-device: some requests never fire onload OR onerror at
		// all (a stuck spinner for 50+ seconds, only resolved by switching
		// locations, which triggers a fresh setImage() with a new
		// generation). Rather than leave the spinner stuck indefinitely,
		// retry a couple of times on a timeout, then give up gracefully.
		clearLoadTimeout();
		this._loadTimeoutId = setTimeout(function() {
			if (myGeneration !== self._loadGeneration) return;
			if (self._retryCount >= 2) {
				self.log("Maps.setImage: gave up after " + self._retryCount + " retries: " + url);
				self.$.loadingSpinner.hide();
				return;
			}
			self._retryCount++;
			self.log("Maps.setImage: timed out waiting for load/error (retry " + self._retryCount + "): " + url);
			self.setImage(url, true);
		}, 15000);
	},

	// Sizes the already-loaded image to fit inside mapContainer's current
	// space while preserving its real aspect ratio (mapContainer centers it
	// via pack/align, so this doesn't need to compute any offset itself) --
	// re-run whenever the container's available space might have changed
	// out from under an already-loaded image, not just on a fresh load:
	// fullScreenChanged and onWindowRotated below.
	//
	// Sets real HTML width/height attributes rather than CSS, same reason
	// as setImage() above -- CSS sizing on a replaced element in this old
	// WebKit doesn't reliably apply (confirmed: a leftover width:100%/
	// height:100% rule silently overrode this exact attribute-based sizing
	// until it was removed from maps.css).
	resizeImageToFit: function() {
		var node = this.$.map.hasNode();
		var containerNode = this.$.mapContainer.hasNode();
		if (!node || !containerNode) return;
		if (!this._naturalWidth || !this._naturalHeight) return;

		var containerW = containerNode.clientWidth;
		var containerH = containerNode.clientHeight;
		if (containerW <= 0 || containerH <= 0) return;

		var scale = Math.min(containerW / this._naturalWidth, containerH / this._naturalHeight);
		var w = Math.round(this._naturalWidth * scale);
		var h = Math.round(this._naturalHeight * scale);
		this.log("Maps.resizeImageToFit: container=" + containerW + "x" + containerH +
			" natural=" + this._naturalWidth + "x" + this._naturalHeight + " -> " + w + "x" + h);
		node.width = w;
		node.height = h;
	},

	onFullScreenClick: function(inSender) {
		this.setFullScreen(!this.fullScreen);
	},

	onWindowRotated: function() {
		var self = this;
		setTimeout(function() { self.resizeImageToFit(); }, 0);
	},

	// -----------------------
	// appModelChanged() -
	//   app model update right before view is visible
	// -------------------------
	appModelChanged: function(oldAppModel) {
		this.log("Maps.appModelChanged fired, visible=" + this.visible);
		// Not gated on this.visible -- refresh whenever weather data updates
		// regardless of which tab is currently showing, so the image is
		// already ready by the time the user does tap the radar tab.
		this.refreshRadar();
	},

	refreshRadar: function() {
		this.log("Maps.refreshRadar called, appModel=" + (this.appModel ? "set" : "null"));
		if (null == this.appModel) return;

		this._isPlaying = false;
		this.$.playpauseButtonImage.setSrc("images/maps_video_play.png");
		this.$.playpauseButtonImage.removeClass("playpause-button-image-pause");
		this._staticUrl = "";
		this._animatedUrl = "";

		var local = this.appModel.getWeatherModel().getLocal();
		var lat = local[AccuWeather_WeatherModel_Keys.lat];
		var lon = local[AccuWeather_WeatherModel_Keys.lon];
		var isUS = local[AccuWeather_WeatherModel_Keys.countrycode] == "US";
		this.log("Maps.refreshRadar: lat=" + lat + " lon=" + lon + " isUS=" + isUS);

		if (isUS) {
			this._staticUrl = MAPS_PROXY_BASE + "/us-radar-static.php?lat=" + lat + "&lon=" + lon;
			this._animatedUrl = MAPS_PROXY_BASE + "/us-radar-gif.php?lat=" + lat + "&lon=" + lon;
		} else {
			this._staticUrl = MAPS_PROXY_BASE + "/radar-map.php?lat=" + lat + "&lon=" + lon;
			this._animatedUrl = MAPS_PROXY_BASE + "/radar-gif.php?lat=" + lat + "&lon=" + lon;
		}
		this.setImage(this._staticUrl);
	}
});
