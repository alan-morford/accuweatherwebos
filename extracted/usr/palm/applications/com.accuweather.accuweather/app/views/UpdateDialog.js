// "Update available" prompt, shown when App_Interactive.js's GitHub-releases
// check (checkForUpdate()) finds a newer version than what's installed.
// Structurally the same ModalDialog/openAtCenter() pattern this app's other
// dialogs already use (AboutDialog.js/TermsDialog.js/SupportDialog.js), not
// World Today's own enyo.Popup-based UpdatePopup.js -- that one needed a
// hand-rolled CSS-transform centering workaround specifically because
// ModalDialog's own openAtCenter() measurement didn't work for it; this
// app's ModalDialog usage elsewhere already centers correctly, so no need
// for that detour here.
enyo.kind({
	name: "AccuWeather.UpdateDialog",
	kind: enyo.Component,

	events: {
		onUpdateConfirmed: ""
	},

	components: [
		{name: "updateDialog", kind: "ModalDialog", className: "settings-updatedialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: $LL("Update Available")},
			{name: "versionLabel", className: "update-versionlabel"},
			{kind: "enyo.Scroller", className: "update-changelogscroller", components: [
				{name: "changelog", className: "update-changelogtext", allowHtml: true}
			]},
			{kind: "HFlexBox", pack: "center", className: "update-buttonrow", components: [
				{kind: "Button", caption: $LL("Later"), onclick: "onCancelClick"},
				{kind: "Button", caption: $LL("Update Now"), className: "enyo-button-affirmative", onclick: "onUpdateClick"}
			]}
		]},
	],

	create: function() {
		this.inherited(arguments);
	},

	// Open before setContent, not after -- World Today's own UpdatePopup.js
	// (a different, lazy-created Popup kind) hit "Cannot call method
	// 'setContent' of undefined" the other way round, confirmed live. This
	// app's ModalDialog dialogs elsewhere don't call setContent dynamically
	// at all (their content is static $LL() text baked in at declare time),
	// so there's no existing proof either way for ModalDialog specifically --
	// following the already-proven-safe order rather than assuming.
	showRelease: function(versionLabel, changelogHtml) {
		this.$.updateDialog.openAtCenter();
		this.$.versionLabel.setContent(versionLabel);
		this.$.changelog.setContent(changelogHtml);
	},

	onCancelClick: function() {
		this.$.updateDialog.close();
	},

	onUpdateClick: function() {
		this.$.updateDialog.close();
		this.doUpdateConfirmed();
	},
});
