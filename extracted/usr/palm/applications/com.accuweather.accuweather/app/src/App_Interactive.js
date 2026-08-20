var termsText = $LL("By using this application you agree to the AccuWeather.com Terms & Conditions (in English) which can be found on our web site at: <br><br> <a href='http://www.accuweather.com/m/EULA.aspx'>http://www.accuweather.com/m/EULA.aspx</a><br><br> and AccuWeather's Privacy Statement (in English) which can be found at:<br><br> <a href='http://www.accuweather.com/m/Legal/Privacy.aspx'>http://www.accuweather.com/m/Legal/Privacy.aspx</a>. <br><br>");
var aboutText = $LL("AccuWeather, established in 1962, is the World's Weather Authority. <br><br>We provide local forecasts for everywhere in the United States and over two million locations worldwide. We also provide our products and services to more than 175,000 paying customers in media, business, government and institutions.<br><br>Our headquarters in State College, PA, is home to the greatest number of forecast meteorologists in one location anywhere in the world. <br><br>");
// Not $LL()-wrapped, unlike termsText/aboutText above -- $LL() is a
// translation-table LOOKUP keyed by the exact literal string passed in
// (see Localization.js: __ac_stringPool[stringId]), not a passthrough.
// Editing this string to swap the support email broke that exact-match
// lookup against app/langs/*.js's still-unedited keys, silently returning
// undefined and rendering the whole dialog body as blank text (confirmed
// live: only this body vanished, not the "Support"/button labels, which
// are separate, still-matching $LL() calls). Since this text is now
// deliberately different from the original shipped/translated copy
// anyway, assigning it directly sidesteps needing to update the matching
// key AND value in all 6 (obfuscated, \uXXXX-escaped) locale files just to
// keep the lookup working -- at the cost of this one string no longer
// being localized (still English for every language).
var supportText = 'If you are experiencing technical difficulties, please send an email to:<br><br> alanmorford@gmail.com <br><br>with the subject "AccuWeather for HP Touchpad".<br><br>';

var DATA_REFRESH_INTERVAL = 1000*60*15; // 15 minutes

