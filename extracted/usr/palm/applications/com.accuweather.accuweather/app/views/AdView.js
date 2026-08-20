enyo.kind({
	name: "AccuWeather.AdView",
  	kind: enyo.VFlexBox,
    className: "accuweather-body ads",

	components: [
	    {kind: "ApplicationEvents", 
    		onLoad: "onLoad"},
		{name: "feed",
			kind: "WebService",	
			onSuccess: "adFeedComplete_",
			onFailure: "adFeedError_",
			url: "http://www.accuweather.com/adrequest/adrequest.asmx/getAdCode",
			handleAs: "xml"},
		{name : "connManager",
			kind : "PalmService",
			service : "palm://com.palm.connectionmanager/",
			method : "getStatus",
			onSuccess : "connManagerStatusComplete_",
			onFailure  : "connManagerStatusError_"
		},
		{name: "launchBrowserCall", kind : "PalmService", service : "palm://com.palm.applicationManager/", method : "launch"},
		{kind: "HFlexBox", components: [
		    {flex: 1},
            {name: "view", kind: "HtmlContent", allowHtml: "true", onLinkClick: "onLinkClick"},
            {flex: 1}
        ]}
	],
	
	published: {
		appModel: null // required for all views
	},

	//////////////////////////////////////////////////////////////////
	// private
	ip_: null,
	
	create: function() {
		this.inherited(arguments);
	},

	appModelChanged: function(oldAppModel) {
		this.startAdQuery_();
	},
	
	onLoad: function() {
		this.$.connManager.call();
	},

	onLinkClick: function(inSender, inUrl) {
		this.$.launchBrowserCall.call({id: "com.palm.app.browser", params:{target: inUrl}});
	},

	/////////////////////////////////////////////////////////////////
	// feed handlers
	adFeedComplete_: function(inSender, inResponse) {
		if (inResponse) {
			var ads = inResponse.documentElement.getElementsByTagName("strAdCode");
			
			if (ads.length > 0) {
				var ad = ads.item(0);
				this.$.view.setContent(ad.textContent);
			}
		}
	},

	adFeedError_: function() {
	},
	
	/////////////////////////////////////////////////////////////////
	// connection manager handlers
	connManagerStatusComplete_: function(inSender, inResponse) {
		if ("wifi" in inResponse) {
			var wifi = inResponse["wifi"];

			if ("ipAddress" in wifi) {
				this.ip_ = wifi["ipAddress"];
				this.startAdQuery_();
			}
		}
	},

	connManagerStatusError_: function(inSender, inResponse) {
	},

	/////////////////////////////////////////////////////////////////
	startAdQuery_: function() {
		var appModel = this.getAppModel();

		if (appModel && this.ip_ != null) {
			var location = appModel.getLocationModel().getCurrentLocation().location.replace(":", "=");

			this.$.feed.call({"strAppID": "palmapptablet",
								"strPartnerCode": "palmapptablet",
								"strIpAddress" : this.ip_,
								"strUserAgent" : "Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.58 Safari/534.6 TouchPad/1.0",
								"strCurrentZipCode" : location,
								"strWeatherIcon" : appModel.getWeatherModel().getCurrent()[AccuWeather_WeatherModel_Keys.weathericon],
								"strUUID" : "sdfkjh7dyfuh8765f5dj"
							});
		}
	},
});
