/*
	jQuery Carousel Plugin
	Copyright (c) 2011 Daniel Thomson
	https://github.com/dansdom/plugins-carousel
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// version 1.1 - just a bit of optimisation of the code here, no functional changes
// version 1.2 - added new option to start at a nominated position
// version 1.3 - added option to declare a css selector for the scroll pane this will enable the HTML structure to be more flexible. If this value is false then HTML structure has to be precise
// version 1.4 - modified the extend method to create a new object 'opts' that doesn't destroy the settings object. I will think about creating an 'opts' method so that the settings can be modified outside of the script
// version 1.5 - bug fixing and JSLint, optimised code and compacted all function 'var' statements
// version 1.6 - added options to have the carousel on a continual rotation (either forward or backward - forward by default) -  I have made it to work only if circular = true
// version 1.7 - added functionality to show a representation of the active elements in the carousel
// version 1.8 - fixed bug when controlPane is set to false, next/prev button not showing correct postion when control list has been defined. Took out the controlPane option altogether
// version 1.9 - added option to use the arrow keys to cntrol the movement of the carousel
//				 the javascript runs fine whether its set or not
// version 2.0 - refactored the script to use the new plugin architecture https://github.com/dansdom/plugins-template-v2

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.Carousel = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "carousel";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.Carousel.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.Carousel.settings = {
		'itemWidth' : 50,				// item width
		'itemHeight' : 80,				// item height
        'scrollNext': '.next',			// class of the next button
        'scrollPrev': '.prev',			// class of the previous button
        'scrollPane': false,			// choose the name of the scrollPane - if false then walk the DOM
        'scrollSpeed': '1000',			// speed at which the carousel scrolls
        'scrollNum': 5,					// how many items the carousel scrolls
        'scrollVisible': 3,				// how many items are visible in the carousel
        'circular': false,				// will carousel scroll back to the beginning of the list when it is at the end
        'vertical': false,				// is the carousel vertical or horizontal scrolling?
        'startPoint': 0,				// choose the scroll number which the carousel starts on, 0 is default (nothing), 1 is the first item
        'rotating': false,				// rotates the carousel continually
        'rotatingSpeed': 2000,			// speed at which the carousel continually rotates
        'rotatingDirection': 'forward',	// rotation direction
        'rotatingPause' : 5000,			// pause between rotation
        'controlList' : '.controller',	// choose the control list selector
		'arrowControls' : false			// allow arrows to control the carousel
	};
	
	// plugin functions go here
	$.Carousel.prototype = {
		init : function() {
			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var container = this;
			
			
			/////////////////////////
			// start plugin stuff  //
			/////////////////////////
			// do pluging stuff here
			// *** declare object variables here: ***
			// each box calling the plugin now has the variable name: container
			this.el.counter = 1;

			// allows user to set scrollPane
			if (this.opts.scrollPane)
			{
				this.el.scrollPane = $(this.opts.scrollPane);
			}
			else
			{
				this.el.scrollPane = this.el.children("div");
			}
			// define the list and it's size
			this.el.theList = this.el.scrollPane.children("ul");
			this.el.carouselSize = this.el.theList.children("li").size();
			// declare the control list
			this.el.controlList = $(this.opts.controlList);
			// setup carousel tail before adding style and event handling
			if (this.opts.circular === true)
			{
				container.addTail();
            }
            
            // define the list and container item width and height
            this.el.listItems = this.el.theList.children("li");
			this.el.itemWidth = this.opts.itemWidth;
			this.el.itemHeight = this.opts.itemHeight;
			this.el.scrollNum = this.opts.scrollNum;
			this.el.carouselWidth = this.el.carouselSize * this.el.itemWidth;
			this.el.carouselHeight = this.el.carouselSize * this.el.itemHeight;

            // set the scroll length based on height or width of list item
			if (this.opts.vertical === true)
			{
				this.el.itemDimension = this.el.itemHeight;
			}
			else
			{
				this.el.itemDimension = this.el.itemWidth;
			}
			this.el.scrollLength = this.el.scrollNum * this.el.itemDimension;

			this.el.scrollNext = $(this.opts.scrollNext);
			this.el.scrollPrev = $(this.opts.scrollPrev);
			this.el.scrollVisible = this.opts.scrollVisible;
			this.el.scrollPos = 0;


			//  *** stlye carousel ***
			this.styleList();

			// check start point and adjust accordingly
            this.setStartPos();
               
            //console.log(this.el.counter);

            // set up rotating functionality. check that all the options that are needed are in place for it
			if (this.opts.rotating === true && this.opts.circular === true)
			{
                // start the rotation
                this.el.rotateTimer = 0;
                this.rotation();
            }
               
            // if there is a control pane then change control pane state here
			this.controlListState();

			//  *** navigation functions here: ***
			$(this.opts.scrollNext).bind('click.' + this.namespace, function()
			{
				//  *** find the left/top scroll position of the carousel ***
				container.findScrollPos("next");

				//  *** find if at end position ***
				if (container.opts.circular === false)
				{
				    container.findEndPos("next");
				}
				else
				{
					container.findEndPosCircular("next");
				}

				// note: took out if statement to test if control pane is set, just running function and will work - no need for the option anymore
                container.controlListState();

				//  *** animate ul to correct position ***
				container.animateList();

				// find next animation stop point
				container.el.animationEnd = container.el.scrollPos;

                // if the carousel is on a timer then clear the timeout and then set it again at the end of the animation
				if (container.opts.rotating === true)
				{
                    clearTimeout(container.el.rotateTimer);
                    container.el.rotateTimer = setTimeout(function(){container.rotation();}, container.opts.rotatingPause);
                }

				return false;
			});

			$(this.opts.scrollPrev).bind('click.' + this.namespace, function()
			{
				//  *** find the left/top scroll position of the carousel ***
				container.findScrollPos("prev");

				//  *** find if at end position ***
				if (container.opts.circular === false)
				{
				    container.findEndPos("prev");
				}
				else
				{
					container.findEndPosCircular("prev");
				}

				// note: took out if statement to test if control pane is set, just running function and will work - no need for the option anymore
                container.controlListState();

				//  *** animate ul to correct position ***
				container.animateList();

				// find next animation stop point
				container.el.animationEnd = container.el.scrollPos;

                // if the carousel is on a timer then clear the timeout and then set it again at the end of the animation
				if (container.opts.rotating === true)
				{
                    clearTimeout(container.el.rotateTimer);
                    container.el.rotateTimer = setTimeout(function(){container.rotation();}, container.opts.rotatingPause);
                }

				return false;
			});
			
			// add arrow events
			if (this.opts.arrowControls == true)
			{
				$(document).bind('keydown.' + this.namespace, function(e)
				{
					if (e.keyCode == '39')
					{
						container.el.find(container.opts.scrollNext).click(); 
					}
					if (e.keyCode == '37')
					{
						container.el.find(container.opts.scrollPrev).click();
					}
				});
			}


			// control list navigation functions
			container.el.controlList.children().bind('click.' + this.namespace, function()
			{
                // find the index of clicked item
                var controlIndex = $(this).parent().children().index($(this)) + 1,
                    oldCount = container.el.counter;

                // set a new counter position
                container.el.counter = controlIndex;

                // if there is a control pane then change control pane state here
				container.controlListState();

				// need to animate the carousel with the new index from the control list
				// set the new scroll position and then findthe end points as per next and prev button
				container.setControlMovement(controlIndex, oldCount);

				//  *** animate ul to correct position ***
				container.animateList();
				
				// find next animation stop point
				container.el.animationEnd = container.el.scrollPos;
				
				// if the carousel is on a timer then clear the timeout and then set it again at the end of the animation
				if (container.opts.rotating === true)
				{
                    clearTimeout(container.el.rotateTimer);
                    container.el.rotateTimer = setTimeout(function(){container.rotation();}, container.opts.rotatingPause);
                }
            });

			/////////////////////////
			// end of plugin stuff //
			/////////////////////////
			
			
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			
			
		},
		option : function(args) {
			this.opts = $.extend(true, {}, this.opts, args);
		},
		//////////////////////////////////////////////
		// set the start position of the carousel   //
		//////////////////////////////////////////////
		setStartPos : function()
		{
			 var multiplier,
				 actualStart,
				 startPosition;
			 if (this.opts.startPoint !== 0)
			 {
				// see if counter is larger than carouselSize and then set the actual starting position if carousel is circular
				if (Math.abs(this.opts.startPoint) > this.el.carouselSize && this.opts.circular === true)
				{
					// trim startPoint
					if (this.opts.startPoint > 0)
					{
						multiplier = Math.floor(this.opts.startPoint / this.el.carouselSize);
						actualStart = this.opts.startPoint - (this.el.carouselSize * multiplier);
					}
					else
					{
						multiplier = Math.ceil(this.opts.startPoint / this.el.carouselSize);
						actualStart = (this.opts.startPoint - (this.el.carouselSize * multiplier)) + this.el.carouselSize;
					}
				}
				// if starting point is outside the range of a linear carousel
				else if ((this.opts.startPoint > this.el.carouselSize || this.opts.startPoint < 0) && this.opts.circular === false)
				{
					actualStart = 1;
					//alert("starting position is outside the carousel range. Please set /'startPoint/' ");
				}
				// if its inside the range of the carousel
				else
				{
					if (this.opts.startPoint > 0)
					{
						actualStart = this.opts.startPoint;
					}
					else
					{
						actualStart = this.opts.startPoint + this.el.carouselSize;
					}
				}
	
				// set new scrollPos
				this.el.counter = actualStart;
				// set the start position in pixels
				if (this.opts.circular === true)
				{
					startPosition = ((this.el.counter + this.el.scrollVisible) * this.el.itemDimension) - this.el.itemDimension;
				}
				else
				{
					if (this.el.counter > (this.el.carouselSize - this.el.scrollVisible))
					{
						this.el.counter = this.el.carouselSize - this.el.scrollVisible + 1;
						$(this.opts.scrollNext).addClass("disabled");
					}
					if (this.el.counter > 1)
					{
						$(this.opts.scrollPrev).removeClass("disabled");
					}
					startPosition = (this.el.counter * this.el.itemDimension) - this.el.itemDimension;
				}
	
				// set css position of the ul
				if (this.opts.vertical === true)
				{
					this.el.theList.css("top", -startPosition + "px");
				}
				else
				{
					this.el.theList.css("left", -startPosition + "px");
				}
				// set position variables for the carousel
				this.el.scrollPos = -startPosition;
				this.el.animationEnd = this.el.scrollPos;
			}
		},
		////////////////////////////////////////////////
		// find where the carousel is scrolling to    //
		////////////////////////////////////////////////
		// find out whether carousel has reached the end
		findEndPos : function(direction)
		{
			// forward motion
			if (direction == "next")
			{
				// check to see if carousel is going to scroll to the end of the list
				if (this.opts.scrollVisible + this.el.counter + this.el.scrollNum > this.el.carouselSize)
				{
					if (this.opts.vertical === false)
					{
						this.el.theList.css("left", this.el.animationEnd);
					}
					this.el.scrollPos = (this.opts.scrollVisible * this.el.itemDimension) - (this.el.carouselSize * this.el.itemDimension);
					$(this.opts.scrollNext).addClass("disabled");
					this.el.counter = (this.el.carouselSize - this.opts.scrollVisible) + 1;
				}
				   // otherwise just scroll to the next position
				else
				{
					this.el.counter = this.el.counter + this.el.scrollNum;
				}
				$(this.opts.scrollPrev).removeClass("disabled");
			}
			// backward motion
			else
			{
				// see if carousel is going to scroll past the start
				if (this.el.counter <= this.el.scrollNum)
				{
					this.el.scrollPos = 0;
					this.el.counter = 1;
				 }
				 // else scroll to the previous position
				 else
				 {
					 this.el.counter = this.el.counter - this.el.scrollNum;
				 }
				 $(this.opts.scrollNext).removeClass("disabled");
				 if (this.el.counter == 1)
				 {
					 $(this.opts.scrollPrev).addClass("disabled");
				 }
			}
		},
		// Find out if carousel movement is going into the tail if circular
		findEndPosCircular : function(direction)
		{
			var resetPos;
			if (direction == "next")
			{
				if ((this.el.counter + this.el.scrollNum) > this.el.carouselSize)
				{
					this.el.counter = this.el.counter - this.el.carouselSize;
					resetPos = this.el.scrollPos + ((this.el.carouselSize + this.el.scrollNum) * this.el.itemDimension);
					this.el.scrollPos = resetPos - this.el.scrollLength;
					if (this.opts.vertical === false)
					{
						this.el.theList.css("left", resetPos);
					}
					else
					{
						this.el.theList.css("top", resetPos);
					}
				}
				this.el.counter = this.el.counter + this.el.scrollNum;
			}
			else
			{
				if (this.el.counter < 1)
				{
					this.el.counter = this.el.counter + this.el.carouselSize;
					resetPos = this.el.scrollPos - ((this.el.carouselSize + this.el.scrollNum) * this.el.itemDimension);
					this.el.scrollPos = resetPos + this.el.scrollLength;
					if (this.opts.vertical === false)
					{
						this.el.theList.css("left", resetPos);
					}
					else
					{
						this.el.theList.css("top", resetPos);
					}
				}
				this.el.counter = this.el.counter - this.el.scrollNum;
			}
		},
		///////////////////////////////////////////////////////////
		// find carousel current position                        //
		///////////////////////////////////////////////////////////
		findScrollPos : function(direction)
		{
			if (this.opts.vertical === false)
			{
				// stop previous animtation running first
				this.el.theList.stop();
				this.el.theList.css("left", this.el.animationEnd);
				var leftPos = parseInt(this.el.theList.css("left"), 10);
				if (direction == "next")
				{
					this.el.scrollPos = leftPos - this.el.scrollLength;
				}
				else
				{
					this.el.scrollPos = leftPos + this.el.scrollLength;
				}
			}
			else
			{
				// stop previous animtation running first
				this.el.theList.stop();
				this.el.theList.css("top", this.el.animationEnd);
				var topPos = parseInt(this.el.theList.css("top"), 10);
				if (direction == "next")
				{
					this.el.scrollPos = topPos - this.el.scrollLength;
				}
				else
				{
					this.el.scrollPos = topPos + this.el.scrollLength;
				}
			}
		},
		/////////////////////////////////////////////////////////
		// animate carousel                                    //
		/////////////////////////////////////////////////////////
		animateList : function()
		{
			if (this.opts.vertical === false)
			{
				this.el.theList.animate({left : this.el.scrollPos}, this.opts.scrollSpeed);
			}
			else
			{
				this.el.theList.animate({top : this.el.scrollPos}, this.opts.scrollSpeed);
			}
		},
		/////////////////////////////////////////////////////////////////////
		// set the movement of the carousel using the control list         //
		/////////////////////////////////////////////////////////////////////
		setControlMovement : function(newPosition, oldPosition)
		{
			// this will set a new animation movement based on the control list
			// goal - find the carousel.scrollPos
			var itemDimension,
				overflow;
			// find the item dimension for scrolling
			if (this.opts.vertical === true)
			{
				itemDimension = this.opts.itemHeight;
			}
			else
			{
				itemDimension = this.opts.itemWidth;
			}
			/// set disabled states for non circular carousel
			if (this.opts.circular === false)
			{
				if (newPosition > 1)
				{
					$(this.opts.scrollPrev).removeClass("disabled");
				}
				if (newPosition <= 1)
				{
					$(this.opts.scrollPrev).addClass("disabled");
				}
				if (newPosition <= (this.el.carouselSize - (this.el.scrollVisible)))
				{
					$(this.opts.scrollNext).removeClass("disabled");
				}
				if (newPosition > (this.el.carouselSize - (this.el.scrollVisible)))
				{
					$(this.opts.scrollNext).addClass("disabled");
				}
			}
	
			// if the new position is at the end of the non-circular carousel then stop at last visible place
			if (newPosition > (this.el.carouselSize - (this.el.scrollVisible - 1)) && this.opts.circular === false)
			{
				newPosition = this.el.carouselSize - (this.el.scrollVisible - 1);
				this.el.counter = this.el.carouselSize - (this.el.scrollVisible - 1);
				this.el.controlList.children(":gt(" + (newPosition-2) + ")").addClass("active");
			}
			// set new scroll position
			var controlScroll = (newPosition - oldPosition) * itemDimension;
			//console.log("scroll: "+controlScroll+", scrollLength: "+itemDimension);
			this.el.scrollPos = this.el.scrollPos - controlScroll;
		},
		/////////////////////////////////////////////////////////////////////
		// auto rotate function to set continual movement of carousel      //
		/////////////////////////////////////////////////////////////////////
		rotation : function()
		{
			// define container for the anonymous functions here
			var container = this;
			this.el.rotateTimer = setTimeout(function(){container.rotation();}, (this.opts.rotatingSpeed + this.opts.rotatingPause));
			// set up carousel timer
			if (this.opts.rotatingDirection === "forward")
			{
				this.findScrollPos("next");
				//  *** find if at end position ***
				this.findEndPosCircular("next");
				// find next animation stop point
				this.el.animationEnd = this.el.scrollPos;
				//  *** animate ul to correct position ***
				if (this.opts.vertical === false)
				{
					this.el.theList.animate({left : this.el.scrollPos}, this.opts.rotatingSpeed);
				}
				else
				{
					this.el.theList.animate({top : this.el.scrollPos}, this.opts.rotatingSpeed);
				}
			 }
			 else if (this.opts.rotatingDirection === "backward")
			 {
				this.findScrollPos("prev");
				//  *** find if at end position ***
				this.findEndPosCircular("prev");
				// find next animation stop point
				this.el.animationEnd = this.el.scrollPos;
				//  *** animate ul to correct position ***
				if (this.opts.vertical === false)
				{
					this.el.theList.animate({left : this.el.scrollPos}, this.opts.rotatingSpeed);
				}
				else
				{
					this.el.theList.animate({top : this.el.scrollPos}, this.opts.rotatingSpeed);
				}
			 }
			 // if there is a control pane then change control pane state here
			this.controlListState();
		},
		//////////////////////////////////////////////////////////
		// if carousel is circular then add the tail to it      //
		//////////////////////////////////////////////////////////
		addTail : function()
		{
			for (var i=0; i < this.opts.scrollVisible; i++)
			{
				var lastIndex = "li:eq(" + (this.el.carouselSize-1) + ")",
					firstIndex = "li:eq(" + (i*2) + ")",
					appendage = this.el.theList.children(firstIndex).clone(),
					prependage = this.el.theList.children(lastIndex).clone();
	
				appendage.appendTo(this.el.theList);
				prependage.prependTo(this.el.theList);
			}
		},
		///////////////////////////////////////////////////
		// change control list state                     //
		///////////////////////////////////////////////////
		controlListState : function()
		{
			//console.log(container.counter);
			var controlLength = this.opts.scrollVisible,
				controlItems = this.el.controlList.children();
	
			controlItems.removeClass("active");        
			//console.group("list indexes");
			for (var i = 0; i < controlLength; i++)
			{
				var nextIndex = this.el.counter + i - 1;
				if (nextIndex >= controlItems.length && this.opts.circular === true)
				{
					nextIndex = nextIndex - controlItems.length;
				}
				if (nextIndex < 0)
				{
					nextIndex = this.el.carouselSize + nextIndex;
				}
				this.el.controlList.children(":eq(" + nextIndex + ")").addClass("active");
				//console.log("control length: "+controlLength);
			}
		},
		///////////////////////////////////////////////////
		// add css to the carousel                       //
		///////////////////////////////////////////////////
		styleList : function()
		{
			// style elements in the carousel
			var carouselWidth;
			
			this.el.css({
				position	: "relative"
			});
			this.el.scrollPane.css({
				position	: "relative",
				left		: "0px",
				overflow	: "hidden",
				"z-index"	: "2"
			});
			this.el.theList.css({
				"list-style-type"	: "none",
				margin				: "0px",
				padding				: "0px",
				position			: "relative",
				"z-index"			: "1",
				height				: this.el.carouselHeight + "px",
				width				: this.el.itemWidth + "px",
				left				: "0px",
				top					: "0px"
			});
			this.el.listItems.css({
				"float"		: "left",
				overflow	: "hidden",
				display		: "block",
				height		: this.el.itemHeight + "px",
				width		: this.el.itemWidth + "px"
			});
			carouselWidth = this.el.listItems * this.el.scrollVisible;
	
			if (this.opts.vertical === true)
			{
				// do css on carousel elements
				this.el.scrollPane.css({
					height	: this.el.itemHeight * this.el.scrollVisible + "px",
					width	: this.el.itemWidth + "px"
				});
				this.el.theList.css({
					height	: this.el.carouselHeight + "px",
					width	: this.el.itemWidth + "px"
				});
				// if circular then correct height and position for the tail
				if (this.opts.circular === true)
				{
					this.el.theList.css({
						top		: 0 - (this.el.scrollVisible * this.el.itemHeight) + "px",
						height	: this.el.carouselHeight + (this.el.scrollVisible * this.el.itemHeight * 2) + "px"
					});
				}
				// define the end of the animation to stop multiple animations running at once
				this.el.animationEnd = this.el.theList.css("top");
			}
			else
			{
				this.el.scrollPane.css({
					height	: this.el.itemHeight,
					width	: this.el.itemWidth * this.el.scrollVisible + "px"
				});
				this.el.theList.css({
					height	: this.el.itemHeight + "px",
					width	: this.el.carouselWidth + "px"
				});
				// if circular then correct width and position for the tail
				if (this.opts.circular === true)
				{
					this.el.theList.css({
						left	: 0 - (this.el.scrollVisible * this.el.itemWidth) + "px",
						width	: this.el.carouselWidth + (this.el.scrollVisible * this.el.itemWidth * 2) + "px"
					});
				}
				// define the end of the animation to stop multiple animations running at once
				this.el.animationEnd = this.el.theList.css("left");
			}
			if (this.opts.circular === false)
			{
				$(this.el.scrollPrev).addClass("disabled");
			}
			// carousel now styled!!!
		},
		destroy : function() {
			this.el.unbind("."+this.namespace);
		}
	};
	
	// the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
	// props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
	$.fn.carousel = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "carousel",
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
					$.data(this, pluginName, new $.Carousel(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
