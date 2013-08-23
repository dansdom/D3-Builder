// TO DO LIST:
// 1. I think the data options aren't 100% yet
// 4. optimise the jQuery selectors. atm they are like a big pile of shit.

// Priorities:
// 2. data parsing from inside each plugin. There needs to be regex that strips out garbage and then parseFloat of those qualitative values on the chart
// 3. implement the spacing attribute on the force chrt. use it to set the force between tree nodes
// 4. there are a bunch of plugin settings (see 2. - also for the chord chart) that are no fully implemented through the interface. Namely the "theme" tab. This needs to be gone through
// 5. add a nice animation transition for the scales? that would be nice
// 6. interface options that will hide and show available settings field for each chart
// !!! on the x,y charts this line - .rangeRoundBands([0, container.width], 0.1); needs to be fixed up and added as an option for the user to set.
// !!! Also, just about to implement the data categories for the scatterplot. Could roll this out to the other x,y axis

// Known Bugs (that are bugging me)
// none


// Chart Plugins priority:
// 1. Streamgraph
// 2. difference chart
// 3. multiple line chart and area (write into current plugins)
// 3. stacked area and line chart
// 4. tree layout
// 5. Hierarchical Edge Bundling
// 6. node link tree


// this object is used to handle the form data on the page
ChartBuilder = {
	init : function() {
		// handle action button events
		this.formActions();
		// set up checkbox sections
		this.showSection();
		// resets the form
		this.resetForm();
		// take a snapshot and store the form value so that the user can undo any changes
		this.takeSnapshot();
		
		// bind a global event here that will update the chart object
		$(document).on("updateChart", function() {
			// I should do my validation here before storing the data
			ChartBuilder.validateForm();
			// store the form data object
			ChartBuilder.takeSnapshot();
			// build the chart
			ChartBuilder.buildChart();
		});
	},
	formActions : function() {
		
		// I'll definately need some form validation as I don't want the user to trip shit up
		// maybe even fall back to a default value if the values are shite?
		$("#build-update").on("click", function() {
			// I'll need a function to grab all the form data here
			ChartBuilder.takeSnapshot();
			// first validate the form
			$("#chart-settings").validator("validateForm");
			// build the chart
			//ChartBuilder.buildChart(); - moved to the submit function in Plugins.validator()
		});

		$("#build-reset").on("click", function() {
			ChartBuilder.resetForm();
		});

		$("#build-save").on("click", function() {
			// save the chart data to the cookie
			ChartBuilder.takeSnapshot();
			// build the chart
			ChartBuilder.writeCookie();
		});

		$("#build-load").on("click", function() {
			// reset the form first
			ChartBuilder.resetForm();
			// load the chart data from the cookie
			if (ChartBuilder.getCookie()) {
				// build the chart
				ChartBuilder.setFormValues();
				// first validate the form
				$("#chart-settings").validator("validateForm");
				// once this is done I will show the saved chart
				//ChartBuilder.buildChart(); - moved to the submit function in Plugins.validator()
			}
		});
		
		$("#build-submit").on("click", function() {
			// get the form data
			ChartBuilder.takeSnapshot();
			// first validate the form
			$("#chart-settings").validator("validateForm");
			//ChartBuilder.buildChart(); - moved to the submit function in Plugins.validator()
			// I'll have a seperate object to build the output
			// I need to check if the form is valid first
			if (Plugins.validator.isValid == true) {
				CodeBuilder.packageCode();
			}
		});
	},
	// show/hide sections in the form.
	showSection : function() {
		$(".show-section").on("change", function() {
			var section = $(this),
				sectionItems = $(this).attr("id");
				
			if (section.attr("checked") === "checked") {
				$("." + sectionItems).css("display", "block");
			}
			else {
				$("." + sectionItems).css("display", "none");
			}
		});
	},
	takeSnapshot : function() {
		// this takes a snapshot of the form state so that I can undo an updateChart
		ChartType.getValue();
		ChartSize.getValue();
		ChartColors.getValue();
		ChartData.getValue();
		ChartTheme.getValue();
		ChartEvents.getValue();
		console.log('taking snapshot');
		console.log(FormData);
	},
	resetForm : function() {
		// I need to destroy the current chart
		var chart = document.getElementById("chart-preview");
		if (FormData.type.current) {
 			d3[FormData.type.current](chart, "destroy");
 			FormData.type.current = null;
 		}
		// quick win - make every select box have the first option selected
		$("#chart-settings select").each(function() {
			$(this).find(":eq(0)").attr("selected", "selected");			
		});
		// uncheck every checkbox
		$("#chart-settings input[type='checkbox']").each(function() {
			$(this).removeAttr("checked");
		});
		// reset the form to the default values
		ChartType.reset();
		ChartSize.reset();
		ChartColors.reset();
		ChartData.reset();
		ChartTheme.reset();
		ChartEvents.reset();
		console.log('resetting form');
		console.log(FormData);
		// reset the form data object
		FormData = FormDefault;
		// show the first tab
		$("#chart-settings").tabs("showTab", 0);
		// reset the required fields
		$("#chart-settings").validator('getValidationFields');
	},
	setFormValues : function() {
		// this is the function that takes the cookie value and inserts it into the form
		console.log('setting form values');
		console.log(FormData);
		ChartType.setValue();
		ChartSize.setValue();
		ChartColors.setValue();
		ChartData.setValue();
		ChartTheme.setValue();
		ChartEvents.setValue();
	},
	buildChart : function() {
		switch (FormData.type.primary) {
			case "pie" :
				PieChart.init();
				break;
			case "pack" :
				PackChart.init();
				break;
			case "sunburst" :
				SunburstChart.init();
				break;
			case "force" :
				ForceChart.init();
				break;
			case "area" :
				AreaChart.init();
				break;
			case "bar" :
				BarChart.init();
				break;
			case "chord" :
				ChordChart.init();
				break;
			case "scatterplot" :
				ScatterplotChart.init();
				break;
			default :
				break;
		};
	},
	writeCookie : function() {
		// writes a cookie with the form settings
		console.log('writing cookie');
		$.cookie("chart_cookie", JSON.stringify(FormData), {expires: 365});
	},
	getCookie : function() {
		// returns the cookie

		var cookieData = JSON.parse($.cookie("chart_cookie"));
		if (cookieData) {
			FormData = cookieData;
			return true;
		}
		else {
			//alert('There was no saved chart');
			// show the help box
			$("#build-load-help").popup("openBox");
			return false;
		}
	},
	removeCookie : function() {
		// deletes the cookie
		$.removeCookie("chart_cookie");
	}
};

