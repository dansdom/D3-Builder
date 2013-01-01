// Tabbing jQuery plugin v2.0
// https://github.com/dansdom/plugins-tab-nav
// v 1.0 - basic functionality
// v 2.0 - moved to new plugin architecture

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.Tabs = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "Tabs";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.Tabs.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.Tabs.settings = {
		'tabNav': '.tabNav ul',
        'tabContent': '.tabContent',
        'startTab' : 1,
        'activeClass' : 'active',
        'fadeIn' : false,
        'fadeSpeed' : 300   
	};
	
	// plugin functions go here
	$.Tabs.prototype = {
		init : function() {
			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var tabs = this;
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			this.el.nav = $(this.opts.tabNav);
			this.el.content = $(this.opts.tabContent);
			this.el.tabLength = this.el.content.children().length;
			this.el.index = this.opts.startTab;
			
			// show the first tab
			this.getFirstTab();
			
			// do the main navigation here
			this.el.nav.children().bind('click.' + this.namespace, function() {
				// get the index
				var thisIndex = $(this).parent().children().index(this);
				// remove active class then add it to current item
				tabs.el.nav.children().removeClass(tabs.opts.activeClass);
				$(this).addClass(tabs.opts.activeClass);
				// hide tab
				tabs.el.content.children().css("display","none");
				// if fade effect then fade it, else just display block
				if (tabs.opts.fadeIn)
				{
					tabs.el.content.children(":eq(" + thisIndex + ")").fadeIn(tabs.opts.fadeSpeed);
				}
				else
				{
					tabs.el.content.children(":eq(" + thisIndex + ")").css("display","block");
				}				
				return false;
			});	
			
		},
		getFirstTab : function()
		{
			// show the startTab.
			if (this.opts.startTab > this.el.tabLength)
			{
				// show the first tab
				this.el.index = 1;
			}
			// convert it into an array index
			this.el.index--;  // so the first tab is equal to 0
			// check that it isn't below 0
			if (this.el.index < 0)
			{
				this.el.index = 0;
			}
			
			// show the active tab
			this.el.content.children(":eq(" + this.el.index + ")").css("display","block");
			this.el.nav.children().removeClass(this.opts.activeClass);
			this.el.nav.children(":eq(" + this.el.index + ")").addClass(this.opts.activeClass);
		},
		option : function(args) {
			this.opts = $.extend(true, {}, this.opts, args);
		},
		destroy : function() {
			this.el.unbind("." + this.namespace);
		}
	};
	
	// the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
	// props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
	$.fn.tabs = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "tabs",
			args;
		
		// if the argument is a string representing a plugin method then test which one it is
		if ( typeof options === 'string' ) {
			// define the arguments that the plugin function call may make 
			args = Array.prototype.slice.call( arguments, 1 );
			// iterate over each object that the function is being called upon
			this.each(function() {
				// test the data object that the DOM element that the plugin has for the DOM element
				var pluginInstance = $.data(this, pluginName);
				
				// if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
				if (!pluginInstance) {
					alert("The plugin has not been initialised yet when you tried to call this method: " + options);
					return;
				}
				// if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
				if (!$.isFunction(pluginInstance[options]) || options.charAt(0) === "_") {
					alert("the plugin contains no such method: " + options);
					return;
				}
				// apply the method that has been called
				else {
					pluginInstance[options].apply(pluginInstance, args);
				}
			});
			
		}
		// initialise the function using the arguments as the plugin options
		else {
			// initialise each instance of the plugin
			this.each(function() {
				// define the data object that is going to be attached to the DOM element that the plugin is being called on
				var pluginInstance = $.data(this, pluginName);
				// if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
				if (pluginInstance) {
					pluginInstance.option(options);
					// initialising the plugin here may be dangerous and stack multiple event handlers. if required then the plugin instance may have to be 'destroyed' first
					//pluginInstance.init(callback);
				}
				// initialise a new instance of the plugin
				else {
					$.data(this, pluginName, new $.Tabs(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
