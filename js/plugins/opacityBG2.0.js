/*
	jQuery Opacity BG Plugin 2.0
	Copyright (c) 2011 Daniel Thomson
	https://github.com/dansdom/plugins-opacity-bg
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
//
// settings:
// opacity - sets the opacity of the targeted div. range: 0 - 1
// pngFix  - allows integration with DD_BelatedPNG hack
// pngClass - can set the class of the pngfix so that it doesn't clash with any other png fix classes in the document
// v 1.0 - basic functionality
// v 2.0 - integrated new plugin architecture: https://github.com/dansdom/plugins-template-v2


(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.Opacity = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "opacity";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.Opacity.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.Opacity.settings = {
		'opacity': 0.5,
        'pngFix' : false,
        'pngClass': 'pngbg'
	};
	
	// plugin functions go here
	$.Opacity.prototype = {
		init : function() {
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			// get the style from the original box
			var boxHeight = this.el.innerHeight(),
				boxWidth = this.el.innerWidth(),
				boxBgColor = this.el.css("background-color"),
				boxBgImage = this.el.css("background-image"),
				boxBgPosition = this.el.css("background-position"),
				boxBgPositionX = this.el.css("background-position-x"),
				boxBgPositionY = this.el.css("background-position-y"),
				boxBgRepeat = this.el.css("background-repeat"),
				IEopacity = this.opts.opacity * 100;
				
			//console.log(boxBgImage);
            //alert(boxBgPositionY);
			// if it is not positioned then set to position relative
			if (this.el.css("position") != "absolute" && this.el.css("position") != "relative")
			{
                this.el.css({"position" : "relative", "background" : "none"});
			
			}
         
			// create the ned container for the content
			this.el.wrapInner("<div style='height:100%; width:100%; z-index:2; position:relative'></div>");
			// add a new background to the box
			this.el.prepend("<div class=" + this.opts.pngClass + " style='height:" + boxHeight + "px; width:" + boxWidth + "px; background-color:" + boxBgColor + "; background-image:" + boxBgImage + "; background-position:" + boxBgPosition + "; background-position-x:" + boxBgPositionX + "; background-position-y:" + boxBgPositionY + "; background-repeat:" + boxBgRepeat + "; opacity:" + this.opts.opacity + "; filter: alpha(opacity = " + IEopacity + "); position:absolute; top:0; left:0; z-index:1'></div>");
			
			// if browser is ie6 and pngFix is set to true then run DD_BelatedPNG script
			if($.browser.msie && $.browser.version == "6.0" && this.opts.pngFix === true)
			{
				if (window.DD_belatedPNG)
				{
					DD_belatedPNG.fix("." + this.opts.pngClass);
				}
			}
				
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
	$.fn.opacity = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "opacity",
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
					$.data(this, pluginName, new $.Opacity(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