// each section of the form will have it's own object that will control that part of the interface
ChartType = {
	init : function() {
		this.showType();
	},
	// handles the chart type selection interaction
	showType : function() {
		$("#type-chart").on("change", function() {
			var chartType = $(this).attr("value"),
				dataSelect = $("#data-structure"),
				scaleX = $("#data-scaleX"),
				scaleY = $("#data-scaleY"),
				dataAllowed = Config.dataAllowed[chartType],
				dataAttributes = Config.dataAttributes[chartType],
				dataScaleX = Config.dataScaleX[chartType],
				dataScaleY = Config.dataScaleY[chartType],
				options = "";

			// return the options for the scale drop down
			function setScale(settings) {
				var options = "";
				for (var i = 0; i < settings.length; i++) {
					switch (settings[i]) {
						case "linear" :
							options += "<option value='linear'>linear</option>";
							break;
						case "ordinal" : 
							options += "<option value='ordinal'>ordinal</option>";
							break;
						case "pow" : 
							options += "<option value='pow'>power</option>";
							break;
						default : break;
					};
				};
				return options;
			}

			// show the secondary chart type select box
			$("li.type-settings").css("display", "none");
			$("li." + chartType).css("display", "block");
			
			// work out what data options to make available. The the array of data allowed for this chart type
			for (var i = 0; i < dataAllowed.length; i++) {
				switch (dataAllowed[i]) {
					case "flat" : 
						options += "<option value='flat'>Ordinal Flat</option>";
						break;
					case "nested" :
						options += "<option value='nested'>Ordinal Nested</option>";
						break;
					case "quantitative" :
						options += "<option value='quantitative'>Quantitative</option>";
						break
					case "matrix" :
						options += "<option value='matrix'>Matrix</option>";
						break;
					default : break;
				};
			};
			// refresh the data structure field
			dataSelect.html(options);
			// set the value as the first option on the data-structure option list
			dataSelect.find("option:eq(0)").attr("selected", "selected");
			var dataSelected = $("#data-structure option:eq(0)").attr("value");

			// work out what data attributes are available and then show those inputs
			$("li.data-attributes").css("display", "none");
			for (var i = 0; i < dataAttributes.length; i++) {
				$("li.data-attributes." + dataAttributes[i]).css("display", "block");
			};

			// refresh the x-scale dropdown list
			scaleX.html(setScale(dataScaleX));
			// refresh the x-scale dropdown list
			scaleY.html(setScale(dataScaleY));

			// #### work out what ranges to display #######
			// On the to-do list
			$("li.data-range").css("display", "none");
			
			// select the data structure
			ChartData.selectDataStructure(dataSelected);
			// set the class on the body object to control the help options
			ChartType.setBodyType(chartType);

		});
	},
	setBodyType : function(chart) {
		// body class setter.
		// first see if a body class has already been set
		var bodyClass = $("body").attr("class"),
			// split out the form classes
			classArray;

		//console.log(bodyClass);
		if (bodyClass)
		{
			classArray = bodyClass.split(" ");

			$.each(classArray, function(index, value) {
				// check to see if the value gives a positive index
				if (value.indexOf("current-chart") >= 0) {
					// remove that class from the form element
					$("body").removeClass(value);
				}
			});
		}
		// add the new chart class to the form element
		$("body").addClass("current-chart-" + chart);
	},
	reset : function() {
		// hide the sub menus
		$("li.type-settings").css("display", "none");
	},
	setValue : function() {
		// set to default values
		$("#type-chart").attr("value", FormData.type.primary);
		// if the primary is set then find the secondary
		if (FormData.type.primary) {
			// shoe the submenu
			$("li.type-settings." + FormData.type.primary).css("display", "block");
			$("#type-chart-" + FormData.type.primary).attr("value", FormData.type.secondary);
		}
	},
	getValue : function() {
		var type = $("#type-chart").attr("value");
		// set the form Data object if the chart type is set
		if (type) {
			FormData.type.primary = type;
			FormData.type.secondary = $("li." + type + " select").attr("value");
		}
	}
};

