var VideoType = {
		LOCAL: 0,
		NATIONAL: 1, 
		INTERNATIONAL: 2
};

enyo.kind({
	name: "AccuWeather.Video",
  	kind: enyo.VFlexBox,
    className: "accuweather-body video",
	// UI ELEMENTS

    videos: [],
    
	components: [
		{name: "scrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [ {kind: "SpinnerLarge"}] },
		{kind: "enyo.Scroller", flex: 1, components: [
            {name: "localDrawer", kind: "DividerDrawer", caption: $LL("LOCAL"), components: [
				{name: "localList", kind: "VirtualRepeater", onSetupRow: "onSetupRowLocal", components: [
					{kind: "Item", name: "localItem", className: "video-rowitem", onclick: "onLocalItemClick", components: [
						{layoutKind: "HFlexLayout", components: [
							{name: "localPlayer", kind: "Image", onclick: "onIconClickedLocal"},
							{layoutKind: "VFlexLayout", flex:1, components: [
								{name: "localTitle", content: "", className: "video-titletext"},
								{name: "localDescription", content: "", className: "video-descriptiontext"}
							]},
						]},
					]},
				]}
			]},
			{name: "nationalDrawer", kind: "DividerDrawer", caption: $LL("NATIONAL"), components: [
 				{name: "nationalList", kind: "VirtualRepeater", onSetupRow: "onSetupRowNational", components: [
 					{kind: "Item", name: "nationalItem", className: "video-rowitem", onclick: "onNationalItemClick", components: [
 						{layoutKind: "HFlexLayout", components: [
 							{name: "nationalPlayer", kind: "Image", onclick: "onIconClickedNational"},
 							{layoutKind: "VFlexLayout", flex:1, components: [
 								{name: "nationalTitle", content: "", className: "video-titletext"},
 								{name: "nationalDescription", content: "", className: "video-descriptiontext"}
 							]},
 						]},
 					]},
 				]}
 			]},
 			{name: "internationalDrawer", kind: "DividerDrawer", caption: $LL("INTERNATIONAL"), components: [
				{name: "internationalList", kind: "VirtualRepeater", onSetupRow: "onSetupRowInternational", components: [
					{kind: "Item", name: "internationalItem", className: "video-rowitem", onclick: "onInternationalItemClick", components: [
						{layoutKind: "HFlexLayout", components: [
							{name: "internationalPlayer", kind: "Image", onclick: "onIconClickedInternational"},
							{layoutKind: "VFlexLayout", flex:1, components: [
								{name: "internationalTitle", content: "", className: "video-titletext"},
								{name: "internationalDescription", content: "", className: "video-descriptiontext"}
							]},
						]},
					]},
				]}
			]}                         			
		]},
		{name: "gradientImage", kind: "Image", src: "images/black_gradient.png", className:"news-gradientimage"},
		{name: "videoApp", kind: enyo.PalmService,
			service: "palm://com.palm.applicationManager/",
			onSuccess: "openSuccess",
			onFailure: "openFailure",
		},
	],

	// PROPERTIES { getXxxXxx() setXxxXxx(value) }
	published: {
		appModel: null // required for all views
	},
    selectedItem: -1,
    selectedCategory: -1,
	modelChanged: false,
	visible: false,

	// create
	create: function() {
		this.inherited(arguments);
	},

	onShow: function() {
		this.visible = true;

		// does ui match it's model? if no download videos list
		if (this.modelChanged) {
			this.startDownload();
			modelChanged = false;
		}
	},

	onHide: function() { this.visible = false; },
	
	onVideoModelDidFinishLocalWithError: function() { 
		this.error("failed to download local videos");
		this.$.localModel.destroy(); 
	},

	onVideoModelDidFinishNationalWithError: function() { 
		this.error("failed to download national videos");
		this.$.nationalModel.destroy();
	},

	onVideoModelDidFinishInternationalWithError: function() { 
		this.error("failed to download international videos");
		this.$.internationalModel.destroy(); 
	},

	onVideoModelDidFinishRetrieving: function() {
		var done = true;
		
		for (var i = 0; i < this.videos.length; i++) {
			if (this.videos[i] != null && this.videos[i].getIsDownloading() == true) {
				done = false;
				break;
			}
		}
		
		if (done) {
			this.$.scrim.hide();
			this.redrawUI();
		}
	},
	
	redrawUI: function() {
		if (this.videos[VideoType.LOCAL] != null) {
			this.$.localList.render();
			this.$.localDrawer.show();
		} else {
			this.$.localDrawer.hide();
		}
		
		if (this.videos[VideoType.NATIONAL] != null) {
			this.$.nationalList.render();
			this.$.nationalDrawer.show();
		} else {
			this.$.nationalDrawer.hide();
		}
		
		if (this.videos[VideoType.INTERNATIONAL] != null) {
			this.$.internationalList.render();
			this.$.internationalDrawer.show();
		} else {
			this.$.internationalDrawer.hide();
		}
	},
	
	renderSelection: function(selectedItem, selectedCategory) {
		var previousSelectedItem = this.selectedItem;
		var previousSelectedCategory = this.selectedCategory;
		this.selectedItem = selectedItem;
		this.selectedCategory = selectedCategory;
		
		if (-1 != previousSelectedItem) {
			if (VideoType.LOCAL == previousSelectedCategory) {
				this.$.localList.renderRow(previousSelectedItem);
			} else if (VideoType.NATIONAL == previousSelectedCategory) {
				this.$.nationalList.renderRow(previousSelectedItem);
			} else {
				this.$.internationalList.renderRow(previousSelectedItem);
			}
		}
		
		if (VideoType.LOCAL == this.selectedCategory) {
			this.$.localList.renderRow(this.selectedItem);
		} else if (VideoType.NATIONAL == this.selectedCategory) {
			this.$.nationalList.renderRow(this.selectedItem);
		} else {
			this.$.internationalList.renderRow(this.selectedItem);
		}
	},
	
	onLocalItemClick: function(inSender, inEvent) {
		this.renderSelection(inEvent.rowIndex, VideoType.LOCAL);
	},
	
	onNationalItemClick: function(inSender, inEvent) {
		this.renderSelection(inEvent.rowIndex, VideoType.NATIONAL);
	},
	
	onInternationalItemClick: function(inSender, inEvent) {
		this.renderSelection(inEvent.rowIndex, VideoType.INTERNATIONAL);
	},
	
	onIconClickedLocal: function(inSender, inEvent) {
		
		this.renderSelection(inEvent.rowIndex, VideoType.LOCAL);
		
		var itemData = this.videos[VideoType.LOCAL].getVideos()[inEvent.rowIndex];
		this.$.videoApp.call({id : 'com.palm.app.videoplayer', params: { target : itemData["url"] } },
								{ method: "launch" });
	},

	onIconClickedNational: function(inSender, inEvent) {
		
		this.renderSelection(inEvent.rowIndex, VideoType.NATIONAL);
		
		var itemData = this.videos[VideoType.NATIONAL].getVideos()[inEvent.rowIndex];
		this.$.videoApp.call({id : 'com.palm.app.videoplayer', params: { target : itemData["url"] } },
								{ method: "launch" });
	},
	
	onIconClickedInternational: function(inSender, inEvent) {
		
		this.renderSelection(inEvent.rowIndex, VideoType.INTERNATIONAL);
		
		var itemData = this.videos[VideoType.INTERNATIONAL].getVideos()[inEvent.rowIndex];
		this.$.videoApp.call({id : 'com.palm.app.videoplayer', params: { target : itemData["url"] } },
								{ method: "launch" });
	},
	
	onSetupRowLocal: function(inSender, inIndex) {

		if (inIndex < 0 || null == this.videos[VideoType.LOCAL] || 
				inIndex >= this.videos[VideoType.LOCAL].getVideos().length)
			return false;
		
		var videos = this.videos[VideoType.LOCAL].getVideos();
		var video = videos[inIndex];

		this.$.localTitle.setContent(video["title"]);
		this.$.localDescription.setContent(video["description"]);
		this.$.localPlayer.setSrc(video["thumbnail"]);
		this.$.localPlayer.setAttribute("width", video["width"]);
		this.$.localPlayer.setAttribute("height", video["height"]);

		if(this.selectedItem == inIndex && this.selectedCategory == VideoType.LOCAL) {
			this.$.localItem.addClass("video-rowitem-selected");
		} else {
			this.$.localItem.removeClass("video-rowitem-selected");
		}
		
		return true;
	},
	
	onSetupRowNational: function(inSender, inIndex) {

		if (inIndex < 0 || null == this.videos[VideoType.NATIONAL] || 
				inIndex >= this.videos[VideoType.NATIONAL].getVideos().length)
			return false;
		
		var videos = this.videos[VideoType.NATIONAL].getVideos();
		var video = videos[inIndex];

		this.$.nationalTitle.setContent(video["title"]);
		this.$.nationalDescription.setContent(video["description"]);
		this.$.nationalPlayer.setSrc(video["thumbnail"]);
		this.$.nationalPlayer.setAttribute("width", video["width"]);
		this.$.nationalPlayer.setAttribute("height", video["height"]);
		
		if(this.selectedItem == inIndex && this.selectedCategory == VideoType.NATIONAL) {
			this.$.nationalItem.addClass("video-rowitem-selected");
		} else {
			this.$.nationalItem.removeClass("video-rowitem-selected");
		}
		
		return true;
	},
	
	onSetupRowInternational: function(inSender, inIndex) {

		if (inIndex < 0 || null == this.videos[VideoType.INTERNATIONAL] || 
				inIndex >= this.videos[VideoType.INTERNATIONAL].getVideos().length)
			return false;
		
		var videos = this.videos[VideoType.INTERNATIONAL].getVideos();
		var video = videos[inIndex];

		this.$.internationalTitle.setContent(video["title"]);
		this.$.internationalDescription.setContent(video["description"]);
		this.$.internationalPlayer.setSrc(video["thumbnail"]);
		this.$.internationalPlayer.setAttribute("width", video["width"]);
		this.$.internationalPlayer.setAttribute("height", video["height"]);
		
		if(this.selectedItem == inIndex && this.selectedCategory == VideoType.INTERNATIONAL) {
			this.$.internationalItem.addClass("video-rowitem-selected");
		} else {
			this.$.internationalItem.removeClass("video-rowitem-selected");
		}
		
		return true;
	},

	appModelChanged: function(oldAppModel) {
		if (this.visible)
			this.startDownload();
		else
			this.modelChanged = true;
	},

	startDownload: function() {
		
		// start scrim
		this.$.scrim.show();
		
		// kill existing video models
		if (this.$.nationalModel != undefined) {
			this.$.nationalModel.cancel();
			this.$.nationalModel.destroy();
		}

		if (this.$.internationalModel != undefined) {
			this.$.internationalModel.cancel();
			this.$.internationalModel.destroy();
		}

		if (this.$.localModel != undefined) {
			this.$.localModel.cancel();
			this.$.localModel.destroy();
		}

		items = [];
		this.render();

		// query for video model
		var model = this.getAppModel().getWeatherModel();
		var video = model.getVideo();
		var local = model.getLocal();

		// local videos
		if (video["clipCode"] != undefined && video["clipCode"] != "") {
			this.createComponent({name: "localModel",
									kind: "AccuWeather.VideoModel",
									onVideoModelDidFinishRetrieving: "onVideoModelDidFinishRetrieving",
									onVideoModelDidFinishRetrievingWithError: "onVideoModelDidFinishLocalWithError"});
			this.$.localModel.retrieveLocalVideosForCode(video["clipCode"]);
			this.videos[VideoType.LOCAL] = this.$.localModel;
		} else {
			this.videos[VideoType.LOCAL] = null;
		}

		// national videos
		this.log("COUNTRY CODE" + local[AccuWeather_WeatherModel_Keys.countrycode]);
		if (local[AccuWeather_WeatherModel_Keys.countrycode] && 
				local[AccuWeather_WeatherModel_Keys.countrycode] =="US") { 
			this.createComponent({name: "nationalModel",
									kind: "AccuWeather.VideoModel",
									onVideoModelDidFinishRetrieving: "onVideoModelDidFinishRetrieving",
									onVideoModelDidFinishRetrievingWithError: "onVideoModelDidFinishNationalWithError"});
			this.$.nationalModel.retrieveNationalVideos();
			this.videos[VideoType.NATIONAL] = this.$.nationalModel;
		} else {
			this.videos[VideoType.NATIONAL] = null;
		}

		// international videos
		this.createComponent({name: "internationalModel",
									kind: "AccuWeather.VideoModel",
									onVideoModelDidFinishRetrieving: "onVideoModelDidFinishRetrieving",
									onVideoModelDidFinishRetrievingWithError: "onVideoModelDidFinishInternationalWithError"});
		this.$.internationalModel.retrieveInternationalVideos();
		this.videos[VideoType.INTERNATIONAL] = this.$.internationalModel;
	}
});
