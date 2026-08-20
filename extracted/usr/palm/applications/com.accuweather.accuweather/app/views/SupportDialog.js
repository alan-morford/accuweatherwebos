enyo.kind({
	name: "AccuWeather.SupportDialog",
	kind: enyo.Component,

	components: [
		{name: "supportDialog", kind: "ModalDialog", className: "settings-aboutdialog", components: [
  			{className: "enyo-item enyo-first", style: "padding: 12px", content: $LL("Support")},
  			{className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", allowHtml: true, content: supportText},
  			{kind: "HFlexBox", components: [
                {flex: 1},
                {kind: "Button", caption: $LL("Email Support"), onclick: "onEmailSupportClick" },
                {flex: 1},
                {kind: "Button", caption: $LL("OK"), style: "width: 100px", className: "enyo-button-affirmative", onclick: "onSupportCloseClick" },
                {flex: 1},
            ]}
  		]},

		{name : "openEmailCall", kind : "PalmService", service : "palm://com.palm.applicationManager/", method : "open"},
	],

	create: function()
	{
		this.inherited(arguments);
	},


	open: function()
	{
		this.$.supportDialog.openAtCenter();
	},

	onSupportCloseClick: function()
	{
		this.$.supportDialog.close(); 
	},

	onEmailSupportClick: function()
	{
		this.$.supportDialog.close();
		var params = { 
			"summary": $LL("AccuWeather for HP Touchpad"),
			"recipients":[{"type": "email",
                "role":1, 
                "value":"alanmorford@gmail.com"}]};
		this.$.openEmailCall.call({
			"id": "com.palm.app.email",
			"params": params });
	},
});