ChartSize = {
	reset : function() {
		// set to default values
		$("#size-height").attr("value", "680");
		$("#size-width").attr("value", "680");
		$("#size-outer-radius").attr("value", "300");
		$("#size-inner-radius").attr("value", "0");
		$("#size-padding").attr("value", "20");
	},
	setValue : function() {
		// set to default values
		$("#size-height").attr("value", FormData.size.height);
		$("#size-width").attr("value", FormData.size.width);
		$("#size-outer-radius").attr("value", FormData.size.outerRadius);
		$("#size-inner-radius").attr("value", FormData.size.innerRadius);
		$("#size-padding").attr("value", FormData.size.padding);
	},
	getValue : function() {
		FormData.size = {
			height : parseFloat($("#size-height").attr("value")),
			width : parseFloat($("#size-width").attr("value")),
			outerRadius : parseFloat($("#size-outer-radius").attr("value")),
			innerRadius : parseFloat($("#size-inner-radius").attr("value")),
			padding : parseFloat($("#size-padding").attr("value"))
		}
	}
};

ChartColors = {
	init : function() {
		// I'll need to add the default color palette values before I start the initialise the color pickers
		this.managePaletteSize();
		// changes the color scheme
		setTimeout(function() {
			// I need for the color pickers to be finished initialising before I can run this function. bugger
			// set a timeout of 0 to do this. note: I should browser test that this works ok elsewhere
			ChartColors.manageColorScheme();	
		}, 0);
	},
	// color scheme constants
	scheme1 : ["1f77b4","ff7f0e","2ca02c","d62728","9467bd","8c564b","e377c2","7f7f7f","bcbd22","17becf"], // define the standard D3 color schemes, and also add some of my own?
	scheme2 : ["1f77b4","aec7e8","ff7f0e","ffbb78","2ca02c","98df8a","d62728","ff9896","9467bd","c5b0d5","8c564b","c49c94","e377c2","f7b6d2","7f7f7f","c7c7c7","bcbd22","dbdb8d","17becf","9edae5"],
	scheme3 : ["393b79","5254a3","6b6ecf","9c9ede","637939","8ca252","b5cf6b","cedb9c","8c6d31","bd9e39","e7ba52","e7cb94","843c39","ad494a","d6616b","e7969c","7b4173","a55194","ce6dbd","de9ed6"],
	scheme4 : ["3182bd","6baed6","9ecae1","c6dbef","e6550d","fd8d3c","fdae6b","fdd0a2","31a354","74c476","a1d99b","c7e9c0","756bb1","9e9ac8","bcbddc","dadaeb","636363","969696","bdbdbd","d9d9d9"],
	scheme5 : ["3b2f23","342a1f","81613e","735637","a4b167","929e5c","d6d2b4","bfbba1","4e693b","455d34"],
	scheme6 : ["645156","4b4143","411a23","b2989e","b29fa3","6d6658","524e46","47371d","b6ad9c","b6afa3","433d4a","333038","201430","988fa5","9b95a5","54604d","41483d","273e19","a0af96","a4af9d"],
	scheme7 : ["e82351","ae3f59","970b2C","f4587d","f4829c","fdae26","be9145","a46c0c","fec25c","fed287","265aa7","35527d","0c336c","598ad3","799dd3","67dd21","64a63c","3c900b","8fee56","a8ee7f"],
	reset : function() {
		// set to default values
		// set it to a custom scheme
		$("#color-scheme").attr("value", 0);
		// set palette size to auto
		$("#color-palette-size").attr("value", 0);
		// remove the selected class
		$("fieldset.color .palette li").removeClass("selected");

	},
	setValue : function() {
		// set to default values
		var paletteSize = FormData.colors.length,
			paletteList = $("fieldset.color .palette li");

		// set it to a custom scheme
		$("#color-scheme").attr("value", 0);
		// set palette size to auto
		$("#color-palette-size").attr("value", 0);

		for (var i = 0; i < paletteSize; i++) {
			$(paletteList[i]).addClass("selected").find("input").attr("value", FormData.colors[i]).trigger("keyup");
		}
		// remove selected class from any item greater than the list length
		$("fieldset.color .palette li:gt(" + paletteSize + ")").removeClass("selected");
	},
	// I'll need to dig up a few more color schemes. I may ask the designers to contribute
	getValue : function() {
		// this function will return the current color scheme by cycling through the inputs and gathering the data from them
		var colorScheme = [],
			palette = $("fieldset.color .palette");
		
		// cycle through only the selected items
		palette.find("li.selected").each(function() {
			var currentValue = $(this).find("input").attr("value");
			// if currentValue is a color, then add it, else forget it
			if (currentValue) {
				// turn it into a hex value
				colorScheme.push("#" + currentValue);
			}
		});
		// update the data object
		FormData.colors = colorScheme;
	},
	// palette size counter
	paletteSize : 0,
	managePaletteSize : function() {
		var paletteColors = $(".palette li.color input");
		
		ChartColors.paletteSize = parseInt($("#color-palette-size").attr("value"));
		// I need to populate the intial palette size
		//console.log(paletteSize);
		$("fieldset.color .palette li.color:lt(" + ChartColors.paletteSize + ")").addClass("selected");
		
		$("#color-palette-size").on("change", function() {
			// update the palette size variable
			ChartColors.paletteSize = parseInt($(this).attr("value"));
			// if it's a custom size then do nothing
			if (ChartColors.paletteSize > 0) {
				$("fieldset.color .palette li.color:lt(" + ChartColors.paletteSize + ")").addClass("selected");
				$("fieldset.color .palette li.color:gt(" + (ChartColors.paletteSize - 1) + ")").removeClass("selected");
			}
		});
		
		// add a color to the palette
		$("#color-add").on("click", function() {
			if (ChartColors.paletteSize === 30) {
				alert("The maximum size of the palette is 30 colours");
				return;
			}
			// update the palette size
			ChartColors.paletteSize++;
			//console.log(paletteSize);
			$("fieldset.color .palette li.color:eq(" + (ChartColors.paletteSize - 1) + ")").addClass("selected");
			// set palette size to "auto"
			$("#color-palette-size").attr("value", 0);
			// set the theme to custom
			$("#color-scheme").attr("value", 0);
		});
		
		// remove a color from the palette
		$("#color-remove").on("click", function() {
			// check that palette size is not 0
			if (ChartColors.paletteSize == 1) {
				alert("the palette needs at least one colour");
				return;
			}
			// update the palette size
			ChartColors.paletteSize--;
			//console.log(paletteSize);
			$("fieldset.color .palette li.selected:eq(" + ChartColors.paletteSize + ")").removeClass("selected");
			// set palette size to "auto"
			$("#color-palette-size").attr("value", 0);
			// set the theme to custom
			$("#color-scheme").attr("value", 0);
		});
	},
	manageColorScheme : function() {
		
		// when page initialises, insert the default color scheme
		var colorScheme = $("#color-scheme").attr("value");
		if (colorScheme === "0") {
			console.log("there is no color scheme selected");
		}
		else {
			ChartColors.changeColorScheme(colorScheme);
		}
		
		// event handling for the select box
		$("#color-scheme").on("change", function() {
			colorScheme = $(this).attr("value");
			if (colorScheme === "0") {
				console.log("not changing the scheme");
				return;
			}
			//console.log(ChartColors[colorScheme].length);
			// I will need to keep track of the color scheme length here. doh!
			var schemeLength = ChartColors[colorScheme].length;
			$("fieldset.color .palette li.color:lt(" + schemeLength + ")").addClass("selected");
			$("fieldset.color .palette li.color:gt(" + (schemeLength-1) + ")").removeClass("selected");
			// I need to set the palette size to auto
			$("#color-palette-size").attr("value", 0);
			// will need to set the palette to the right size for the particular scheme
			ChartColors.paletteSize = schemeLength;
			
			ChartColors.changeColorScheme(colorScheme);
		});
	},
	changeColorScheme : function(newScheme) {
		// changes the color palette
		//console.log(newScheme);
		var colorArray = ChartColors[newScheme],
			colorArrayLength = colorArray.length,
			palette = $("fieldset.color .palette");

		// ###### Note: I have to reset the alpha cannel on the color picker when changing colour scheme
		$.jPicker.List[0].color.active.val('a', 255);
		
		for (var i = 0; i < colorArrayLength; i++) {
			// populate the inputs
			// I have to trigger a keyup event here so that the jpicker plugin can read the value of the input field
			palette.find("li:eq(" + i + ")").find("input").attr("value", colorArray[i]).trigger("change");
		}
		// I'll remove values for those items larger than the array length
		palette.find("li:gt(" + (colorArrayLength - 1) + ")").find("input").attr("value", "").trigger("change");
	}
};

