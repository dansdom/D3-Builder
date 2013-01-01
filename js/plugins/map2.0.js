/* 
	jQuery Googlemap Plugin - v2.0	 
	Copyright (c) 2011 Daniel Thomson
	https://github.com/dansdom/plugins-googlemap
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// Googlemap Plugin - v1.0
// this plugin allows a developer to drop in a generic googlemap into any page very easily
// there are a number of default map settings, but they can be overwritten and added to depending on the map requirements
// You can set the center of the map, and a pin on the centre too.
// there are options to have custom pins
// the markers are defined as an array of pins. 
// each pin object has a title, lat, lng, custom pin reference, and an infoWindow HTML string
// implementation is as easy as:
//			$(document).ready(function(){
//				$("#mapPane").MapMe({
//						 options: go here
//				});				
//			});
//
// v 1.0	- basic functionality, custom pins, custom events, markerclusterer plugin, map options and info windows
// v 1.1	- fixed bug with geolocation
//			- added option to 'track' the user on the map. this will add a center pin, on a given time period it will update the maps center position
//			- fixed issues with the definition of the center pin. now you can define your own center pin
//			- renaming a few variables so that they make a little more sense
//			- combined mapCenter and trackLocation variables :)
// v 1.3	- added an option in the pin to add a custom function for that pin which is not a map event. Originally for changing the pin marker image on the fly.
//			- the first thing is the pass the pin through, then maybe pass some options
//			- adding option to add custom function to the map events as well
// v2.0		- integrated this plugin into my new architecture: https://github.com/dansdom/plugins-template-v2

// Custom Pin:
// for each custom pin the setting can be turned off by using "false", 
// required: lat and lng
// need to write in a track location option/function. "trackLocation:true"

// if markerCluster is set to true, then the markers on the page will be clustered using the marker cluster script.
// this script needs to be included in the HTML
// these clusters can be styled using the markerClusterOptions object.
//	Styles for marker clusters:
//	'gridSize': (number) The grid size of a cluster in pixels.
//	'maxZoom': (number) The maximum zoom level that a marker can be part of a cluster.
//	'zoomOnClick': (boolean) Whether the default behaviour of clicking on a cluster is to zoom into it.
//	'averageCenter': (boolean) Wether the center of each cluster should be the average of all markers in the cluster.
//	'minimumClusterSize': (number) The minimum number of markers to be in a cluster before the markers are hidden and a count is shown.
//	'styles': (object) An object that has style properties:
//			'url': (string) The image url.
//			'height': (number) The image height.
//			'width': (number) The image width.
//			'anchor': (Array) The anchor position of the label text.
//			'textColor': (string) The text color.
//			'textSize': (number) The text size.
//			'backgroundPosition': (string) The position of the backgound x, y.

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.MapMe = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "mapMe";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.MapMe.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.MapMe.settings = {
		mapCanvas : "mapPane",  // the id of the map canvas
		pinCenter : true,
		trackLocation : true,
		trackingPeriod : false,	// if set to false then it won't 'track' the user, only center the map initially on user location
		trackingCircle : true,
		centerMarker : {}, // e.g. of a center pin definition - {title:"center marker", pin: "myCustomPin", infoWindow: "<h1>this is the center pin</h1>"},
		// need to include the script if you want to use it							
		markerCluster : false,
		markerClusterOptions : {
			styles : [
				{height : 53, width : 53, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m1.png", textColor : "#000", textSize : 16},
				{height : 56, width : 56, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m2.png", textColor : "#000", textSize : 16},
				{height : 66, width : 66, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m3.png", textColor : "#000", textSize : 16},
				{height : 78, width : 78, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m4.png", textColor : "#000", textSize : 16},
				{height : 90, width : 90, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m5.png", textColor : "#000", textSize : 16}
			],
			minimumClusterSize : 3
		},
		// an example of a custom pin
		customPins : {
			// exmaple of a custom pin
			"myCustomPin" : {
				pinImg : "img/pin.png",
				pinImgSize : [36, 55],
				pinOrigin : [0, 0],
				pinAnchor : [18, 55],
				pinShape : {coord: [1, 1, 1, 36, 55, 36, 55, 1], type: 'poly'},
				pinShadow : "img/pin-shadow.png",
				pinShadowSize : [77, 58],
				pinShadowOrigin : [0, 0],
				pinShadowAnchor : [22, 55]
			}
		},
		markers : [
			//[marker title, lat, lng, pin, infoWindow, pinEvent] - set to false if not needed
			// example of a marker
			//{
			//	title: 'Bondi Beach', 
			//	lat: -33.890542, 
			//	lng: 151.274856, 
			//	pin: "myCustomPin", 
			//	infoWindow: "<h1>Bondi Info Window Content</h1><p>lorem ipsum</p>",
			//	pinEvent: {
			//		'click': function(){alert("you clicked me!");},
			//		'mouseover' : function(){console.log("you moused over me!");}},
			//	pinFunction: {
			//		foo();}
			//}
		],
		mapOptions : {
			// these are the basic styles. 
			// this object can be added to with any of the googlemap options when the plugin is called
			zoom: 12,
			center: [80, 80],
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: true,
			panControl: false,
			zoomControl: true,
			scaleControl: true,
			streetViewControl: true,
			overviewMapControl: true
		}
	};
	
	// plugin functions go here
	$.MapMe.prototype = {
		init : function() {
			
			// there is an anonymous function here, so will declare a local var for 'this'
			var mapObj = this;
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			this.opts.mapOptions.center = new google.maps.LatLng(this.opts.mapOptions.center[0], this.opts.mapOptions.center[1]);
			// make the map object	
			//console.log(opts.mapOptions);
			this.el.mapObject = new google.maps.Map(document.getElementById(this.opts.mapCanvas), this.opts.mapOptions);
			this.el.centerPosition;
			this.el.mapMarkers;
			this.el.cluster;
			this.el.trackingTimer;
			
			// set the center of the map
			if (this.opts.trackLocation === true)
			{
				// find me the current position of the user
				this.getUserPosition();
				// current position takes a while, so I will have to set map center when current position is calculated				
			}
			// if not current but pinCenter is true, then add a pin in the center
			else if (this.opts.pinCenter === true)
			{
				this.el.centerPosition = [this.opts.mapOptions.center.Pa, this.opts.mapOptions.center.Qa];
				this.el.mapObject.centerMarker = this.addCentrePin(this.el.centerPosition);
			}
			
			// add the markers to the map, return the array of markers
			this.el.mapMarkers = this.setMarkers();
			
			// marker cluster code. if the setting is true and the object exists then add the marker clusterer			
			if (typeof(MarkerClusterer) !== "undefined" && this.opts.markerCluster === true)
			{
				this.el.cluster = new MarkerClusterer(this.el.mapObject, this.el.mapMarkers, this.opts.clusterOptions);
				//console.log(cluster.getStyles());
			}
			
			// add function that updates the current location of the user
			if (this.opts.trackLocation && this.opts.trackingPeriod)
			{				
				this.el.trackingTimer = setTimeout(function(){mapObj.updateLocation();}, this.opts.trackingPeriod);
			}
			
		},
		// get the users current position
		getUserPosition : function()
		{
			// set var for anonymous functions
			var mapObj = this;
			//console.log("getting my position");		
			if (navigator.geolocation)
			{	
				navigator.geolocation.getCurrentPosition(
					// success function
					function(position)
					{					
						//console.log("this is navigator.geolocation:");
						//console.log(position.coords);
						var userPos = [position.coords.latitude, position.coords.longitude];
						mapObj.geoSuccess(userPos);
					},
					// error function
					function()
					{
						mapObj.geoFailure();
					},
					// tracking period for calling error
					{timeout:mapObj.opts.trackingPeriod});
			}
			else if (google.gears)
			{
				var geo = google.gears.factory.create('beta.geolocation');			
				geo.getCurrentPosition(
					// success function
					function(position)
					{	
						//console.log("this is google gears");				
						var userPos = [position.latitude, position.longitude];
						mapObj.geoSuccess(userPos);
					},
					// error function
					function()
					{
						mapObj.geoFailure();
					},
					// tracking period for calling error
					{timeout:mapObj.opts.trackingPeriod});
			}
			else
			{			
				this.geoFailure();
			}	
							
		},
		// when the browser successfully finds the users cuurent position
		geoSuccess : function(position)
		{			
			// need to make this conditional and if setting center then do it
			// also I will need to only set this the first time as I got this function going through a loop
			// console.log(position);
			var userPosition = new google.maps.LatLng(position[0], position[1]);
			// console.log(position);
			if (!this.el.mapObject.centerSet)
			{
				this.el.mapObject.setCenter(userPosition);
			}
			this.el.mapObject.centerSet = true;
			
			// if putting a pin in the center of the map then do so
			if (this.opts.pinCenter === true) 
			{
				// if the map already has a center pin then remove it
				if (this.el.mapObject.centerMarker)
				{
					this.el.mapObject.centerMarker.setMap(null);
					this.el.mapObject.centerOverlay.setMap(null);
				}
				// need to fill out the center marker here:
				// I'll need to contruct the center pin object from the map location
				// set the lat/lng of the center marker
				// I'M NOT SURE I NEED THIS SWITCH HERE - GOT TO COME BACK TO IT !!!!!!!!!!!!!!!!!!!!!!!
				if (this.opts.trackLocation === true) 
				{
					//then set the lat/lng of pin
					this.opts.centerMarker.lat = position[1];
					this.opts.centerMarker.lng = position[0];
				} 
				// then call the addCenterPin function
				this.el.mapObject.centerMarker = this.addCentrePin(position);
				// going to test creating a circle around the center pin - this is only for beer app for now, but will put it into the plugin later.			
			}
		},
		// when the browser doesn't find the users current position
		geoFailure : function()
		{
			consoleLog("I couldn't find your current position");
		},
		// this function checks the users positions every 10sec and centers the map on the user position and resets the venter pin as well
		updateLocation : function()
		{
			var mapObj = this;
			// get the users current position
			this.getUserPosition();
			// set the timer up again
			//console.log("updating location");
			setTimeout(function(){mapObj.updateLocation();}, this.opts.trackingPeriod);
		},
		// set the markers onto the map
		setMarkers : function()
		{
			var markers = this.opts.markers,
				markerArray = [],
				// need to do a test to see if the markers have been declared
				markerLength = markers.length,
				i,
				pin,
				infoWindow,
				pinEvents,
				currentPin,
				pinPosition,
				pinFunction;
				
			if (markerLength > 0)
			{
				for (i = 0; i < markerLength; i += 1)
				{
					pin = markers[i];				
					infoWindow = markers[i].infoWindow;
					pinEvents = markers[i].pinEvent;
					pinFunction = markers[i].pinFunction;
					// check to see if a custom pin has been assigned - else drop in a regular pin
					// i need to return the marker so I can attach events to it in a different function
					if (markers[i].pin)
					{
						// then go make a custom pin marker
						currentPin = this.customPin(pin);
					}
					else
					{
						// make a regular pin marker
						pinPosition = new google.maps.LatLng(pin.lat, pin.lng);
						currentPin = new google.maps.Marker({
							position: pinPosition,
							map: this.el.mapObject,
							title: pin.title 
						});					
					}
									
					// add info windows here
					if (infoWindow)
					{
						this.addInfoWindow(currentPin, infoWindow);
					}
					
					// add pin events
					if (pinEvents)
					{
						this.addPinEvents(pinEvents, currentPin);
					}
					
					// add a custom function to the pin which is not a map event
					if (pinFunction)
					{
						pinFunction(currentPin);
					}
					// store all the pins together into an array
					markerArray.push(currentPin);
				}
				
			}
			// return the markers as an array - I think I may want to put this onto the html object i.e. this.el.markerArray
			// but I don't think I'm really using this atm anyways
			return markerArray;
		},
		// add center pin to the map
		addCentrePin : function(centerPosition)
		{
			var mapObj = this,
				marker,
				centerPin = {},
				infoWindow,
				circle;
				
			if (this.opts.centerMarker.pin)
			{	
				centerPin.lat = centerPosition[0];
				centerPin.lng = centerPosition[1];
				centerPin.title = this.opts.centerMarker.title;
				centerPin.pin = this.opts.centerMarker.pin;
				marker = this.customPin(centerPin);
			}
			else
			{			
				marker = new google.maps.Marker({
					position: new google.maps.LatLng(centerPosition[0], centerPosition[1]),
					title: mapObj.opts.centerMarker.title,
					map: mapObj.el.mapObject
				});
				marker.setMap(this.el.mapObject);			
			}
			
			// set the info window for the center marker
			infoWindow = this.opts.centerMarker.infoWindow;
			if (infoWindow)
			{
				this.addInfoWindow(marker, infoWindow);
			}
			
			circle = {
				strokeColor: "#4d9cff",
				strokeOpacity: 0.4,
				strokeWeight: 2,
				fillColor: "#4d9cff",
				fillOpacity: 0.15,
				map: mapObj.el.mapObject,
				center: new google.maps.LatLng(centerPosition[0], centerPosition[1]),
				radius : 200
			};
			if (this.opts.trackingCircle === true)
			{
				this.el.mapObject.centerOverlay = new google.maps.Circle(circle);
			}
			
			return marker;
		},
		// make a custom pin for the marker and then drop it onto the map
		customPin : function(pin)
		{		
			// custom pin object reference
			
			var pinReference = pin.pin,
				image,
				shadow,
				shape,
				pinPosition,
				marker;
				
			if (!this.opts.customPins[pinReference])
			{
				alert("custom pin has not been defined properly");
			}	
			//console.log(pinReference);
			// custom pin image parameters			
			image = new google.maps.MarkerImage(
				this.opts.customPins[pinReference].pinImg,
				new google.maps.Size(this.opts.customPins[pinReference].pinImgSize[0], this.opts.customPins[pinReference].pinImgSize[1]),
				new google.maps.Point(this.opts.customPins[pinReference].pinOrigin[0], this.opts.customPins[pinReference].pinOrigin[1]),
				new google.maps.Point(this.opts.customPins[pinReference].pinAnchor[0], this.opts.customPins[pinReference].pinAnchor[1]));
			//console.log(image);
			// custom pin shadow parameters
			shadow = new google.maps.MarkerImage(
				this.opts.customPins[pinReference].pinShadow,
				new google.maps.Size(this.opts.customPins[pinReference].pinShadowSize[0], this.opts.customPins[pinReference].pinShadowSize[1]),
				new google.maps.Point(this.opts.customPins[pinReference].pinShadowOrigin[0], this.opts.customPins[pinReference].pinShadowOrigin[1]),
				new google.maps.Point(this.opts.customPins[pinReference].pinShadowAnchor[0], this.opts.customPins[pinReference].pinShadowAnchor[1]));
			//console.log(shadow);
			// custom pin shape
			shape = this.opts.customPins[pinReference].pinShape;
			// test if shape has been defined, if not then an empty value is needed
			if (!shape)
			{
				shape = "";
			}	
			// set custom pin position	
			pinPosition = new google.maps.LatLng(pin.lat, pin.lng);		
			// make the marker and put it onto the map
			marker = new google.maps.Marker({
				position: pinPosition,
				map: this.el.mapObject,
				shadow: shadow,
				icon: image,
				// need to test for the shape and decide whether to include it or not
				shape: shape,			
				title: pin.title
			});	
			return marker;				
		},
		// add pin events to the map
		addPinEvents : function(pinEvents, currentPin)
		{
			var event,
				name;
			for (name in pinEvents)
			{			
				event = pinEvents[name];
				google.maps.event.addListener(currentPin, name, event);
			}
		},
		// add an infoWindow to the pin marker
		addInfoWindow : function(pin, infoWindow)
		{
			var mapObj = this;
			infoWindow = new google.maps.InfoWindow({content: infoWindow});
			
			google.maps.event.addListener(pin, "click", function(){
				infoWindow.open(mapObj.el.mapObject, pin);
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
	$.fn.mapMe = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "MapMe",
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
					$.data(this, pluginName, new $.MapMe(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
