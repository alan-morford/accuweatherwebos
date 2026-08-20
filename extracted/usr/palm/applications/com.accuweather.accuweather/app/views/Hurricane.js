// news & videos tab order
HurricanePanesOrder = {
	News : 0,
	Video : 1,
};

enyo.kind({
	name: "AccuWeather.Hurricane",
  	kind: enyo.VFlexBox,
    className: "accuweather-body hurricane",

	components: [
		{kind: "ApplicationEvents", onWindowRotated: "onWindowRotated", onLoad: "onLoad"},
		
		// ui part
		{kind: "Control", layoutKind: "HFlexLayout", className:"hurricane-radiotab", components: [
			{flex: 1},
			{kind: "RadioGroup", name: "basinTab", onChange: "onBasinSelected", components: [
				{caption: $LL("Atlantic"), className:"hurricane-radio-button"},
				{caption: $LL("East pacific"), className:"hurricane-radio-button"},
				{caption: $LL("West pacific"), className:"hurricane-radio-button"},
				{caption: $LL("South pacific"), className:"hurricane-radio-button"},
				{caption: $LL("Indian"), className:"hurricane-radio-button"}
			]},

			{kind: "IconButton", name: "newsDropdown", icon: "images/navbar_news_tab.png", onclick: "onNewsDropdownClicked"},

			{flex: 1},
		]},

		{kind: "HFlexBox", flex : 1, components : [
			{name: "map", className: "hurricane-map-canvas", kind: "Control", flex: 1},
		]},

		// news & videos popup
		{name: "newsAndVideos", kind: "enyo.Popup", onBeforeOpen: "onBeforeNewsAndVideosDialogOpen", components: [
			// tab
			{kind: "RadioGroup", name: "newsAndVideosGroup", onChange: "newsAndVideosPanelSelected", components: [
				{caption: $LL("News")},
				{caption: $LL("Videos")},
			]},

			// news
			{layoutKind: "HFlexLayout", name: "newsPanel", style: "height: 200px;", showing: false, components: [
				{kind: "enyo.Scroller", flex: 1, components: [
					{kind: "VirtualRepeater", onSetupRow: "onNewsSetupRow", components: [
						{kind: "Item", name: "newsItem", className: "hurricane-news-rowitem", onclick: "onNewsRowItemClick", components: [
							{layoutKind: "VFlexLayout", components: [
								{name: "newsTitle", content: "", className: "hurricane-news-titletext"},
								{name: "newsDescription", content: "", className: "hurricane-news-descriptiontext"}
							]},
						]},
					]},
				]},
			]},

			// videos
			{kind: "HFlexBox", name: "videosPanel", style: "height: 200px;", showing: false, components: [
				{kind: "enyo.Scroller", flex: 1, components: [
					{kind: "VirtualRepeater", onSetupRow: "onVideoSetupRow", components: [
						{kind: "Item", name: "item", className: "hurricane-video-rowitem", components: [
							{kind: "HFlexBox", components: [
								{name: "videoPlayer", kind: "Image", onclick: "onVideoPlayerClicked"},
								{kind: "VFlexBox", flex:1, components: [
									{name: "videoTitle", content: "", className: "hurricane-video-titletext"},
									{name: "videoDescription", content: "", className: "hurricane-video-descriptiontext"}
								]},
							]},
						]},
					]},
				]},
			]},

			// spinner
			{layoutKind: "HFlexLayout", name: "spinnerPanel", style: "height: 200px;", showing: true, components: [
				{flex: 1},
				{layoutKind: "VFlexLayout", style: "height: 200px;", components: [
					{flex: 1},
					{kind: "Spinner", name: "newsAndViedeosSpinner", showing: true},
					{flex: 1},
				]},
				{flex: 1},
			]},

			// close
			{kind: "Button", name: "newsClose", caption: $LL("Close"), onclick: "onNewsCloseClicked"},
		]},

		// hurricane info dialog
	    {name: "hurricaneDialog", kind: "ModalDialog", onBeforeOpen: "onBeforeOpenHurricaneDialog", components: [
			{name: "hurricaneName", allowHtml: true},
			{name: "hurricaneLevel", allowHtml: true},
			{name: "hurricaneSpeed", allowHtml: true},
			{name: "hurricaneWindSpeed", allowHtml: true},
			{name: "hurricaneDirection", allowHtml: true},
			{name: "hurricaneGust", allowHtml: true},
			{name: "hurricanePressure", allowHtml: true},
			{kind: "Button", content: $LL("OK"), className: "enyo-button-affirmative", onclick: "oncloseHurricaneDialog"},
        ]},

		// non UI components
		{name: "hurricaneModel",
				kind: "AccuWeather.HurricaneModel",
				onHurricaneModelDidFinish: "onHurricaneModelDidFinish",
				onHurricaneModelDidFinishWithError: "onHurricaneModelDidFinishWithError"
		},

		{name: "hurricaneNewsModel",
				kind: "AccuWeather.HurricaneNewsModel",
				onHurricaneModelDidFinish: "onHurricaneNewsDidFinish",
				onHurricaneModelDidFinishWithError: "onHurricaneNewsDidFinishWithError"
		},
		
		{name: "videoModel",
				kind: "AccuWeather.VideoModel",
				onVideoModelDidFinishRetrieving: "onVideoModelDidFinishRetrieving",
				onVideoModelDidFinishRetrievingWithError: "onVideoModelDidFinishRetrievingWithError"
		},

		{name: "videoApp", kind: enyo.PalmService,
			service: "palm://com.palm.applicationManager/",
			onSuccess: "openSuccess",
			onFailure: "openFailure",
		},

	    {name: "launchBrowserCall", kind : "PalmService", service : "palm://com.palm.applicationManager/", method : "launch"},
	],

	// PROPERTIES { getXxxXxx() setXxxXxx(value) }
	published: {
		appModel: null // required for all views
	},

	// private
	dataDownloaded: false,
	map: null,
	gotHurricaneData: false,
	markers: {}, // maps (lat, lon) into storm data
	selectedHurricaneData: null,
	cameraPos: [[31.72, -24.61], // atlantic
					[31.72, -127], // east pacific
					[21.69, -217.97], // west pacific
					[-28, -146.42], // south pacific
					[-14.39, -272]], // indian

	// create
	create: function() {
		this.inherited(arguments);
	},

	onShow: function() {
		if (!this.dataDownloaded) {
			this.startDownload();
		}
		google.maps.event.trigger(this.map, 'resize');
	},

	onHide: function() {
	},
	
	onGoogleMapsLoad: function() {
		latLon = new google.maps.LatLng(40.71427, -74.00597);
			
		var options = {
	      zoom: 3,
	      center: latLon, 
	      disableDefaultUI: true,
	      draggable: true,
	      minZoom: 3,
	      maxZoom: 3,
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
		
	    this.map = new google.maps.Map(this.$.map.hasNode(), options);
		google.maps.event.trigger(this.map, 'resize');
		google.maps.event.addListener(this.map, 'bounds_changed', this.onGoogleMapBoundsChanged.bind(this));
		google.maps.event.addListener(this.map, 'center_changed', this.onGoogleMapCenterChanged.bind(this));

		// place markers if we already know their positions
		if (this.gotHurricaneData)
			this.createHurricaneAnnotations_();
	},

	onHurricaneModelDidFinish: function() {
		this.gotHurricaneData = true;
		if (this.map != null)
			this.createHurricaneAnnotations_();
	},

	onHurricaneModelDidFinishWithError: function() {
	},

	onHurricaneNewsDidFinish: function() {
	},

	onHurricaneNewsDidFinishWithError: function() {
	},

	onVideoModelDidFinishRetrieving: function() {
	},
	
	onVideoModelDidFinishRetrievingWithError: function() {
	},

	////////////////////////////////////////////////////////////////////////
	// ui event handlers
	onNewsDropdownClicked: function() {
		// only open popup if not yet visible
		if (!this.$.newsAndVideos.getShowing()) {
			this.$.newsAndVideos.openAtControl(this.$.newsDropdown);
		}
	},

	onBasinSelected: function() {
		this.goToBasin_(this.$.basinTab.value);
	},

	////////////////////////////////////////////////////////////////////////
	// ui event handlers for news & videos popup
	onBeforeNewsAndVideosDialogOpen: function() {
		this.updatePanelsVisibility_();
	},

	newsAndVideosPanelSelected: function() {
		this.updatePanelsVisibility_();
	},

	onNewsCloseClicked: function() {
		this.$.newsAndVideos.close();
	},
	
	onNewsRowItemClick: function(inSender, inEvent) {
		var link = this.$.hurricaneNewsModel.newsItem(inEvent.rowIndex).link;
		this.$.launchBrowserCall.call({id: "com.palm.app.browser", params:{target: link}});
	},

	onVideoPlayerClicked: function(inSender, inEvent) {
		var model = this.$.videoModel;
		var itemsData = model.getVideos();
		var itemData = itemsData[inEvent.rowIndex];

		this.$.videoApp.call({id : 'com.palm.app.videoplayer',
									params: {
										target : itemData["url"]
									}
								},
								{
									method: "launch"
								});
	},
	
	onNewsSetupRow: function(inSender, inIndex) {
		if (inIndex == this.$.hurricaneNewsModel.newsNum())
			return false;
		var newsItem = this.$.hurricaneNewsModel.newsItem(inIndex);
		this.$.newsTitle.setContent(newsItem[HurricaneNewsItem.TITLE]);
		this.$.newsDescription.setContent(newsItem[HurricaneNewsItem.DESCRIPTION]);
		return true;
	},

	onVideoSetupRow: function(inSender, inIndex) {
		var itemsData = this.$.videoModel.getVideos();

		if (inIndex == itemsData.length)
			return false;

		var itemData = itemsData[inIndex];

		this.$.videoTitle.setContent(itemData["title"]);
		this.$.videoDescription.setContent(itemData["description"]);

		this.$.videoPlayer.setSrc(itemData["thumbnail"]);
		this.$.videoPlayer.setAttribute("width", itemData["width"]);
		this.$.videoPlayer.setAttribute("height", itemData["height"]);

		return true;
	},

	updatePanelsVisibility_: function() {
		// this does a little bit of cheatery to emulte windows like tab control wich is missing
		// in webos
		if (this.$.newsAndVideosGroup.value == HurricanePanesOrder.News) {
			if (this.$.hurricaneNewsModel.getIsDownloading()) {
				this.$.newsPanel.hide();
				this.$.videosPanel.hide();
				this.$.spinnerPanel.show();
			} else {
				this.$.newsPanel.show();
				this.$.videosPanel.hide();
				this.$.spinnerPanel.hide();
			}
		} else if (this.$.newsAndVideosGroup.value == HurricanePanesOrder.Video) {
			if (this.$.videoModel.getIsDownloading()) {
				this.$.newsPanel.hide();
				this.$.videosPanel.hide();
				this.$.spinnerPanel.show();
			} else {
				this.$.newsPanel.hide();
				this.$.videosPanel.show();
				this.$.spinnerPanel.hide();
			}
		}
	},

	////////////////////////////////////////////////////////////////////////
	// ui event handlers for hurricane popup
	onBeforeOpenHurricaneDialog: function()  {
		this.$.hurricaneName.setContent($LL("Name") + ": <b>" + this.selectedHurricaneData[HurricaneKeys.NAME] + "</b>");
		this.$.hurricaneLevel.setContent($LL("Level") + ": <b>" + this.selectedHurricaneData[HurricaneKeys.LEVEL] + "</b>");
		this.$.hurricaneSpeed.setContent($LL("Speed") + ": <b>" + this.selectedHurricaneData[HurricaneKeys.SPEED] + "</b>");
		this.$.hurricaneWindSpeed.setContent($LL("Wind Speed") + ": <b>" + this.selectedHurricaneData[HurricaneKeys.WIND_SPEED] + "</b>");
		this.$.hurricaneDirection.setContent($LL("Wind Direction") + ": <b>" + this.selectedHurricaneData[HurricaneKeys.DIRECTION] + "</b>");
		this.$.hurricaneGust.setContent($LL("Gust") + ": <b>" + this.selectedHurricaneData[HurricaneKeys.GUST] + "</b>");
		this.$.hurricanePressure.setContent($LL("Pressure") + ": <b>" + this.selectedHurricaneData[HurricaneKeys.PRES] + "</b>");
	},
	
	oncloseHurricaneDialog: function() {
		this.$.hurricaneDialog.close();
	},

	////////////////////////////////////////////////////////////////////////
	// ui event handlers for hurricane popup
	onGoogleMapBoundsChanged: function() {
		var bounds = this.map.getBounds();
		
		if (bounds.getNorthEast().lat() > 85 ) {
			this.map.panBy(0, 1);
			
		}else if( bounds.getSouthWest().lat() < -85) {
			this.map.panBy(0, -1);
		}
	},
	
	onGoogleMapCenterChanged: function() {
	},	

	////////////////////////////////////////////////////////////////////////
	//   app model update right before view is visible
	// -------------------------
	appModelChanged: function(oldAppModel) {
		// this view doesn't depend on data in weather model, so just igonre
		// the event
	},

	//
	startDownload: function() {
		this.$.hurricaneModel.download();
		this.$.hurricaneNewsModel.download();
		this.$.videoModel.retrieveHurricaneVideos();
	},

	createHurricaneAnnotations_: function() {
		this.markers = {};
		var storms = this.$.hurricaneModel.getStorms();
		
		for (var i = 0; i < storms.length; i++) {
			var storm = storms[i];

			var pos = new google.maps.LatLng(parseFloat(storm[HurricaneKeys.LATITUDE]),
											parseFloat(storm[HurricaneKeys.LONGITUDE]));

			var marker = new google.maps.Marker({position: pos,
													map: this.map,
													icon: this.selectHurricaneIcon_(storm[HurricaneKeys.LEVEL_CODE])});

			google.maps.event.addListener(marker, 'click', enyo.bind(this, "hurricaneClicked_"));
			this.markers[pos] = storm;
		}
	},

	selectHurricaneIcon_: function(levelCode) {
		var imageName;
	
		if (levelCode == "ST") imageName = "tropical_storm_icon";
		else if (levelCode == "TS") imageName = "tropical_storm_icon";
		else if (levelCode == "TR") imageName = "tropical_rainstorm_icon";
		else if (levelCode == "TD") imageName = "tropical_depression_icon";
		else if (levelCode == "H1") imageName = "hurricane_h1_icon";
		else if (levelCode == "H2") imageName = "hurricane_h2_icon";
		else if (levelCode == "H3") imageName = "hurricane_h3_icon";
		else if (levelCode == "H4") imageName = "hurricane_h4_icon";
		else if (levelCode == "H5") imageName = "hurricane_h5_icon";
		else imageName = "tropical_storm_icon";

		return "images/" + imageName + "@2x.png";
	},
	
	hurricaneClicked_: function(event) {
		this.selectedHurricaneData = this.markers[event.latLng];
		this.$.hurricaneDialog.openAtCenter();
	},

	goToBasin_: function(basinIndex) {
		if (this.map != null)
			var latLng = this.cameraPos[basinIndex];
			this.map.panTo(new google.maps.LatLng(latLng[0], latLng[1]));
	},

});
