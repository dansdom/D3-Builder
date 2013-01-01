/* 
	jQuery Dynamic Nav Plugin - v2.0  
	Copyright (c) 2011 Daniel Thomson
	https://github.com/dansdom/plugins-dnav
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// creates a dynamic nav for floated elements that exceed the width of its container
// version 1.0 - basic fnctionality
// version 2.0 - integrated new architecture: https://github.com/dansdom/plugins-template-v2

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.DynamicNav = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "testPlugin";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.DynamicNav.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.DynamicNav.settings = {
		arrowWidth : 30,
		navPrev : ".prev",
		navNext : ".next",
		anchorX :  0,
		anchorY : 0,
		disabled : "disabled",
		speed : 500
	};
	
	// plugin functions go here
	$.DynamicNav.prototype = {
		init : function() {
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();

			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var nav = this;
			
			this.navControls = false;
			
			// get the selector for the next and prev buttons	
			// console.log(opts.navPrev);		
			var prevSelector = this.getEl(this.opts.navPrev),
				nextSelector = this.getEl(this.opts.navNext);
						
			// add the previous and next buttons
			this.el.parent().prepend("<a href='#' "+prevSelector.type+"='"+prevSelector.text+"' style='display:none'>prev</a>").append("<a href='#' "+nextSelector.type+"='"+nextSelector.text+"' style='display:none'>next</a>");
			// add css to the ul
			this.el.parent().css({"overflow":"hidden", "position":"relative"});
			this.el.find("li").css({"float" : "left","display" : "block"});
			
			this.create();
			
			$(window).resize(function(){
				nav.create();
			});
			
		},
		create : function()
		{
			// got some anonymous functions here
			var nav = this;
			// get dimensions of the nav
			this.el.navWidth = this.el.parent().width();
			this.el.ulWidth = 0;
			// controls are currently not displaying
			
			// add the control buttons to the nav		
			this.el.prev = $(this.opts.navPrev);
			this.el.next = $(this.opts.navNext);
			// style the nav arrows
			this.el.prev.css({
							"position" : "absolute",
							"top" : this.opts.anchorY + "px",
							"left" : this.opts.anchorX + "px",
							"width" : this.opts.arrowWidth + "px",
							"z-index" : "2"
						});
			this.el.next.css({
							"position" : "absolute",
							"top" : this.opts.anchorY + "px",
							"right" : this.opts.anchorX + "px",
							"width" : this.opts.arrowWidth + "px",
							"z-index" : "2"
						});
			this.el.arrowWidth = this.opts.arrowWidth * 2;
			this.el.find("li").each(function(){
				nav.el.ulWidth += $(this).outerWidth();		
			});
			this.el.ulWidth += this.el.arrowWidth;
			
			// console.log("ulWidth: "+nav.ulWidth+", navWidth: "+nav.navWidth+", arrowWidth: "+nav.arrowWidth+", nav controls: "+nav.navControls);
			// decide whther to make or remove the controls
			if (this.el.ulWidth > this.el.navWidth)
			{
				this.makeControls();
				//console.log("making controls");
			}		
			else if (this.el.ulWidth <= (this.el.navWidth + this.el.arrowWidth) && this.el.navControls == true)
			{
				this.removeControls();
				//console.log("removing controls");
			}				
		},
		// gets the element selector class/id and the value
		getEl : function(selector)
		{
			var selectorArray = selector.split(' '),
				elSelector = selectorArray[selectorArray.length - 1],
				// find if it's an id or class
				theType = elSelector.charAt(0),
				// get the selector text
				theText = elSelector.substring(1),
				el = {};
			
			if (theType == ".")
			{
				el.type = "class";
			}
			else if (theType == "#")
			{
				el.type = "id";
			}
			el.text = theText;
			return el;
		},
		makeControls : function()
		{
			// got some anonymous functions here
			var nav = this;
			this.el.navControls = true;
			// will target the nav object specifically here		
			this.el.prev.css("display","block").unbind().addClass(this.opts.disabled);
			this.el.next.css("display","block").unbind().removeClass(this.opts.disabled);		
			// style the list
			this.el.css({
				"padding-left"	: this.opts.arrowWidth + "px",
				"padding-right" : this.opts.arrowWidth + "px",
				"position"		: "absolute",
				"top"			: "0px",
				"left"			: "0px",
				"width"			: this.el.ulWidth + "px",
				"z-index"		: "1"
			}); 
			// set the animation point to 0
			this.el.animationPoint = 0;
			// set the nav counter to 0
			this.el.counter = 0;		
			
			this.el.prev.bind('click.' + this.namespace, function()
			{
				nav.el.stop(true, true);
				var leftPos = parseInt(nav.el.css("left")),
					firstWidth = nav.el.children("li:eq(0)").outerWidth();	
					
				// find the next animation point
				nav.el.next.removeClass(nav.opts.disabled);			
				// find next animation point
				nav.el.animationPoint = leftPos + nav.el.children("li:eq("+(nav.el.counter-1)+")").outerWidth();
				
				if (nav.el.animationPoint >= 0)
				{
					nav.el.animate({"left":"0px"});
					nav.el.counter = 0;			
					$(this).addClass("disabled");
					// console.log(nav.counter);
				}
				else
				{
					// then animate to the prev position
					nav.el.animate({"left" : nav.el.animationPoint + "px"}, nav.opts.speed);
					nav.el.counter--;
					if (nav.el.counter < 0)
					{
						nav.el.counter = 0;
					}
					// console.log(nav.counter);			
				}
				return false;		
			});
			
			this.el.next.bind('click.' + this.namespace, function()
			{
				nav.el.stop(true, true);
				var nextWidth = nav.el.children("li:eq(" + nav.el.counter + ")").outerWidth(),
					lastWidth = nav.el.children("li:last").outerWidth(),
					leftPos = parseInt(nav.el.css("left")), // left position of the list
					widthDiff = nav.el.navWidth - nav.el.ulWidth; // different between the ul length and the tabs length
					
				nav.el.animationPoint = leftPos - nav.el.children("li:eq(" + nav.el.counter + ")").outerWidth();		
			
				
				nav.el.prev.removeClass(nav.opts.disabled);
				// I think checking the last width might be a mistake. might have to check the counter item width??
				var counterItemWidth = nav.el.children("li:eq(" + nav.el.counter + ")").outerWidth();
				if (nav.el.animationPoint > (widthDiff - counterItemWidth))
				{
					// check the next navigation point and decide if this is the last or not
					var nextAnimationPoint = leftPos - nav.el.children("li:eq(" + (nav.el.counter + 1) + ")").outerWidth() - nav.el.children("li:eq(" + nav.el.counter + ")").outerWidth();
					var nextCounterItemWidth = nav.el.children("li:eq(" + (nav.counter + 1) + ")").outerWidth();
					if (nextAnimationPoint < (widthDiff - nextCounterItemWidth))
					{
						$(this).addClass(nav.opts.disabled);
					}
					// then animate to the next position			
					nav.el.animate({"left" : nav.el.animationPoint + "px"}, nav.opts.speed);
					nav.el.counter++;
					// console.log(nav.counter);											
				}
				else
				{			
					// end of the LIST!
					nav.el.animationPoint = -widthDiff;			
					// add disabled class to the button			
					$(this).addClass(nav.opts.disabled);
					// console.log(nav.counter);
				}
				// I need to check for the next animation point so that I can assign the disabled class as I reach the end.
				// console.log("clicked next");
				return false;
			});
			
		},
		// removes the controls from the page and unbinds the events on them
		removeControls : function()
		{
			this.el.navControls = false;
			this.el.next.unbind("." + this.namespace).css("display","none");	
			this.el.prev.unbind("." + this.namespace).css("display","none");	
			this.el.css({
				"position"	: "static",
				"padding"	: "0px",
				"left"		: "0",
				"right"		: "0"
			});			
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
	$.fn.Dnav = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "dynamicNav",
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
					$.data(this, pluginName, new $.DynamicNav(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
