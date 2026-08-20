enyo.kind({
	name: "AccuWeather.TermsDialog",
	kind: enyo.Component,

	components: [
		{name: "termsDialog", kind: "ModalDialog", className: "settings-termsdialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: $LL("Terms & Conditions")},
			{className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px;", allowHtml: true, content: termsText},
			{kind: "Button", caption: $LL("OK"), className: "enyo-button-affirmative", onclick: "onTermsCloseClick"}
		]},
	],

	create: function()
	{
		this.inherited(arguments);
	},


	open: function()
	{
		this.$.termsDialog.openAtCenter();
	},

	onTermsCloseClick: function()
	{
		this.$.termsDialog.close(); 
	},
});