ChartData = {
	init : function() {
		this.dataSource();
		this.dataStructure();
		this.handleFileUpload();
	},
	reset : function() {
		// set to default values
		$("#data-name").attr("value", "name");
		$("#data-value").attr("value", "size");
		$("#data-children").attr("value", "group");
		$("#data-x").attr("value", "x");
		$("#data-y").attr("value", "y");
		$(".data-source").css("display", "none");
		$(".data-source.dummy").css("display", "block");
	},
	setValue : function() {
		// set to default values
		$("#data-source").attr("value", FormData.data.source);

		$(".data-source").css("display", "none");
		var dataSource = $(".data-source." + FormData.data.source);
		dataSource.css("display","block");

		// the rest of the form
		$("#data-structure").attr("value", FormData.data.structure);
		$("#data-name").attr("value", FormData.data.attributes.name);
		$("#data-value").attr("value", FormData.data.attributes.value);
		$("#data-children").attr("value", FormData.data.attributes.children);
		$("#data-x").attr("value", FormData.data.attributes.x);
		$("#data-y").attr("value", FormData.data.attributes.y);
		$("#data-scaleX").attr("value", FormData.data.scale.x);
		$("#data-scaleY").attr("value", FormData.data.scale.y);
	},
	getValue : function() {
		console.log('getting data value');
		
		FormData.data = {
			source : $("#data-source").attr("value"),
			structure : $("#data-structure").attr("value"),
			url : $("#data-url").attr("value"),
			file : $("#data-file").attr("value"),
			dataObject : FormData.data.dataObject,  //  I need to preserve this value if it is already set via file upload
			// I want to strip down the whitespace
			attributes : {
				name : $("#data-name").attr("value"),
				value : $("#data-value").attr("value"),
				children : $("#data-children").attr("value"),
				x : $("#data-x").attr("value"),
				y : $("#data-y").attr("value")
			},
			scale : {
				x : $("#data-scaleX").attr("value"),
				y : $("#data-scaleY").attr("value")
			}
		};

		// work out what data url to use
		if (FormData.data.structure === "flat") {
			FormData.data.dummy = $("#data-dummy-flat").attr("value");
		}
		else if (FormData.data.structure === "nested") {
			FormData.data.dummy = $("#data-dummy-nested").attr("value");
		}
		else if (FormData.data.structure === "quantitative") {
			FormData.data.dummy = $("#data-dummy-quantitative").attr("value");
		}
		else if (FormData.data.structure === "matrix") {
			FormData.data.dummy = $("#data-dummy-matrix").attr("value");
		}	
	},
	fileData : {},  // data object to hold uploaded file
	handleFileUpload : function() {
		// need to reference 'this' from the event handler
		var dataHandler = this;

		/*
		// a nice little function that will show the upload progress
		function updateProgress(evt) {
	        if (evt.lengthComputable) {
	            // evt.loaded and evt.total are ProgressEvent properties
	            var loaded = (evt.loaded / evt.total);
	            if (loaded < 1) {
	                // Increase the prog bar length
	                style.width = (loaded * 200) + "px";
	            }
	         }
	    };
	    */
	    
	    // event handling for file input
		$("#data-file").on("change", function(e) {
	        var result = ChartData.readFile(this.files[0]),
	        	reader = new FileReader(),
	        	regex = /\.([0-9a-z]+)(?:[\?#]|$)/i,
	        	fileType = this.files[0].name.match(regex)[0];

	        if (fileType === ".json" || fileType === ".csv" || fileType === ".tsv") {
	        	// read the file
	        	reader.readAsText(this.files[0], "UTF-8");
	        	//reader.onprogress = updateProgress;
	        	reader.onload = function(evt) {

	        		var fileString = evt.target.result;
			        // Handle UTF-16 file dump
			        //$('#output_field').text(fileString);
			        // convert the data
			        if (fileType.toLowerCase() === ".json") {
			        	// parse the JSON data and store it into the ChartData object
			        	ChartData.fileData = $.parseJSON(fileString);
			        	FormData.data.dataObject = ChartData.fileData;
						//console.log('setting datObject');
			        }
			        if (fileType.toLowerCase() === ".csv") {
			        	// parse the CSV file - using the csv.toArrays jquery plugin
			        	ChartData.fileData = $.csv.toArrays(fileString, {separator:","}); // ???
						// convert this to a json object
			        	FormData.data.dataObject = dataHandler.convertArrayToJSON(ChartData.fileData);
			        	//console.log(FormData.data.dataObject);
			        }
			        if (fileType.toLowerCase() === ".tsv") {
			        	// parse the TSV file - using the csv.toArrays jquery plugin
			        	ChartData.fileData = $.csv.toArrays(fileString, {separator:"	"}); // ???
						// convert this to a json object
			        	FormData.data.dataObject = dataHandler.convertArrayToJSON(ChartData.fileData);
						//console.log(FormData.data.dataObject);
			        }
	        	};  
	        }
	        else {
	        	alert("only JSON, CSV and TSV files are allowed");
	        } 
		});	
	},
	convertArrayToJSON : function(data) {
		// converts a set of arrays to a JSON object. When uploading a CSV and converting it to arrays, I want to then save it a JSON on the server
		// this only converts to a flat structured JSON object
		var result = [], // the empty data object to be returned
			attrLength = data[0].length,  // the amount of attributes in the matrix
			dataHeaders = data[0]; // the categories of the matrix
		
		//console.log(data);
		// loop through the array object and extract each row as a JSON object
		// start on the second row
		for (var i = 1; i < data.length; i++) {
			// loop through each element in this row
			var dataRow = {};  // the json data row
			for (var j = 0; j < data[i].length; j++) {
				dataRow[data[0][j]] = data[i][j];
			}
			//console.log(dataRow);
			// add the row to the result
			result.push(dataRow);
		};
		
		console.log(result);
		return result;
	},
	readFile : function(file) {
		var reader = new FileReader(),
		    result = 'empty';

		    reader.onload = function(e) {
		        result = e.target.result;
		    };

		    reader.readAsText(file);
		    return result;
	},
	dataSource : function() {
		$("#data-source").on("change", function() {
			var source = $(this).attr("value"),
				dataFields = $("fieldset.data .data-source");
				
			switch (source) {
				case "dummy" :
					dataFields.css("display", "none");
					$("fieldset.data .dummy").css("display", "block");	
					break;
				case "url" :
					dataFields.css("display", "none");
					$("fieldset.data .url").css("display", "block");	
					break;
				case "file" :
					dataFields.css("display", "none");
					$("fieldset.data .file").css("display", "block");	
					break;
				default : break;
			}
		});
	},
	dataStructure : function() {
		// handle the data structure select box
		$("#data-structure").on("change", function() {
			var structure = $(this).attr("value");
			
			ChartData.selectDataStructure(structure);
		});
	},
	selectDataStructure : function(structure) {
		var children = $("fieldset.data li.children");

		// hide show the right dummy data set
		$("li.data-source.dummy > div").css("display", "none");
		//console.log(structure);
		// hide the children field when the data structure is "flat"
		if (structure === "nested") {
			children.css("display", "block");
			$("li.data-source.dummy .nested").css("display", "block");
		}
		else if (structure === "flat") {
			children.css("display", "none");
			$("li.data-source.dummy .flat").css("display", "block");
		}
		else if (structure === "quantitative") {
			children.css("display", "none");
			$("li.data-source.dummy .quantitative").css("display", "block");
		}
		else if (structure === "matrix") {
			children.css("display", "none");
			$("li.data-source.dummy .matrix").css("display", "block");
		}
		// everything allowed
		else {
			children.css("display", "block");
		}
	}
};

ChartTheme = {
	init : function() {
		
	},
	reset : function() {
		// set to default values
		$("#theme-background-color").attr("value", "ffffff").trigger("keyup");
		$("#theme-header-name").attr("value", "");
		$("#theme-header-size").attr("value", "20");
		$("#theme-header-offsetY").attr("value", "0");
		$("#theme-header-offsetX").attr("value", "0");
		$("#theme-header-color").attr("value", "000000").css("color", "#fff").trigger("keyup");
		$("#theme-label-size").attr("value", "10");
		$("#theme-label-position").attr("value", "");
		$("#theme-label-color").attr("value", "000000").css("color", "#fff").trigger("keyup");
		$("#theme-data-border-size").attr("value", "1");
		$("#theme-data-border-color").attr("value", "000000").css("color", "#fff").trigger("keyup");
		$("#theme-data-spacing").attr("value", "1");
		// hide the sections
		$("fieldset.theme .theme-background, fieldset.theme .theme-header, fieldset.theme .theme-labels, fieldset.theme .theme-data").css("display", "none");
		// remove all the form validation classes
		$("fieldset.theme .validate").removeClass("fieldActiveInvalid");
		$("fieldset.theme .validate").removeClass("required");
		//$("fieldset.theme li.error
	},
	setValue : function() {
		// set to default values
		// if there is a background color then set it
		if (FormData.theme.backgroundColor) {
			$("#theme-background").attr("checked", "checked");
			$("li.theme-background").css("display", "block");
			$("#theme-background-color").attr("value", FormData.theme.backgroundColor).trigger("keyup");
		}
		// if there is a header then set it
		if (FormData.theme.headerName) {
			$("#theme-header").attr("checked", "checked");
			$("#li.theme-header").css("display", "block");
			$("#theme-header-name").attr("value", FormData.theme.headerName);
			$("#theme-header-size").attr("value", FormData.theme.headerSize);
			$("#theme-header-position").attr("value", FormData.theme.headerPosition);
			$("#theme-header-offsetY").attr("value", FormData.theme.headerOffset.y);
			$("#theme-header-offsetX").attr("value", FormData.theme.headerOffset.x);
			$("#theme-header-color").attr("value", FormData.theme.headerColor).trigger("keyup");
		}
		// if there are labels
		if (FormData.theme.labelSize) {
			$("#theme-labels").attr("checked", "checked");
			$("li.theme-labels").css("display", "block");
			$("#theme-label-size").attr("value", FormData.theme.labelSize);
			$("#theme-label-position").attr("value", FormData.theme.labelPosition);
			$("#theme-label-color").attr("value", FormData.theme.labelColor).trigger("keyup");
		}
		// the borders - still to do
		if (FormData.theme.borderSize) {

		}
		// still haven't build the data stuff in the theme object
		if (FormData.theme.data) {

		}

	},
	getValue : function() {
		var theme = {};
		
		// background color check
		if ($("#theme-background").attr("checked") === "checked") {
			theme.backgroundColor = $("#theme-background-color").attr("value");
		}
		else {
			theme.backgroundColor = false;
		}
		
		// header check
		if ($("#theme-header").attr("checked") === "checked") {
			theme.headerName = $("#theme-header-name").attr("value");
			theme.headerSize = parseFloat($("#theme-header-size").attr("value"));
			theme.headerPosition = $("#theme-header-position").attr("value");
			theme.headerOffset = {
				x : parseFloat($("#theme-header-offsetX").attr("value")),
				y : parseFloat($("#theme-header-offsetY").attr("value"))
			};
			theme.headerColor = $("#theme-header-color").attr("value");
		}
		else {
			theme.headerName = false;
			theme.headerSize = false;
			theme.headerPosition = false;
			theme.headerOffset = {
				x : 0,
				y : 0
			};
			theme.headerColor = "rgb(0,0,0)";
		}
		
		// label check
		if ($("#theme-labels").attr("checked") === "checked") {
			theme.labelSize = parseFloat($("#theme-label-size").attr("value"));
			theme.labelPosition = parseFloat($("#theme-label-position").attr("value"));
			theme.labelColor = $("#theme-label-color").attr("value");
		}
		else {
			theme.labelSize = false;
			theme.labelPosition = 0;
			theme.labelColor = "rgb(0,0,0)";
		}
		
		// chart data style
		if ($("#theme-data").attr("checked") === "checked") {
			theme.borderSize = parseFloat($("#theme-data-border-size").attr("value"));
			theme.borderColor = $("#theme-data-border-color").attr("value");
			theme.spacing = parseFloat($("#theme-data-spacing").attr("value"));
		}
		else {
			theme.borderSize = 0;
			theme.borderColor = "rgb(0,0,0)";
			theme.spacing = 0;
		}
		
		// update the data object for the form
		FormData.theme = theme;
	},
	// gets the header position when the .chartName element naturally sits at the top left of the chart
	getHeaderPosition : function(data) {
		var translate;

		// get the translate position of the header
        switch (data.theme.headerPosition) {
            case "topleft" : 
                translate = (0 + data.theme.headerOffset.x) + "px, " + (0 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "topcenter" : 
                translate = (data.size.width/2 + data.theme.headerOffset.x) + "px, " + (0 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "topright" : 
                translate = (data.size.width + data.theme.headerOffset.x -100) + "px," + (0 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "centerleft" : 
                translate = (0 + data.theme.headerOffset.x) + "px, " + (data.size.height/2 + data.theme.headerOffset.y - data.theme.headerSize) + "px";
                break;
            case "centerright" : 
                translate = (data.size.width + data.theme.headerOffset.x -100) + "px, " + (data.size.height/2 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "bottomleft" : 
                translate = (0 + data.theme.headerOffset.x) + "px, " + (data.size.height + data.theme.headerOffset.y - data.theme.headerSize) + "px";
                break;
            case "bottomcenter" : 
                translate = (data.size.width/2 + data.theme.headerOffset.x) + "px, " + (data.size.height + data.theme.headerOffset.y - data.theme.headerSize) + "px";
                break;
            case "bottomright" : 
                translate = (data.size.width + data.theme.headerOffset.x -100) + "px, " + (data.size.height + data.theme.headerOffset.y - data.theme.headerSize) + "px";
                break;
            default : 
                translate = "0,0";
                break;
        };

        console.log(translate);
        return translate;
	},
	// set the header position of the chart when the .chartName element is naturally centered on the chart
	getHeaderPositionCentered : function(data) {
        var translate;

        // get the translate position of the header
        switch (data.theme.headerPosition) {
            case "topleft" : 
                translate = (-data.size.width/2 + data.theme.headerOffset.x) + "px, " + (-data.size.height/2 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "topcenter" : 
                translate = (0 + data.theme.headerOffset.x) + "px, " + (-data.size.height/2 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "topright" : 
                translate = (data.size.width/2 + data.theme.headerOffset.x -100) + "px," + (-data.size.height/2 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "centerleft" : 
                translate = (-data.size.width/2 + data.theme.headerOffset.x) + "px, " + (0 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "centerright" : 
                translate = (data.size.width/2 + data.theme.headerOffset.x - 100) + "px, " + (0 + data.theme.headerOffset.y + data.theme.headerSize) + "px";
                break;
            case "bottomleft" : 
                translate = (-data.size.width/2 + data.theme.headerOffset.x) + "px, " + (data.size.height/2 + data.theme.headerOffset.y) + "px";
                break;
            case "bottomcenter" : 
                translate = (0 + data.theme.headerOffset.x) + "px, " + (data.size.height/2 + data.theme.headerOffset.y) + "px";
                break;
            case "bottomright" : 
                translate = (data.size.width/2 + data.theme.headerOffset.x -100) + "px, " + (data.size.height/2 + data.theme.headerOffset.y) + "px";
                break;
            default : 
                translate = "0,0";
                break;
        };

        //console.log(translate);
        return translate;
    }
};

ChartEvents = {
	reset : function() {
		// set to default values
		// nothing to do here just yet
	},
	setValue : function() {
		// set to default values
		// nothing to do here for now
	},
	getValue : function() {
		
	}
};

// run everything at document ready - this is the master controller!!!
$(document).ready(function()
{
	// initialise interactive parts of the form
	ChartType.init();
	ChartTheme.init();
	ChartColors.init();
	ChartData.init();
	// initialise the Chart Builder object
	// but only after the form sections have been initialised properly
	// looks like I need a timeout as there is a timeout in the color initialisation
	setTimeout(function() {
		ChartBuilder.init();	
	}, 0);

	// run the plugins
	Plugins.init();
});