enyo.kind({
	name: "AccuWeather.App_Interactive",
	kind: enyo.HFlexBox,
	className: "accuweather-body accuweather-frame",
	components: 
	[
	    {kind: "ApplicationEvents", 
    		onWindowRotated: "onWindowRotated",
    		onWindowActivated: "onWindowActivated",
    		onWindowDeactivated: "onWindowDeactivated",
    		onLoad: "onLoad",
    		onBack: "onBack",
   			onWindowParamsChange: "onWindowParamsChanged"
		},
		{kind: "AppMenu", components: [
			{caption: $LL("Support"), onclick: "onMenuSupportClick"},
			{caption: $LL("Terms & Conditions"), onclick: "onMenuTermsClick"},
			{caption: $LL("About AccuWeather.com"), onclick: "onMenuAboutClick"},
		]},

		{name: "termsDialog", kind: "AccuWeather.TermsDialog"},
		{name: "aboutDialog", kind: "AccuWeather.AboutDialog"},
		{name: "supportDialog", kind: "AccuWeather.SupportDialog"},

// uncomment this and notifyOnWeatherAlerts() to enable notifications
//		{name: "dashboard", kind:"Dashboard", onMessageTap: "onDashboardMessageTap", onIconTap: "onDashboardIconTap"},
		{name: "appModel", kind: "AccuWeather.AppModel", 
	    	onCurrentLocationIndexUpdated: "onCurrentLocationIndexUpdated", 
	    	onLocationsUpdated: "onLocationsUpdated",
	    	onWeatherModelUpdated: "onWeatherModelUpdated",
	    	onWeatherModelDownloadFailed: "onWeatherModelDownloadFailed",
	    	onUnitsUpdated: "onUnitsUpdated"},
    	{name: "internetConnectionErrorDialog", kind: "ModalDialog", 
        	content: $LL("Internet Connection Error"), className: "app-nointernetdlg-title", 
        	components: [
	            {kind: "Image", src: "images/warning.png", className: "app-nointernetdlg-image"},
	            {className: "app-nointernetdlg-text", content: $LL("No internet connection error")},
	            {kind: "Button", caption: $LL("Retry"), onclick: "onInternetConnectionErrorRetryClick"}
        ]},
        {name: "firstRunTermsDialog", kind: "ModalDialog", className: "settings-termsdialog", components: [
   			{className: "enyo-item enyo-first", style: "padding: 12px", content: $LL("Terms & Conditions")},
   			{className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px;", allowHtml: true, content: termsText},
   			{kind: "Button", caption: $LL("OK"), className: "enyo-button-affirmative", onclick: "onTermsCloseClick"}
   		]},
        {name: "scrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [ {kind: "SpinnerLarge"}] },
        {name: "locSearch", kind: "AccuWeather.LocationSearch", onLocationSearchComplete: "onLocationSearchComplete", onLocationSearchCancel: "onLocationSearchComplete"},
    	{kind: "HFlexBox", flex: 1, components: [
            {name: "verticalCommandToolbar", kind: "AccuWeather.CommandToolbar", showing: false, orientation: 1, selected: 0, onCommandSelected: "onCmdMenuClick", onRefreshSelected: "onRefreshButtonClick", onGPSSelected: "onGPSButtonClick" },
	        {kind: "VFlexBox", flex: 1, components: [
		        {name: "current", kind: "AccuWeather.Current"},
		        {name: "logoBanner", kind: "HFlexBox", className: "accuweather-logobanner", components: [ 
		            {flex: 1}, {kind: "Image", src: "images/accuweather_logotype_bw.png", className: "accuweather-logobanner-image"}, {flex: 1}
		        ]},
		        {name: "pane", kind: "Pane", flex: 1, onSelectView: "onViewSelected", components: [ 
	                {name: "forecast", className: "enyo-bg-dark", kind: "AccuWeather.Forecast"},
		    	 	{name: "hourly", className: "enyo-bg", kind: "AccuWeather.Hourly"},
		    	 	{name: "maps", className: "enyo-bg", kind: "AccuWeather.Maps", onFullScreenToggle: "onSectionFullScreenToggle"},
		    	 	{name: "news", className: "enyo-bg", kind: "AccuWeather.News", onFullScreenToggle: "onSectionFullScreenToggle"},
		    	 	{name: "lifestyle", className: "enyo-bg", kind: "AccuWeather.Lifestyle"},
		    	 	{name: "settings", className: "enyo-bg", kind: "AccuWeather.Settings", onAddNewLocation: "onSettingsAddNewLocation"},
		    	 	{name: "video", className: "enyo-bg", kind: "AccuWeather.Video"},
//		    	 	{name: "hurricane", className: "enyo-bg", kind: "AccuWeather.Hurricane"} 
	    	 	]},
		    	// The ad network AdView served has been dead for years -- it
		    	// just reserved a fixed-height empty strip below the pane on
		    	// every tab. Kept in the tree (harmless, unused) rather than
		    	// deleted, in case ads are ever worth reviving here.
		    	{name: "ads", kind: "AccuWeather.AdView", showing: false},
		    	{name: "horizontalCommandToolbar", kind: "AccuWeather.CommandToolbar", showing: false, orientation: 0, selected: 0, onCommandSelected: "onCmdMenuClick", onRefreshSelected: "onRefreshButtonClick", onGPSSelected: "onGPSButtonClick" },
	    	]}
        ]},
		{name: "updateDialog", kind: "AccuWeather.UpdateDialog", onUpdateConfirmed: "downloadUpdate"},
		{name: "updateCheck", kind: "WebService", url: "https://api.github.com/repos/alan-morford/accuweatherwebos/releases/latest", handleAs: "json", onSuccess: "onUpdateCheckSuccess", onFailure: "onUpdateCheckFail"},
		{name: "openUpdateApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
    ],

	published: {
//		rootWindow: false,
		startLocationIndex: 0,
		searchTerm: null,
		activateEventCount: 0,
	},
	    
    // =====================
    // create()
    // =====================
    create: function() 
    {
    	this.log();
    	this.inherited(arguments);
    	this.redrawUI();
		this.checkForUpdate();
    },

	// Runs once per app create() (this app has no separate "cold start vs.
	// switched back into" lifecycle event the way World Today's ready() is
	// scoped) -- checks this app's own GitHub repo (not the old App Museum
	// II listing this app used to check, which was for the original
	// unmodified commercial AccuWeather release, not this patched fork, so
	// it could never actually surface a real update here) for a release
	// newer than the installed appinfo.json version. Silent by design if
	// the check fails (offline, GitHub API hiccup, or -- currently -- no
	// releases published yet): a background hiccup shouldn't show an error
	// or interrupt app launch, it just means no update popup this time.
	checkForUpdate: function() {
		this.$.updateCheck.call({});
	},

	onUpdateCheckFail: function() {},

	onUpdateCheckSuccess: function(inSender, inResponse) {
		if (!inResponse || !inResponse.tag_name) {
			return;
		}

		var remoteVersion = inResponse.tag_name.replace(/^v/i, "");
		var currentVersion = enyo.fetchAppInfo().version;
		if (!this.isNewerVersion(remoteVersion, currentVersion)) {
			return;
		}

		var ipkAsset = null;
		var assets = inResponse.assets || [];
		for (var i = 0; i < assets.length; i++) {
			if (/\.ipk$/i.test(assets[i].name || "")) {
				ipkAsset = assets[i];
				break;
			}
		}
		// No .ipk asset attached to the release (e.g. a docs-only tag) --
		// nothing for "Update Now" to actually install, so don't prompt.
		if (!ipkAsset) {
			return;
		}

		this.pendingUpdateUrl = ipkAsset.browser_download_url;
		this.$.updateDialog.showRelease(
			"Version " + remoteVersion,
			this.formatChangelog(inResponse.body || "")
		);
	},

	// Numeric-segment compare so "1.10.0" correctly beats "1.9.0" -- a plain
	// string compare would get that backwards.
	isNewerVersion: function(remote, current) {
		var r = String(remote).split(".");
		var c = String(current).split(".");
		var len = Math.max(r.length, c.length);
		for (var i = 0; i < len; i++) {
			var rv = parseInt(r[i], 10) || 0;
			var cv = parseInt(c[i], 10) || 0;
			if (rv > cv) return true;
			if (rv < cv) return false;
		}
		return false;
	},

	// GitHub release bodies are GitHub-flavored markdown; this app has no
	// markdown renderer, but allowHtml:true content controls are already
	// used elsewhere (e.g. News tab articles), so a small, safe subset
	// covers the plain "## heading" / "- bullet" / "**bold**" style release
	// notes are actually written in.
	formatChangelog: function(markdown) {
		var html = String(markdown)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		html = html
			.replace(/\r\n/g, "\n")
			.replace(/^##+\s*(.*)$/gm, "<strong>$1</strong>")
			.replace(/^-\s+(.*)$/gm, "&bull;&nbsp;$1")
			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replace(/\n/g, "<br>");

		return html;
	},

	downloadUpdate: function() {
		if (!this.pendingUpdateUrl) {
			return;
		}

		// Hand the actual download+install off to Preware rather than the
		// system browser -- contract confirmed working in the EMU7800
		// TouchPad revival (see update.MD) and already used this same way
		// by World Today: applicationManager "open" with type:"install"/
		// file:<url> tells Preware to fetch and install that .ipk directly.
		this.$.openUpdateApp.call({id: "org.webosinternals.preware", params: {type: "install", file: this.pendingUpdateUrl}});

		// Preware is about to overwrite this app's own .ipk on disk, so it
		// can't safely keep running. Give webOS a couple seconds to bring
		// Preware to the foreground (same delay World Today/EMU7800 use),
		// then close this app's own card so there's no stale running
		// instance of the version about to be replaced.
		setTimeout(function() {
			window.close();
		}, 2000);
	},
    
    onWindowRotated: function(inSender) {
    	this.redrawUI();
    },
    
    onWindowActivated: function(inSender) {
    	this.log("onWindowActivated");
    	this.$.pane.getView().onShow();
    	
    	if (this.searchTerm != null && this.searchTerm != "") {
    		// show the location search dialog
    		this.$.locSearch.setAppModel(this.$.appModel);    			
    		this.$.locSearch.startLocationSearchBySearchTerm(this.searchTerm);
    		this.searchTerm = null;
    	}

		// if it's not first time window has been activated
		// refresh data
		if (++this.activateEventCount > 0) {
			this.showScrim(true);
			this.$.appModel.downloadWeatherForCurrentLocation();

			if (this.dataRefreshTimer) {
				clearInterval(this.dataRefreshTimer);
			}
			this.dataRefreshTimer = setInterval(this.onDataRefreshTimer.bind(this), DATA_REFRESH_INTERVAL);
		}
    },
    
    onWindowDeactivated: function(inSender) {
    	this.$.pane.getView().onHide();
    },

    onWindowParamsChanged: function(inSender, inParams) {
    	this.log();
    	if (enyo.windowParams.searchTerm != null) {
    		this.searchTerm = enyo.windowParams.searchTerm;
    	}
    },

    onLoad: function(inSender) {

    	// start initial loading scrim
    	this.log();
    	this.showScrim(true, true);
    	
		var locationsModel = this.$.appModel.getLocationModel();
/*
		if (!this.getRootWindow()) {
			// this is a card window, just change the location to the one passed from root window
			locationsModel.setCurrentLocationByIndex(parseInt(this.getStartLocationIndex()), false);
		} else {
			// name window by location id
			var windows = enyo.windows.getWindows();
			for (var i in windows) {
				console.log("**** Window name: "+ i);
			}
			//this.log(enyo.windows.getWindows());
			
			enyo.windows.renameWindow(enyo.windows.getRootWindow(), locationsModel.getCurrentLocation().location);
		}
*/
		this.firstRunDlgAccepted = enyo.getCookie("AccuWeatherApp_FirstRunDialogAccepted");
		if (this.firstRunDlgAccepted == null) {
			this.$.firstRunTermsDialog.openAtCenter();
		} else {
			this.onSecondaryLoad();
		}
	},

	onSecondaryLoad: function() {
		// initialize google maps
    	this.log("initializing google maps...");
    	loadGoogleMapsScript();
    	this.onFinishLoad();
	},
	
	onGoogleMapsLoad: function() {
		
		this.log();
		// notify all views
		var viewList = this.$.pane.getViewList();
		for (var i = 0; i < viewList.length; i++) 
		{
			if (viewList[i].onGoogleMapsLoad != null) {
				viewList[i].onGoogleMapsLoad();
			}
		}
		
	},	
	
	onFinishLoad: function() {
    	
		// finalize UI
		// -----------
		this.log("onFinishLoad");
		this.$.pane.selectViewByName("forecast");
    	
    	// set revolving timer to refresh data
    	//------------------------------------
    	if (this.dataRefreshTimer) {
    		clearInterval(this.dataRefreshTimer);
    	}
    	this.dataRefreshTimer = setInterval(this.onDataRefreshTimer.bind(this), DATA_REFRESH_INTERVAL);

    	// handle search term
    	// ------------------
    	if (this.searchTerm != null && this.searchTerm != "") {
    		// show the location search dialog
    		this.showScrim(false);
    		this.$.locSearch.setAppModel(this.$.appModel);    			
    		this.$.locSearch.startLocationSearchBySearchTerm(this.searchTerm);
    		this.searchTerm = null;
    	} else {
    		this.$.appModel.downloadWeatherForCurrentLocation();
    	}
	},
	
	onTermsCloseClick: function() {
		enyo.setCookie("AccuWeatherApp_FirstRunDialogAccepted", "1");
		this.$.firstRunTermsDialog.close();
		this.onSecondaryLoad();
	},
	
    onBack: function(inSender) {
    	this.log("back pressed");
	},
	
	redrawUI: function() {
    	if (this.getParent().getBounds().width > this.getParent().getBounds().height) {
    		this.$.verticalCommandToolbar.show();
    		this.$.horizontalCommandToolbar.hide();
    	} else {
    		this.$.verticalCommandToolbar.hide();
    		this.$.horizontalCommandToolbar.show();
    	}
	},
	
	onMenuAboutClick: function()
	{
		this.$.aboutDialog.open();
	},

	onMenuTermsClick: function()
	{
		this.$.termsDialog.open();
	},

	onMenuSupportClick: function()
	{
		this.$.supportDialog.open();
	},

	
    onCmdMenuClick: function(inSender, viewName)
    {
    	this.$.pane.selectViewByName(viewName);
    	
    	// make sure toolbars remain in sync
    	var selected = inSender.getSelected();
    	this.$.verticalCommandToolbar.setSelected(selected);
    	this.$.horizontalCommandToolbar.setSelected(selected);
    },

    onSettingsAddNewLocation: function() {
    	this.$.current.getLocation().doAddLocation();
    },
    onGPSButtonClick: function() {
    	this.$.current.getLocation().doGPSSearch();
    },
    
    onRefreshButtonClick: function() {
    	this.showScrim(true);
    	this.$.appModel.downloadWeatherForCurrentLocation();
    },
    
    onDataRefreshTimer: function() {
    	this.showScrim(true);
    	this.$.appModel.downloadWeatherForCurrentLocation();
    },
    
    // =====================
    // onViewSelected() - 
    //   a view swap is occurring.
    // =====================
    onViewSelected: function(inSender, inView, inPreviousView)
    {
    	this.log("view selected: " + inView.name);

    	// Outgoing view's onHide() runs BEFORE the incoming view's onShow()
    	// now (was the other way around) -- both Maps and News's article
    	// reader call setFullScreen(false)/(true) from onHide()/onShow(),
    	// which bubbles up to onSectionFullScreenToggle below and toggles
    	// the same shared header chrome. With onShow() first, switching
    	// straight from a fullscreen News article to Radar hid the chrome
    	// for Maps, then immediately un-hid it again when News's own
    	// onHide() ran its fullscreen(false) cleanup a moment later --
    	// confirmed live: Radar's container measured itself against that
    	// briefly-correct-then-reverted space and rendered as a tiny
    	// centered square. Tearing the old view down first, then building
    	// the new one, means whichever view is now actually showing always
    	// gets the last word on shared state like this.
    	if(null != inPreviousView) {
    		if (inPreviousView.onHide != null) {
    			inPreviousView.onHide();
        	}
    	}

    	if (inView.onShow != null) {
    		inView.onShow();
    	}
    },
    
	// ==============================
	// Model update callbacks
	// ==============================
	
	onLocationsUpdated: function(locations)
    {
		this.updateAppModelClients();
    },
	
    // =====================
    // onCurrentLocationIndexUpdated()
	//   location changed, system about to do
	//   a new download of weather, show scrim.
    // =====================
    onCurrentLocationIndexUpdated: function()
    {
    	this.showScrim(true, true);
    	this.updateAppModelClients();
    },
    
    // =====================
    // onWeatherModelUpdate() - weatherModel callback: weather model updated
    // =====================
    onWeatherModelUpdated: function(weatherModel)
    {
    	this.showScrim(false);
    	this.updateAppModelClients();
    	this.notifyOnWeatherAlerts();
    },
    
    onWeatherModelDownloadFailed: function() {
    	this.log();
    	this.showScrim(false);
    	this.$.internetConnectionErrorDialog.openAtCenter();
    },
    
    onInternetConnectionErrorRetryClick: function() {
    	this.$.internetConnectionErrorDialog.close();
    	this.showScrim(true, true);
    	this.$.appModel.downloadWeatherForCurrentLocation();
    },
    
    onUnitsUpdated: function(inSender, unitsChangedType) {
    	
    	if(this.$.current.onUnitsModelChanged != null) {
    		this.$.current.onUnitsModelChanged();
		}
    	
    	// notify all views
    	var viewList = this.$.pane.getViewList();
    	for (var i = 0; i < viewList.length; i++) 
    	{
    		if(viewList[i].onUnitsModelChanged != null) {
    			viewList[i].onUnitsModelChanged();
    		}
    	}
    },
    
    showScrim: function(isVisible, isSpinner) 
    {
		this.$.scrim.setShowing(isVisible);
		if (undefined == isSpinner || true == isSpinner) 
		{
			this.$.spinnerLarge.setShowing(true);
		} else {
			this.$.spinnerLarge.setShowing(false);
		}
	},
	
	updateAppModelClients: function() {
		// notify current conditions control
    	this.$.current.setAppModel(this.$.appModel);
		this.$.ads.setAppModel(this.$.appModel);
    	
    	// notify all views
    	var viewList = this.$.pane.getViewList();
    	for (var i = 0; i < viewList.length; i++) {
    		viewList[i].setAppModel(this.$.appModel);
    	}
	},
	
	// Shared by both Maps (radar) and News (article reading view) -- each
	// bubbles its own onFullScreenToggle up to this same handler. ads is now
	// permanently showing:false (see its declaration above), so there's no
	// longer anything to toggle for it here.
	onSectionFullScreenToggle: function(inSender, fullScreen) {
		if (fullScreen == true) {
			this.$.current.hide();
			this.$.logoBanner.hide();
		} else {
			this.$.current.show();
			this.$.logoBanner.show();
		}
	},
	
	notifyOnWeatherAlerts: function() {
/*
		var severe = this.$.appModel.getWeatherModel().getSevere();
		
		if (severe && severe[AccuWeather_WeatherModel_Keys.warningtype] != null) {
			for (var i=0; i < severe[AccuWeather_WeatherModel_Keys.warningtype].length; i++) {
				this.$.dashboard.push({icon:"images/alert01_whiteBorder40.png", title:$LL("Weather Alert"), text:severe[AccuWeather_WeatherModel_Keys.warningtype][i]});
			}
			
			this.$.horizontalCommandToolbar.setIsWeatherAlert(true);
			this.$.verticalCommandToolbar.setIsWeatherAlert(true);
		} else {
			this.$.horizontalCommandToolbar.setIsWeatherAlert(false);
			this.$.verticalCommandToolbar.setIsWeatherAlert(false);
		}
*/
	},
	onDashboardMessageTap: function(inSender, layer) {
		this.$.current.onWeatherAlertButtonClick();
		enyo.windows.activateWindow(enyo.windows.getRootWindow(), {});
	},
	onDashboardIconTap: function(inSender, layer) {
		this.$.current.onWeatherAlertButtonClick();
		enyo.windows.activateWindow(enyo.windows.getRootWindow(), {});
	},
	
});