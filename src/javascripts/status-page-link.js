/*
 * Status Link
 *
 * Turna simple HTML link to your Sorry™ Status Page into a contextual one
 * which shows the current state of the service.
 */

/*jshint multistr:true */
/* Wrap this as a jQuery plugin. */
(function(window, document, undefined) { "use strict";

	/*
	 * Load in an dependancies required by this plugin.
	 *
	 * These are pulled inline by the Browserify package ready for
	 * distribution, and properly scopes and namespaced for safety.
	 */
	// Stripped back jQuery.
	var $ = require('jquery');
	// API Wrapper for the Status Page API.
	var api = require('sorry-api');

	/*
	 * Status Link
	 *
	 * The main plugin logic here for the link itself and
	 * interact based on it's state.
	 */

	var StatusLink = function (options, elem) {
		// Quick self refernce to the class.
		var self = this;

		// Reference the HTML element we're teathered too.
		self.elem = elem;
		self.$elem = $(elem);

		// Store the options into the instance.
		self.options = options;

		// Create an instance of the API.
		self.api = new api.SorryAPI();

		// Define the template for the link.
		self.template = '\
			<small>Current Status:</small> \
			<i class="{{state-icon-class}}" aria-hidden="true"></i>{{state-message}}\
		';

		// Set the state strings and icons.
		self.states = {
			'loading': {
				'icon-class': 'fa fa-circle-o-notch fa-spin',
				'message': 'Checking status...'
			},
			'ongoing': {
				'icon-class': 'fa fa-times-circle-o',
				'message': 'We are having issues at the moment'
			},
			'all-is-well': {
				'icon-class': 'fa fa-check-circle-o',
				'message': 'All systems are go'
			}
		};
	};

	StatusLink.prototype.init = function() {
		// Reference self again.
		var self = this;

		// Set the loading state.
		self.render('loading');

		// Request the page data from the API.
		// INFO: We pipe the status-bar-for value to support formats on various jQuery versions.
		//       The first is latter versions of jQuery, the second is earlier vertions.		
		self.api.fetchPage((self.options.statusLinkFor || self.options['status-link-for']), 
			// Include the notices, as if we have some
			// We'll display a different state.
			['notices'],
		{ 
			// We only need to check for present notices.
			'notices': {
				'timeline_state_eq': 'present'
			}
		}, function(response) {
			// Change the state depending on whether we have any open notices.
			if (response.response.notices.length) {
				// We have open notices, display state.
				self.render('ongoing');
			} else {
				// No open notices, display all is well.
				self.render('all-is-well');
			}
		});
	};

	StatusLink.prototype.render = function(state) {
		// Reference self again.
		var self = this;

		// Replace the HTML with the state frag.
		self.$elem.html(self.state_frag(state));
	};

	StatusLink.prototype.state_frag = function(state) {
		// Reference self again.
		var self = this;

		// Pull the state based icon and message.
		var state_content = self.states[state];

		// Replace the frag content with the
		// state based contextual stuff.
		return self.template.replace( /{{state-icon-class}}/ig, state_content['icon-class'] ) // Swap the description.
				.replace( /{{state-message}}/ig, state_content.message ); // Swap the link.
	};

	// jQuery Plugin Definition.

	// Reference the noflict version.
	var old = $.fn.statusLink;

	// Define the plugin.
	$.fn.statusLink = function (options) {
		// Allow it to be applied to multiple elements.
		// TODO: Do we want to restrict this to a single instance?
		return this.each(function () {
			// Create an instance of the status bar class.
			var statusLink = new StatusLink(options, this);

			// Bind the class to the data for the DOM element.
			$.data( this, 'statusLink', statusLink );
		});
	};

	// No Conflict
	// Copied from the Bootstrap JS widgets, to avoid name conflicts.

	$.fn.statusLink.noConflict = function () {
		$.fn.statusLink = old;
		return this;
	};

	// Data-Api

	// Instantiate the plugin on window load.
	$(window).bind('load', function () {
		// Attach the plugin to any links.
		$('[data-status-link-for]').each(function () {
			// Instantiate the plugin.
			var $statusLink = $(this);

			// Bind it to the element.
			// Pass in the config for the status bar from the script tags data.
			$statusLink.statusLink($statusLink.data());

			// Initialize the plugin.
			$statusLink.data('statusLink').init();
		});
	});

})(window, document);