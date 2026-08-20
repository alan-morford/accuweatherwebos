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
			// "enyo-item enyo-first" is what draws the horizontal divider
			// below this row on the other dialogs (About/Terms/Support) --
			// giving the version line that same class (instead of the old
			// separate, plain "Update Available" title row above it) is
			// what puts the version above the divider instead of below it.
			{name: "versionLabel", className: "enyo-item enyo-first update-versionlabel", style: "padding: 12px"},
			{name: "changelogScroller", kind: "enyo.Scroller", className: "update-changelogscroller", components: [
				{name: "changelog", className: "update-changelogtext", allowHtml: true}
			]},
			{kind: "HFlexBox", pack: "center", className: "update-buttonrow", components: [
				{kind: "Button", caption: $LL("Cancel"), onclick: "onCancelClick"},
				{kind: "Button", caption: "Update", className: "enyo-button-affirmative", onclick: "onUpdateClick"}
			]}
		]},
	],

	create: function() {
		this.inherited(arguments);
	},

	// Neither versionLabel nor the old title/button captions go through
	// $LL() -- checked app/langs/en.js directly: "Update Available",
	// "Later", and "Update Now" were never valid keys there (only "Cancel"
	// is), so this dialog's title and both buttons have been rendering
	// blank this whole time. Same class of bug as the Support dialog's
	// blank body. "Update" (the affirmative button) isn't a valid key
	// either, so it's assigned directly rather than repeating that mistake.
	//
	// Open before setContent, not after -- World Today's own UpdatePopup.js
	// (a different, lazy-created Popup kind) hit "Cannot call method
	// 'setContent' of undefined" the other way round, confirmed live. This
	// app's ModalDialog dialogs elsewhere don't call setContent dynamically
	// at all (their content is static $LL() text baked in at declare time),
	// so there's no existing proof either way for ModalDialog specifically --
	// following the already-proven-safe order rather than assuming.
	showRelease: function(versionLabel, changelogHtml) {
		this.$.updateDialog.openAtCenter();
		this.$.versionLabel.setContent("Update to " + versionLabel);
		this.$.changelog.setContent(changelogHtml);

		// The scroll-affordance bar (settings.css) only makes sense when
		// there's actually something to scroll -- compare the changelog
		// text's own rendered height (including its padding) against the
		// scroller's fixed 220px viewport (settings.css's
		// .update-changelogscroller) rather than hardcoding that number
		// here too.
		var contentNode = this.$.changelog.hasNode();
		var scrollerNode = this.$.changelogScroller.hasNode();
		var isScrollable = !!(contentNode && scrollerNode && contentNode.offsetHeight > scrollerNode.offsetHeight);
		if (isScrollable) {
			this.$.changelogScroller.addClass("update-changelogscroller-scrollable");
		} else {
			this.$.changelogScroller.removeClass("update-changelogscroller-scrollable");
		}
	},

	onCancelClick: function() {
		this.$.updateDialog.close();
	},

	onUpdateClick: function() {
		this.$.updateDialog.close();
		this.doUpdateConfirmed();
	},
});
