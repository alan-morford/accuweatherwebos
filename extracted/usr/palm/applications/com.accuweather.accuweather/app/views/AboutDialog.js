enyo.kind({
	name: "AccuWeather.AboutDialog",
	kind: enyo.Component,

	components: [
		{name: "aboutDialog", kind: "ModalDialog", className: "settings-aboutdialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: $LL("About AccuWeather.com")},
			{className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", allowHtml: true, content: aboutText},
			{kind: "Button", caption: $LL("OK"), className: "enyo-button-affirmative", onclick: "onAboutCloseClick" }
		]},
	],

	create: function()
	{
		this.inherited(arguments);
	},


	open: function()
	{
		this.$.aboutDialog.openAtCenter();
	},

	onAboutCloseClick: function()
	{
		this.$.aboutDialog.close(); 
	},
});
