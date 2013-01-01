/* 
	jQuery Popup Plugin 
	Copyright (c) 2011 Daniel Thomson
	https://github.com/dansdom/plugins-popup
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// release notes: version 1.0
// version 1.1  - added support for gallery on non img object, now it just has to have the gallery name in the title attribute
//			    - added option for image caption
//			    - added option for gallery counter
//			    - added a preloader image and option for image path
// version 1.2  - got sick of trying to support syncronised animations, turned the whole popup content into a table so that the brwoser could animate the table in one go.
// version 1.3 - modified the extend method to create a new object 'opts' that doesn't destroy the settings object. I will think about creating an
//				'opts' method so that the settings can be modified outside of the script
// version 1.4 - not finished - added support for transparency hack on IE6
// version 1.5 - not sure, I think it was a bit of validation with JsLint
// version 1.6 - removed transparent layer height bug if scroll Y > 0
//			   - added option to set the opacity of the transparent layer
//               - removed the $(window).unbind() method, seems not to be needed
// version 1.7 - added option to set overflow hidden off so that you can hang elements (namely the close button) outside the box
//				- added proper ajax loading
//				- added the option to fix the "top" or "left" position of the box.
//				- added the option to turn the close button off
// version 2.0 - refactored script to use new architecture: https://github.com/dansdom/plugins-template-v2
// version 2.1 - added callback functions For opening and closing the popup, fixed up a bunch of event handling too
//
//  TO DO:	make an option to allow the popup to move with page scrolling
//			add close box function
//			remove hasCloseBtn option - it's stupid and only used for one project
//
// level of error suppresion -> low
// This module is designed as a popup function to use whenever and wherever you might need a popup. call this module on any DOM element you wish like this:
// $(document).ready(function(){
//                       $(".yourClassNameHere").popup({
//					plugin : options,
//					go : here
//				})
//         });
//
//  You can link multiple popup items together to form a 'gallery'. to do this you need to set the option 'gallery' to true. Also you need to set
//  the title attribute of the DOM element to the gallery name that you want. All other DOM elements with the same class and title attribute will
//  be linked into the navigation structure of this gallery, and the title of this gallery will be displayed above the image in the popup box.
//  galllery navigation is also bound to the left and right arrow keys on the keyboard
//  the link to the popup goes onto the name attribute
//  You can also control the height and width of the navigation box and title box with the following options:
//  titleHeight, controlHeight
//
//  Other interesting options avaliable:
//  autoSize:                                    allows the box to expand and contract to the image size with an animation of the length: transition
//  centerOnResize:                              will center the popup when you resize the browser window
//  popupID, contentClass, closeBox:             allows custom classes and IDs for these DOM element just in case you need them for your application
//  shadowLength:                                the box itself has a structure around it to allow for custom drop shadows.
//                                               This value adjusts the size of this 'outer' layer of the box
//  boxWidth, boxHeight:                         Sets the dimensions of the box if autoSize is false, and if content node is not an image
//

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.Popup = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "popup";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.Popup.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.Popup.settings = {
		'transparentLayer'		: true,				// would you like a transparent layer underneath the popup?
		'transparentOpacity'	: 70,				// set the opacity percentage of the transparent layer
		'gallery'				: false,			// set true for navigation options between popups of the same title attribute
		'galleryCounter'		: false,			// add a counter for gallery
		'titleHeight'			: 30,				// height in pixels of the gallery title box
		'controlHeight'			: 40,				// height in pixels of the gallery navigation box
		'imageDesc'				: false,			// add a description box underneath the gallery image
		'autoSize'				: true,				// set whether the box with image in it will resize to the image size
		'boxWidth'				: 400,				// when autoSize is set to false, or no image then set the dimensions of the box in pixels
		'boxHeight'				: 300,				// when autoSize is set to false, or no image then set the dimensions of the box in pixels
		'centerImage'			: true,				// centers the image in a fixed size box
		'shadowLength'			: 42,				// set the width of the padding around the box for your drop shadows
		'transition'			: 500,				// transition speed from one box to the next
		'popupID'				: 'popupBox',		// custom class for the popup box
		'contentClass'			: 'popupContent',	// custom class for the popup content
		'closeBox'				: 'popupClose',		// class the close button has
		'hasCloseButton'		: true,				// set whether you want to be able to close the box or not	
		'centerOnResize'		: true,				// set whether the box centers itself when the browser resizes
		'loaderPath'			: 'loader.gif',		// file path to the loading image
		'overflow'				: 'visible',		// "hidden" or "visible", can set the css overflow attribute on or off
		'ajax'					: false,			// allows user to specify an ajax call to a resource
		'ajaxType'				: "text",			// jQuery needs the data type to be specified - http://api.jquery.com/jQuery.ajax/
		'fixedTop'				: false,			// false/integer : allow for the user to specify the top position of the popup
		'fixedLeft'				: false,			// false/integer : allow for the user to specify the left position of the popup
		'onOpen'				: function() {},	// call back function when the box opens
		'onClose'				: function() {}
	};
	
	// plugin functions go here
	$.Popup.prototype = {
		init : function() {
			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var popup = this;
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			// this is a flag to test if the popup is open. I will only call the close box function on those popup's that are currently open so that only one callback function is called at one time
			this.el.isOpen = false;
			
			// *** set content source and gallery title variables ***
            this.el.boxSrc = this.el.attr("name");
            // store DOM fragment as a variable
            this.el.fragment = $(this.el.boxSrc);
            if (this.opts.hasCloseButton)
            {
				this.el.closeBtn = '<a href="" class="' + this.opts.closeBox + '">close</a>';
            } 
            else
            {
				this.el.closeBtn = ''; 
            }
			
			$(this.el).bind('click.' + this.namespace, function()
			{
				//if (popup.el.isOpen === false)
				popup.openBox();
                return false;
            });
			
		},
		// ******  find the screen height and width measurements to position box in (go IE!)  ******
		findScreenPos : function()
		{
			var dimensions = {},
				win = $(window);
				
			dimensions.winY = win.height();
			dimensions.winX = win.width();
			dimensions.scrY = win.scrollTop();
			dimensions.scrX = win.scrollLeft();
			return dimensions;
		},
		// ******  create the markup for the popup box  ******
		createBox : function()
		{
			var popup = this,
				popupBox,
				dimensions;
				
			if ($("#" + this.opts.popupID).length === 0)
			{
				popupBox = '<div id="' + this.opts.popupID + '"><table cellpadding="0" cellspacing="0"><tbody><tr class="popupTop"><td class="popupTL corner pngbg"></td><td class="popupTM pngbg"></td><td class="popupTR corner pngbg"></td></tr><tr class="popupMid"><td class="popupML pngbg"></td><td class="' + this.opts.contentClass + '"></td><td class="popupMR pngbg"></td></tr><tr class="popupBot"><td class="popupBL corner pngbg"></td><td class="popupBM pngbg"></td><td class="popupBR corner pngbg"></td></tr></tbody></table></div>';
				// oops :( I forgot why I made a different box for IE6, was it to put the png class on the corners?
				if($.browser.msie)
				{
					if($.browser.version == "6.0")
					{
						popupBox = '<div id="' + this.opts.popupID + '"><table cellpadding="0" cellspacing="0"><tbody><tr class="popupTop"><td class="popupTL corner pngbg"><div></div></td><td class="popupTM pngbg"><div></div></td><td class="popupTR corner pngbg"><div></div></td></tr><tr class="popupMid"><td class="popupML pngbg"><div></div></td><td class="' + opts.contentClass+'"></td><td class="popupMR pngbg"><div></div></td></tr><tr class="popupBot"><td class="popupBL corner pngbg"><div></div></td><td class="popupBM pngbg"><div></div></td><td class="popupBR corner pngbg"><div></div></td></tr></tbody></table></div>';
					}
				}
				$("body").append(popupBox);
				$("#" + this.opts.popupID).css("display","none");
			}
			
			// add transparency layer if transparency is true.
			if (this.opts.transparentLayer === true && $(".transparency").length === 0)
			{
				var transparentLayer = '<div class="transparency" style="z-index:99;background:#000;opacity:' + (this.opts.transparentOpacity / 100) + ';filter:alpha(opacity = ' + this.opts.transparentOpacity + ');top:0;left:0;position:absolute"></div>';
				$("body").append(transparentLayer);
				// add event listeners for browser resizing and scrolling to adjust the transparent layer size
				//win.unbind();
				$(window).bind('scroll.' + this.namespace, function(){
					// find height and width of transparent layer
					dimensions = popup.findScreenPos();
					$(".transparency").css({height: dimensions.winY + dimensions.scrY, width: dimensions.winX + dimensions.scrX});
				});
				$(window).bind('resize.' + this.namespace, function(){
					// find height and width of transparent layer
					dimensions = popup.findScreenPos();
					$(".transparency").css({height: dimensions.winY + dimensions.scrY + "px", width:dimensions.winX + dimensions.scrX + "px"});
				});
			}
	
			// get rid of transparency if 'false' and it already exists and don't need it
			if (this.opts.transparentLayer === false && $(".transparency").length > 0)
			{
				$(".transparency").remove();
			}
	
			// add event handling for closing box
			$(document).bind('keydown.' + this.namespace, function(e)
			{
				if (e.keyCode == 27 && popup.el.isOpen === true)
				{
					popup.closeBox();
				}
			});
	
			
			$(".transparency").bind('click.' + this.namespace, function(){
				if (popup.el.isOpen === true)
				{
					popup.closeBox();
				}
			});
			
			// clear box of any content
			$("#" + this.opts.popupID + " ." + this.opts.contentClass).children().remove();
			// style transparent layer
			dimensions = this.findScreenPos();
			$(".transparency").css({
				"display" : "block",
				"filter" : "alpha(opacity = " + this.opts.transparentOpacity + ")",
				"opacity" : this.opts.transparentOpacity / 100,
				"height" : dimensions.winY + dimensions.scrY + "px",
				"width" : dimensions.winX + dimensions.scrX + "px"});
		},
		// ******  display the popup box  ******
		styleBox : function(properties, image)
		{
			var popup = this,
				popupSelector = "#" + this.opts.popupID,
				contentSelector = "." + this.opts.contentClass,
				imgSelector = contentSelector + " img",
				contentHeight,
				contentWidth,
				outerBoxWidth,
				outerBoxHeight,
				boxPos,
				leftPos,
				topPos,
				dimensions,
				oldBoxHeight,
				oldBoxWidth;
				
			if (image)
			{
				$(imgSelector).attr("src", image.src);
				$(imgSelector).attr("height", properties.imgHeight + "px");
				$(imgSelector).attr("width", properties.imgWidth + "px");
			}
			// if this is an image being loaded
			if (properties)
			{
				contentHeight = properties.imgHeight + this.opts.titleHeight + this.opts.controlHeight;
				contentWidth = properties.imgWidth;
				if (this.opts.autoSize === false)
				{
					contentHeight = this.opts.boxHeight + this.opts.titleHeight + this.opts.controlHeight;
					contentWidth = this.opts.boxWidth;
				}
			}
			else
			{
				contentHeight = this.opts.boxHeight;
				contentWidth = this.opts.boxWidth;
			}
			
			outerBoxWidth = contentWidth + (this.opts.shadowLength * 2);
			outerBoxHeight = contentHeight + (this.opts.shadowLength * 2);
			
			// calculate absolute position of the box and then center it on the screen
			dimensions = popup.findScreenPos();
			boxPos = this.centerBox(dimensions,outerBoxWidth,outerBoxHeight);
			
			// allow user to specify a fixed position for the popup. Use fixedTop and fixedLeft, if not then center the box
			if (this.opts.fixedTop)
			{
				boxPos.topPos = this.opts.fixedTop;
			}
			if (this.opts.fixedLeft)
			{
				boxPos.leftPos = boxPos.fixedLeft;
			}
			
			topPos = boxPos.topPos;			
			leftPos = boxPos.leftPos;
	
			// on window resize - center the box in the middle again
			if (this.opts.centerOnResize === true)
			{
				
				$(window).bind('resize.' + this.namespace, function()
				{
					dimensions = popup.findScreenPos();
					boxPos = popup.centerBox(dimensions,outerBoxWidth,outerBoxHeight); 
					if (popup.opts.fixedTop)
					{
						boxPos.topPos = popup.opts.fixedTop;
					}
					if (popup.opts.fixedLeft)
					{
						boxPos.leftPos = boxPos.fixedLeft;
					}
					$(popupSelector).css({top: boxPos.topPos + "px", left: boxPos.leftPos + "px"});
				});
			}
			  
			// claculate dimensions of popup
			// animate to the correct size if it is already open, else just set the values
			if ($(popupSelector).css("display") === "block" && properties && this.opts.autoSize === true)
			{
				oldBoxHeight = parseFloat($(popupSelector).css("height")) - (this.opts.shadowLength * 2) - (this.opts.titleHeight + this.opts.controlHeight);
				oldBoxWidth = parseFloat($(popupSelector).css("width")) - (this.opts.shadowLength * 2);
				$(popupSelector + " .galleryTitle").css({height: this.opts.titleHeight + "px"});
				$(popupSelector + " .galleryControls").css({height: this.opts.controlHeight + "px", "overflow": this.opts.overflow});
				$(popupSelector + " img").css({height: oldBoxHeight + "px", width: oldBoxWidth + "px"});
				$(popupSelector + " .imgPane").css({"width":"100%"});
				  
				// I want to animate most of this through the step function of the main image animation for better IE results
				// maybe set up some local variables as well to increase performance
				$(popupSelector + " img").animate({height: properties.imgHeight + "px", width: properties.imgWidth + "px"}, {queue:false, duration: this.opts.transition});
				$(popupSelector).animate({height: outerBoxHeight + "px", width: outerBoxWidth + "px", "left": leftPos + "px", "top": topPos + "px"}, {queue:false, duration: this.opts.transition});
				$(popupSelector + " .imgPane").animate({height: (contentHeight - this.opts.titleHeight - this.opts.controlHeight) + "px"}, {queue:false, duration: this.opts.transition});
				$(popupSelector + " .popupContent").animate({height: contentHeight + "px", width: contentWidth + "px"}, {queue:false, duration: this.opts.transition});
				$(popupSelector + " .popupTM, "+popupSelector+" .popupBM").animate({width: properties.imgWidth + "px"}, {queue:false, duration: this.opts.transition});
			}
			// create box and set its dimensions
			else
			{
				$(popupSelector).css({height: outerBoxHeight + "px", width: outerBoxWidth + "px", "position": "absolute", "z-index":100, "overflow": this.opts.overflow});
				$(popupSelector + " .imgPane").css({height:(contentHeight - this.opts.titleHeight - this.opts.controlHeight) + "px"});
				$(popupSelector + " .popupContent").css({height: contentHeight + "px", width: contentWidth + "px"});
				$(popupSelector + " .popupML div, " + popupSelector + " .popupMR div").css({height: contentHeight + "px"});
				$(popupSelector + " .galleryTitle").css({height: this.opts.titleHeight + "px", "overflow": this.opts.overflow});
				$(popupSelector + " .galleryControls").css({height: this.opts.controlHeight + "px", "overflow": this.opts.overflow});
				$(popupSelector + " .corner").css({height: this.opts.shadowLength + "px", width: this.opts.shadowLength + "px"});
				$(popupSelector + " .popupTM").css({height: this.opts.shadowLength + "px", width: contentWidth + "px"});
				$(popupSelector + " .popupBM").css({height: this.opts.shadowLength + "px", width: contentWidth + "px"});
				$(popupSelector).css({"left": leftPos + "px", "top": topPos + "px"});
			}
			
			// this probably should go somewhere else - leaving it in for now not to confuse me :P
			$(popupSelector).fadeIn("slow");
			//var pngTimer = setTimeout(function(){$(".pngbg div").addClass("popupPng");},10);
			// not sure why I am doing this anymore, since I would have a seperate box markup for IE6. leaving it oput for now	
			//$(".pngbg div").addClass("popupPng");
	
		},
		// function centers the box in the middle of the screen
		centerBox : function(dimensions,outerBoxWidth,outerBoxHeight)
		{
			var coords = {};
			coords.leftPos = ((dimensions.winX - outerBoxWidth) / 2) + dimensions.scrX;
			coords.topPos = ((dimensions.winY - outerBoxHeight) / 2) + dimensions.scrY;
			if (coords.topPos < 0)
			{
				coords.topPos = 0;
			}
			if (coords.leftPos < 0)
			{
				coords.leftPos = 0;
			}
			return coords;
		},
		// ******  find if the popup content is an image path  ******
		isContentImage : function()
		{
			var contentString = this.el.boxSrc.split("."),
				ext = contentString[contentString.length-1],
				isImage;
				
			switch(ext)
			{
				case 'jpg' : isImage = true;
					break;
				case 'gif' : isImage = true;
					break;
				case 'png' : isImage = true;
					break;
				case 'bmp' : isImage = true;
					break;
				default : isImage = false;
			}
			return isImage;
		},
		// ******  display the popup image  ******
		displayImage : function()
		{
			var popup = this,
				// add the image tag to the popup content
				contentSelector = "#" + this.opts.popupID + " ." + this.opts.contentClass;
				
			// add image markup to the popup box
			$(contentSelector).append('<div class="imgPane"><img class="loader" src="' + this.opts.loaderPath + '" width="" height="" alt="" /></div>');		
			// if gallery description is set to true then create the box that the description will go into and append after .imgPane
			if (this.opts.imageDesc === true)
			{
				$(".imgPane").css("position","relative").append('<div class="imageDesc" style="position:absolute;bottom:0;left:0;width:100%;background:#000;opacity:0.8;filter:alpha(opacity = 80);">' + this.el.imageDesc+'</div>');
			}
	
			// if gallery is a fixed height and width and centerImage = true, then align the image to the center of the box
			if (this.opts.autoSize === false && this.opts.centerImage === true)
			{
				$(contentSelector+" .imgPane").prepend("<span style='display:inline-block;height:" + this.opts.boxHeight + "px;line-height:" + this.opts.boxHeight + "px;width:1px'>&nbsp;</span>");
				$(contentSelector+" .imgPane").css({"line-height": this.opts.boxHeight + "px","text-align":"center"});
				$(contentSelector+" .imgPane img").css({"display":"inline","vertical-align":"middle"});
			}
			if (this.opts.gallery === true)
			{
				// add gallery controls here
				if (this.el.galleryTitle !== false)
				{
					$(contentSelector).append('<div class="galleryControls"><a href="" class="prev">previous</a><a href="" class="next">next</a></div>');
					$(contentSelector).prepend('<div class="galleryTitle"><h2>' + this.el.galleryTitle + '</h2>' + this.el.closeBtn + '</div>');
					// if gallery counter is true then add counter
					if (this.opts.galleryCounter === true)
					{
						var thisIndex = $("*[title='" + this.el.galleryTitle + "']").index(this.el) + 1;
						var galleryLength = $("*[title='" + this.el.galleryTitle + "']").length;
						$(contentSelector).find(".galleryControls").append("<p class='galleryCounter'>Displaying " + thisIndex + " of " + galleryLength + "</p>");
					}
				}
				// if not a gallery title then just add the close button
				else
				{
					$(contentSelector).prepend('<div class="galleryTitle">' + this.el.closeBtn + '</div>');
				}
			}
			
			// start of image loading stuff
			var popUpImg = new Image(),
				imgProperties = {};
				
			popUpImg.onload = function()
			{
				imgProperties.imgHeight = popUpImg.height;
				imgProperties.imgWidth = popUpImg.width;
				popup.styleBox(imgProperties, popUpImg);              
			};
			popUpImg.src = this.el.boxSrc;
			// end of image stuff
			  
			//  add close button controls
			this.addCloseButton();
			// add gallery controls and key functions here
			this.addGalleryControls();
		},
		// ******  display the content if NOT an image  ******
		styleNodeBox : function()
		{		
			//popup.fragment = $(popup.boxSrc);
			$("#" + this.opts.popupID+" ." + this.opts.contentClass + " img.loader").remove();
			$("#" + this.opts.popupID+" ." + this.opts.contentClass).append('<div class="galleryTitle">' + this.el.closeBtn + '</div>');		
			$("#" + this.opts.popupID+" ." + this.opts.contentClass).append(this.el.fragment);
			$("#" + this.opts.popupID+" ." + this.opts.contentClass + " " + this.el.boxSrc).css("display","block");
			// style popup box
			this.styleBox();
			//  add close button controls
			this.addCloseButton();
		},
		// ******  get ajax content for the box  ******
		getAjaxContent : function()
		{
			var popup = this;
			$("#" + this.opts.popupID + " ." + this.opts.contentClass).html('<img class="loader" src="' + this.opts.loaderPath + '" width="" height="" alt="" />');				
			$.ajax({
				url: popup.el.boxSrc,			
				dataType : popup.opts.ajaxType,
				success : function(msg)
				{				
					popup.el.fragment = msg;				
					popup.styleNodeBox();
				},
				error : function()
				{							
					popup.el.fragment = "ajax request failed";		
					popup.styleNodeBox();
				}
			});		
		},
		// *******  add controls for the image gallery  ******
		addGalleryControls : function()
		{
			var popup = this;
			
			$("#" + this.opts.popupID + " .next").bind('click.' + this.namespace, function(){
				popup.cycleImage(1);
				return false;
			});
			
			$("#" + this.opts.popupID + " .prev").bind('click.' + this.namespace, function(){
				popup.cycleImage(-1);
				return false;
			});
			
			// add key controls and keep escape key handler
			$(document).bind('keydown.' + this.namespace, function(e)
			{
				if (e.keyCode == 39 && popup.el.isOpen === true)
				{
					//$(document).unbind('.' + popup.namespace);
					popup.cycleImage(1);
				}
				else if (e.keyCode == 37 && popup.el.isOpen === true)
				{
					//$(document).unbind("." + popup.namespace);
					popup.cycleImage(-1);
				}
				if (e.keyCode == 27 && popup.el.isOpen === true)
				{
					popup.closeBox();
					//$("#"+opts.popupID).fadeOut("slow");
					//$(".transparency").fadeOut("slow");
				}
			});
		},
		// function to add close box controls to the popup
		addCloseButton : function()
		{
			var popup = this;
			
			$("#" + popup.opts.popupID + " ." + popup.opts.closeBox).bind('click.' + popup.namespace, function(){
				if (popup.el.isOpen === true)
				{
					popup.closeBox();
				}
				return false;
			});
		},
		// opens the popup box
		openBox : function()
		{
			this.el.galleryTitle = $(this.el).attr("title");
			this.el.imageDesc = $(this.el).attr("longdesc");
				
            // *** create the markup for popup box ***
            this.createBox();
			
            // *** find the screen dimensions ***
            var dimensions = this.findScreenPos();
            this.el.winY = dimensions.winY;
            this.el.winX = dimensions.winX;
			this.el.scrY = dimensions.scrY;
            this.el.scrX = dimensions.scrX;
			
            // *** either display content as an image OR as a DOM node ***
            if (this.isContentImage())
            {
                // find the index of this image in the gallery
                this.displayImage();
            }
            else if (this.opts.ajax === true)
            {
                this.getAjaxContent();	
            }
            else
            {                   		
                this.styleNodeBox();
            }
			
			// run the callback function on box open
			if (this.el.isOpen === false)
			{
				this.opts.onOpen();
			}
			// set the isOpen flag
			this.el.isOpen = true;
		},
		// this function closes the box and removes it from the DOM.
		closeBox : function()
		{
			// may want to do some fancy stuff here, but for now just fading out the box
			$("#" + this.opts.popupID).stop().fadeOut("slow").css("display","none");
			// delete the popup box from the DOM
			$("#" + this.opts.popupID).remove();
			$(".transparency").fadeOut("slow");
			// run the callback function on box close if it is open
			
			if (this.el.isOpen === true)
			{
				this.opts.onClose();
			}
			// unbind the key controls
			$(document).unbind('keydown.' + this.namespace);
			this.el.isOpen = false;
		},
		// this function finds the next image and then displays it
		cycleImage : function(imgIndex)
		{
			//console.log("hitting cycle image");
			var thisIndex = $("*[title='" + this.el.galleryTitle + "']").index(this.el),
				galleryLength = $("*[title='" + this.el.galleryTitle + "']").length,
				cycleIndex = thisIndex + imgIndex;
				
			if (cycleIndex < 0)
			{
				cycleIndex = galleryLength - 1;
			}
			if (cycleIndex == galleryLength)
			{
				cycleIndex = 0;
			}
			
			this.el.isOpen = false;
			// unbind the key controls
			$(document).unbind('keydown.' + this.namespace);
			$("*[title='" + this.el.galleryTitle + "']:eq(" + cycleIndex + ")").popup("openBox");
		},
		option : function(args) {
			this.opts = $.extend(true, {}, this.opts, args);
		},
		// want to change the content of the box? no worries
		changeContent : function(content) {			
			this.el.fragment = $(content);
		},
		destroy : function() {
			this.el.unbind("." + this.namespace);
		}
	};
	
	// the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
	// props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
	$.fn.popup = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "popup",
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
					$.data(this, pluginName, new $.Popup(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
