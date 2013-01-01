/* 
	jQuery Window Resizer Plugin 
	Copyright (c) 2011 Daniel Thomson
	https://github.com/dansdom/plugins-window-resizer
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// v 1.0 - basic functionality
// v 2.0 - refactored for new architecture

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
		
	// Plugin namespace definition
	$.WindowResize = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "WindowResizer";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.WindowResize.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.WindowResize.settings = {
		sizes		: 	{
			240:400,
			320:480,
			480:800,
			640:360,
			768:480,
			992:600,
			1024:800,
			1152:768,
			1382:768,
			1600:1024,
			1920:1080
		},
		controlID	: "resizeControls",
		index		: 0,
		loopDelay	: 5000,
        bodyOverflow: true, 
        controlBtns	: true,  // will add choice of turning these off
        resizeInput	: true,  // will add choice of turning these off		
        playBox		: true   // will add choice of turning these off   
	};
	
	// plugin functions go here
	$.WindowResize.prototype = {
		init : function() {
			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var myObject = this;
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			this.el.loopTimer = 0;
			
			// if controls exists already then destroy them
			$("#" + this.opts.controlID).remove();
			
			// set overflow value
			if (this.opts.bodyOverflow == false)
			{
				$("body").css("overflow","hidden");
			}
			else
			{
				$("body").css("overflow","auto");
			}
			
			this.el.controls = this.createControls();
			
			// add to the dom and style the control box
			this.addBox();
			
			// put the box into the DOM and bind all the controls
			this.bindControls();
				
		},
		// create the markup for the controls
		createControls : function()
		{
			this.el.controlBox = '<div id="' + this.opts.controlID + '"><div class="controlWrap">';
			var	controlBtns = '',
				controlText = '',
				playBox = '',
				closeBtn = '',
				miniBar = '';
				
			
			// if control buttons are on
			if (this.opts.controlBtns)
			{
				controlBtns = '<div class="controlBtns">';
				// loop through the options and add a controller for each one			 
				for (var i in this.opts.sizes)
				{
					// do something here
					if (this.opts.sizes.hasOwnProperty(i))
					{
						//console.log(i+" -> " +opts.sizes[i]);
						controlBtns += '<input type="button" value="'+ i + ' x ' + this.opts.sizes[i] + '" name="'+ i + 'x' + this.opts.sizes[i] + '" class="resizeBtn" />';
					}
				}
				controlBtns += '</div>';
			}
	
			// if input form is turned on
			if (this.opts.resizeInput)
			{
				// add text inputs to allow resize on the fly
				var controlText = '<div class="resizeInput"><ul><li><label>Height</label><input type="text" size="20" class="windowWidth" /></li><li><label>Width</label><input type="text" size="20" class="windowHeight" /></li><li><input type="button" value="GO!" class="customSize" /></li></ul></div>';
				//console.log(controlText);
			}
			
			// if play controls are turned on
			if (this.opts.playBox)
			{
				// slideshow buttons html
				var playBox = '<div class="playBox"><div class="wrap"><input type="button" value="previous" class="prev" /><input type="button" value="next" class="next" /><input type="button" value="start player" class="start" /><input type="button" value="stop player" class="stop" /></div></div>';
			}
			
			// close button html
			var closeBtn = '<div class="closeBtn"><a href="#" class="close">close</a><a href="#" class="min">minimise</a></div>';
			
			// minified control bar
			var miniBar = '<div class="controlWrapMin"><a href="#" class="max">Maximise</a></div>';
			
			// putting it all together
			this.el.controlBox += controlBtns + controlText + playBox + closeBtn + '</div>' + miniBar +'</div>';
			//console.log(controlBox);
			return this.el.controlBox;
		},
		addBox : function()
		{
			// add the control buttons to the document 
			$("body").append(this.el.controls);
			$("#" + this.opts.controlID).slideDown(200);
			//$("#resizeControls .resizeBtn:eq("+opts.index+")").addClass("btnActive");
			// add event handling for closing box        
		},
		bindControls : function()
		{
			var resizer = this;
			// bind the button events
			
			$("#" + resizer.opts.controlID + " .resizeBtn").each(function(){
				$(this).bind('click.' + this.namespace, function() {
					// find the x and y values on the button and then pass that to the window resize fundtion
					// break string up here
					var value = $(this).attr("name"),
						valuePair = value.split("x"),
						//console.log(valuePair);
						x = valuePair[0],
						y = valuePair[1];
						
					//console.log(value);
					
					//console.log("x "+x);
					//console.log("y "+y);
					x = parseFloat(x);
					y = parseFloat(y);
					resizer.resize(x,y);
					$(".resizeBtn").removeClass("btnActive");
					$(this).addClass("btnActive");
					// get the index of this button and change the global variable to match - opts.index
					//var thisItem = $(this).parent();
					resizer.opts.index = $(this).parent().children().index(this);
					return false;
				});
			});	
			
			$("#" + resizer.opts.controlID + " .customSize").bind('click.' + resizer.namespace, function(){
				var x = parseFloat($(".windowWidth").attr("value")),
					y = parseFloat($(".windowHeight").attr("value"));
					
				//console.log("x: "+x+", y: "+y);
				// test whether the inputs are numbers > 0
				if ((!isNaN(x) || !isNaN(y)) && (x > 0 && y > 0))
				{
					resizer.resize(x,y); 
				}
				else
				{
					//console.log("something is not a number or 0");
					alert("you need a number greater than 0");
				}
				return false;
			});
	
			$("#" + resizer.opts.controlID + " .next").bind('click.' + resizer.namespace, function(){
				clearTimeout(resizer.el.windowResize.loopTimer);
				// find next active button
				resizer.selectActiveEl(1);
				return false;
			});
			
			$("#" + resizer.opts.controlID + " .prev").bind('click.' + resizer.namespace, function(){
				clearTimeout(resizer.el.loopTimer);
				resizer.selectActiveEl(-1);
				return false;
			});
			
			$("#" + resizer.opts.controlID + " .start").bind('click.' + resizer.namespace, function(){
				$(this).addClass("startActive");
				resizer.startLoop(resizer.opts.loopDelay);
				return false;
			});
			
			$("#" + resizer.opts.controlID + " .stop").bind('click.' + resizer.namespace, function(){
				$(".startActive").removeClass("startActive");
				resizer.stopLoop();
				return false;
			});
			
			$("#" + resizer.opts.controlID + " .close").bind('click.' + resizer.namespace, function(){
				$("#" + resizer.opts.controlID ).slideUp(200, function(){$(this).remove();});
				return false;
			});
			
			$("#" + resizer.opts.controlID + " .min").bind('click.' + resizer.namespace, function(){
				$("#" + resizer.opts.controlID + " .controlWrapMin").css("display","block");
				// hide the rest of the control bar
				$("#" + resizer.opts.controlID + " .controlWrap").css("display","none").parent().addClass("noBG");
			});
			
			$("#" + resizer.opts.controlID + " .max").bind('click.' + resizer.namespace, function(){
				$("#" + resizer.opts.controlID + " .controlWrapMin").css("display","none");
				// open up the control bar
				$("#" + resizer.opts.controlID + " .controlWrap").css("display","block").parent().removeClass("noBG");
			});
			
			$(document).bind('keydown.' + resizer.namespace, function(e) 
			{
				
				if (e.keycode == 77)
				{
					   // toggle min and max buttons
					   if ($("#" + resizer.opts.controlID).hasClass("noBG"))
					   {
							// click on the maximise button
							$("#" + resizer.opts.controlID + " .controlWrapMin").css("display","none");
							$("#" + resizer.opts.controlID + " .controlWrap").css("display","block").parent().removeClass("noBG");
					   }
					   else
					   {
							// else click on the minimise button
							$("#" + resizer.opts.controlID + " .controlWrapMin").css("display","block");
							$("#" + resizer.opts.controlID + " .controlWrap").css("display","none").parent().addClass("noBG");
					   }
				}
				else if (e.keycode == 37)  // left arrow
				{
					clearTimeout(resizer.loopTimer);
					resizer.selectActiveEl(-1);
				}
				else if (e.keycode == 39)  // right arrow
				{
					clearTimeout(resizer.loopTimer);				
					resizer.selectActiveEl(1);
				}
			});
		},
		selectActiveEl : function(i)
		{
			// select the next resolution
			var loopLength = $(".resizeBtn").length,
				currentItem = $(".btnActive"),
				index = $(currentItem).parent().children().index(currentItem);
				
			//console.log(index);
			//alert("loop: "+loopLength);
			index = index + i; 
			//alert("index: "+index);
			if (index < 0)
			{
				index = (loopLength - 1);
				//alert("hit low");
			}
			if (index > (loopLength-1))
			{
				index = 0;
				//alert("hit high");
			}
			//alert(index);
			// simulate a click event on the button of this resolution
			$(".controlBtns .resizeBtn:eq("+index+")").trigger('click.' + this.namespace);
		},
		startLoop : function(delay)
		{
			var resizer = this;
			//console.log("hit timer, delay: "+delay);
			this.el.loopTimer = setTimeout(function(){resizer.selectActiveEl(1);resizer.startLoop(delay);},delay);
		},
		stopLoop : function()
		{
			clearTimeout(this.el.loopTimer);
		},
		resize : function(w,h)
		{
			console.log(w+" "+h);
			var innerX,
				innerY,
				adjustedX,
				adjustedY,
				availW = screen.availWidth,
				availH = screen.availHeight;
	
			// size the browser to full size and then find difference between inner and outer sizes
			window.moveTo(0,0);
			
			window.resizeTo(availW,availH);
			
			// find inner height of browser. Wow this got hacky, not my code. jQuery probably already does this - leaving for now, will get back to it
			if (self.innerHeight) // all except Explorer
			{
				innerX = self.innerWidth;
				innerY = self.innerHeight;
			}
			else if (document.documentElement && document.documentElement.clientHeight)// Explorer 6 Strict Mode
			{
				innerX = document.documentElement.clientWidth;
				innerY = document.documentElement.clientHeight;
			}
			else if (document.body) // other Explorers
			{
				innerX = document.body.clientWidth;
				innerY = document.body.clientHeight;
			}
			
			// get inner width and add the difference
			adjustedX = w + (availW - innerX);
			adjustedY = h + (availH - innerY);
			//console.log("adjustedX: " + adjustedX);
			//console.log("adjustedY: " + adjustedY);
			
			// not sure I need the first resize here
			window.resizeTo(w, h);
			// size window to new adjusted dimensions
			window.resizeTo(adjustedX, adjustedY);
	
			// sets the height and width of the body to the new resolution and overflow properties if needed
			//$("body").css({"width":w+"px","height":h+"px"}); - don't need this, css should take care of these things
			if (this.opts.bodyOverflow == false)
			{
				$("body").css("overflow","hidden");
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
	$.fn.windowResize = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "windowResizer",
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
					$.data(this, pluginName, new $.WindowResize(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
