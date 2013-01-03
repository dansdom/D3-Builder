 // TO DO LIST:
// 1. crack on with data handling in the form - start with getValue
// 2. work out WTF I'm doing with the chart events
// 3. make sure each form section is updating the global formData object
// 4. start building out the update Chart functions
// 5. number 4 will invovle hooking up the chart type fieldset. This I want to do after most of the other form elements
// 6. Figure out some tech (PHP) to hook up the code packaging operations


// this object is used to handle the form data on the page
ChartBuilder = {
	init : function() {
		this.submission();
		this.showSection();
		// take a snapshot and store the form value so that the user can undo any changes
		this.takeSnapshot();
		
		// bind a global event here that will update the chart object
		$(document).on("updateChart", function() {
			// I should do my validation here before storing the data
			ChartBuilder.validateForm();
			// store the form data object
			ChartBuilder.takeSnapshot();
			ChartBuilder.buildChart();
		});
	},
	submission : function() {
		
		// I'll definately need some form validation as I don't want the user to trip shit up
		// maybe even fall back to a default value if the values are shite?
		
		var builder = this;
		
		$("#build-update").click(function() {
			// I'll need a function to grab all the form data here
			ChartBuilder.takeSnapshot();
			ChartBuilder.buildChart();
		});
		
		$("#build-submit").on("click", function() {
			// get the form data
			ChartBuilder.takeSnapshot();
			ChartBuilder.buildChart();
			// I'll have a seperate object to build the output
			CodeBuilder.packageCode();
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
	undoChanges : function() {
		// this function will undo the last changes from before the update chart function
	},
	takeSnapshot : function() {
		// this takes a snapshot of the form state so that I can undo an updateChart
		ChartType.getValue();
		ChartSize.getValue();
		ChartColors.getValue();
		ChartData.getValue();
		ChartTheme.getValue();
		ChartEvents.getValue();
		console.log(FormData);
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
				Sunburst.init();
				break;
			default :
				break;
		};
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
			var value = $(this).attr("value");
			$("li.type-settings").css("display", "none");
			$("li." + value).css("display", "block");
		});
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
		this.addColorPickers();
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
	addColorPickers : function() {
		var paletteColors = $("fieldset.color .palette li.color input");
		
		paletteColors.jPicker({
			window: {
				expandable : true,
				title : 'Data Colour',
				position : {
					x: 'screenCenter',
					y: 200
				}
			},
			images : {
				clientPath : 'css/img/'
			}
		});	
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
			//console.log(ChartColors[colorScheme].length);
			// I will need to keep track of the color scheme length here. doh!
			var schemeLength = ChartColors[colorScheme].length;
			$("fieldset.color .palette li.color:lt(" + schemeLength + ")").addClass("selected");
			$("fieldset.color .palette li.color:gt(" + (schemeLength-1) + ")").removeClass("selected");
			// I need to set the palette size to auto
			$("#color-palette-size").attr("value", 0);
			// will need to set the palette to the right size for the particular scheme
			ChartColors.paletteSize = schemeLength;
			if (colorScheme === "0") {
				console.log("not changing the scheme");
				return;
			}
			ChartColors.changeColorScheme(colorScheme);
		});
	},
	changeColorScheme : function(newScheme) {
		// changes the color palette
		//console.log(newScheme);
		var colorArray = ChartColors[newScheme],
			colorArrayLength = colorArray.length,
			palette = $("fieldset.color .palette");
		
		for (var i = 0; i < colorArrayLength; i++) {
			// populate the inputs
			// I have to trigger a keyup event here so that the jpicker plugin can read the value of the input field
			palette.find("li:eq(" + i + ")").find("input").attr("value", colorArray[i]).trigger("keyup");
		}
		// I'll remove values for those items larger than the array length
		palette.find("li:gt(" + (colorArrayLength - 1) + ")").find("input").attr("value", "").trigger("keyup");
	}
};

ChartData = {
	init : function() {
		this.dataSource();
		this.dataStructure();
	},
	getValue : function() {
		
		FormData.data = {
			source : $("#data-source").attr("value"),
			structure : $("#data-structure").attr("value"),
			url : $("#data-url").attr("value"),
			file : $("#data-file").attr("value"),
			// I want to strip down the whitespace
			attributes : {
				name : $("#data-name").attr("value"),
				value : $("#data-value").attr("value"),
				children : $("#data-children").attr("value")
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
		else {
			FormData.data.dummy = $("#data-dummy-nested").attr("value");
		}
		
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
	// I think I might a function for each of the data sources
	sourceDummy : function() {
		$("#dummy-data").on("change", function() {
			// run the change function
		});
	},
	sourceUrl : function() {
		
	},
	sourceFile : function() {
		
	},
	dataStructure : function() {
		// handle the data structure select box
		$("#data-structure").on("change", function() {
			var structure = $(this).attr("value"),
				children = $("fieldset.data li.children");
			
			// hide show the right dummy data set
			$("li.data-source.dummy div").css("display", "none");
			//console.log(structure);
			// hide the children field when the data structure is "flat"
			if (structure === "nested") {
				children.css("display", "block");
				$("li.data-source.dummy .nested").css("display", "block");
			}
			else {
				children.css("display", "none");
				$("li.data-source.dummy .flat").css("display", "block");
			}
		});
	}
};

ChartTheme = {
	init : function() {
		this.addColorPickers();
	},
	getValue : function() {
		var theme = {};
		
		// background color check
		if ($("#theme-background").attr("checked") === "checked") {
			theme.backgroundColor = parseFloat($("#theme-background-color").attr("value"));
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
			theme.labelColor = $("theme-label-color").attr("value");
		}
		else {
			theme.labelSize = false;
			theme.labelPosition = 0;
			theme.labelColor = "rgb(0,0,0)";
		}
		
		// chart data style
		if ($("#theme-data").attr("checked") === "checked") {
			theme.borderSize = parseFloat($("#theme-data-border-size").attr("value"));
			theme.borderColor = $("theme-data-border-color").attr("value");
		}
		else {
			theme.borderSize = 0;
			theme.borderColor = "rgb(0,0,0)";
		}
		
		// update the data object for the form
		FormData.theme = theme;
	},
	addColorPickers : function() {
		$("#theme-background-color, #theme-header-color, #theme-label-color, #theme-data-border-color").jPicker({
			window: {
				expandable : true,
				title : 'Theme Colour',
				position : {
					x: 'screenCenter',
					y: 200
				}
			},
			images : {
				clientPath: 'css/img/'
			}
		});
	}
};

ChartEvents = {
	getValue : function() {
		
	}
};

// run everything at document ready
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
	
	// call plugins from here
	// tabs for the form filedsets
	$("#chart-settings").tabs({
		'tabNav': '#formNav ul',
        'tabContent': '#chart-settings',
        'startTab' : 1,
        'fadeIn' : true,
        'fadeSpeed' : 300
	});
	
	// instead of making generic chart, do a getValue and build from the form object
	
	// start off by making the generic pie chart
	/*
	var chart = document.getElementById("chart-preview");
	d3.pie(chart, {
        'radius': 280,
        'width' : 700,
        'height' : 700,
        'padding': 10,
        'dataUrl' : 'data/data.json',
        'dataType' : 'json',
        'dataStructure' : {
			'name' : 'name',
			'value' : 'value'
        }
    });
	*/
	
});























