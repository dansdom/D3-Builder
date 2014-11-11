// TO DO LIST:
// 1. I think the data options aren't 100% yet
// 4. optimise the jQuery selectors. atm they are like a big pile of shit.

// updates: 
// 1. These plugins need to be updated from their seperate repo: chord, scatterplot, bar and area charts
// 2. new options for the axis elements for the scatterplot, bar and area charts
// 3. new tick length option for the chord chart

// Priorities:
// 2. data parsing from inside each plugin. There needs to be regex that strips out garbage and then parseFloat of those qualitative values on the chart
// 3. implement the spacing attribute on the force chrt. use it to set the force between tree nodes
// 4. there are a bunch of plugin settings (see 2. - also for the chord chart) that are no fully implemented through the interface. Namely the "theme" tab. This needs to be gone through
// 5. add a nice animation transition for the scales? that would be nice
// 6. interface options that will hide and show available settings field for each chart
// !!! on the x,y charts this line - .rangeRoundBands([0, container.width], 0.1); needs to be fixed up and added as an option for the user to set.
// 7. intergrate my streamgraph plugin
// Known Bugs (that are bugging me)
// none


// Chart Plugins priority:
// 1. Streamgraph
// 2. difference chart
// 3. stacked area and line chart
// 4. tree layout
// 5. Hierarchical Edge Bundling
// 6. node link tree

var D3Builder = D3Builder || {};

D3Builder.chartBuilder = (function($, d3, undefined) {
    'use strict';
    // this object is used to handle the form data on the page
    var chartBuilder = {
        init : function() {
            var builder = this;
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
                builder.validateForm();
                // store the form data object
                builder.takeSnapshot();
                // build the chart
                builder.buildChart();
            });
        },
        formActions : function() {
            var builder = this;
            // I'll definately need some form validation as I don't want the user to trip shit up
            // maybe even fall back to a default value if the values are shite?
            $("#build-update").on("click", function() {
                // I'll need a function to grab all the form data here
                builder.takeSnapshot();
                // first validate the form
                $("#chart-settings").validator("validateForm");
                // build the chart
                //builder.buildChart(); - moved to the submit function in Plugins.validator()
            });

            $("#build-reset").on("click", function() {
                builder.resetForm();
            });

            $("#build-save").on("click", function() {
                // save the chart data to the cookie
                builder.takeSnapshot();
                // build the chart
                builder.writeCookie();
            });

            $("#build-load").on("click", function() {
                // reset the form first
                builder.resetForm();
                // load the chart data from the cookie
                if (builder.getCookie()) {
                    // build the chart
                    builder.setFormValues();
                    // first validate the form
                    $("#chart-settings").validator("validateForm");
                    // once this is done I will show the saved chart
                    //builder.buildChart(); - moved to the submit function in Plugins.validator()
                }
            });
            
            $("#build-submit").on("click", function() {
                // get the form data
                builder.takeSnapshot();
                // first validate the form
                $("#chart-settings").validator("validateForm");
                //builder.buildChart(); - moved to the submit function in Plugins.validator()
                // I'll have a seperate object to build the output
                // I need to check if the form is valid first
                if (D3Builder.plugins.validator.isValid === true) {
                    D3Builder.codeBuilder.packageCode();
                }
            });
        },
        // show/hide sections in the form.
        showSection : function() {
            $(".show-section").on("change", function() {
                var section = $(this),
                    sectionItems = $(this).attr("id");
                    
                if (section.prop("checked")) {
                    $("." + sectionItems).css("display", "block");
                } else {
                    $("." + sectionItems).css("display", "none");
                }
            });
        },
        takeSnapshot : function() {
            // this takes a snapshot of the form state so that I can undo an updateChart
            D3Builder.chartType.getValue();
            D3Builder.chartSize.getValue();
            D3Builder.chartColors.getValue();
            D3Builder.chartData.getValue();
            D3Builder.chartTheme.getValue();
            D3Builder.chartEvents.getValue();
            //console.log('taking snapshot');
            //console.log(D3Builder.formData);
        },
        resetForm : function() {
            // I need to destroy the current chart
            var chart = document.getElementById("chart-preview");
            if (D3Builder.formData.type.current) {
                d3[D3Builder.formData.type.current](chart, "destroy");
                D3Builder.formData.type.current = null;
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
            D3Builder.chartType.reset();
            D3Builder.chartSize.reset();
            D3Builder.chartColors.reset();
            D3Builder.chartData.reset();
            D3Builder.chartTheme.reset();
            D3Builder.chartEvents.reset();
            //console.log('resetting form');
            //console.log(D3Builder.formData);
            // reset the form data object
            D3Builder.formData = D3Builder.formDefault;
            // show the first tab
            $("#chart-settings").tabs("showTab", 0);
            // reset the required fields
            $("#chart-settings").validator('getValidationFields');
        },
        setFormValues : function() {
            // this is the function that takes the cookie value and inserts it into the form
            console.log('setting form values');
            console.log(D3Builder.formData);
            D3Builder.chartType.setValue();
            D3Builder.chartSize.setValue();
            D3Builder.chartColors.setValue();
            D3Builder.chartData.setValue();
            D3Builder.chartTheme.setValue();
            D3Builder.chartEvents.setValue();
        },
        buildChart : function() {
            switch (D3Builder.formData.type.primary) {
                case "pie" :
                    D3Builder.pieChart.init();
                    break;
                case "pack" :
                    D3Builder.packChart.init();
                    break;
                case "sunburst" :
                    D3Builder.sunburstChart.init();
                    break;
                case "force" :
                    D3Builder.forceChart.init();
                    break;
                case "area" :
                    D3Builder.areaChart.init();
                    break;
                case "bar" :
                    D3Builder.barChart.init();
                    break;
                case "chord" :
                    D3Builder.chordChart.init();
                    break;
                case "scatterplot" :
                    D3Builder.scatterplotChart.init();
                    break;
                case "streamgraph" :
                    D3Builder.streamgraphChart.init();
                    break;
                default :
                    break;
            }
        },
        writeCookie : function() {
            // writes a cookie with the form settings
            console.log('writing cookie');
            $.cookie("chart_cookie", JSON.stringify(D3Builder.formData), {expires: 365});
        },
        getCookie : function() {
            // returns the cookie
            var cookieData = JSON.parse($.cookie("chart_cookie"));
            
            if (cookieData) {
                D3Builder.formData = cookieData;
                return true;
            } else {
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

    return chartBuilder;
})(jQuery, d3);

D3Builder.chartType = (function($, d3, undefined) {
    'use strict';
    // each section of the form will have it's own object that will control that part of the interface
    var chartType = {
        init : function() {
            this.showType();
        },
        // handles the chart type selection interaction
        showType : function() {
            $("#type-chart").on("change", function() {
                var chartType = $(this).prop("value"),
                    dataSelect = $("#data-structure"),
                    scaleX = $("#data-scaleX"),
                    scaleY = $("#data-scaleY"),
                    dataAllowed = D3Builder.config.dataAllowed[chartType],
                    dataAttributes = D3Builder.config.dataAttributes[chartType],
                    dataScaleX = D3Builder.config.dataScaleX[chartType],
                    dataScaleY = D3Builder.config.dataScaleY[chartType],
                    sizeAttributes = D3Builder.config.sizeAttributes[chartType],
                    options = "",
                    i;

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
                        }
                    }
                    return options;
                }

                // show the secondary chart type select box
                $("li.type-settings").css("display", "none");
                $("li." + chartType).css("display", "block");
                
                // work out what data options to make available. The the array of data allowed for this chart type
                for (i = 0; i < dataAllowed.length; i++) {
                    switch (dataAllowed[i]) {
                        case "flat" : 
                            options += "<option value='flat'>Ordinal Flat</option>";
                            break;
                        case "nested" :
                            options += "<option value='nested'>Ordinal Nested</option>";
                            break;
                        case "quantitative" :
                            options += "<option value='quantitative'>Quantitative</option>";
                            break;
                        case "matrix" :
                            options += "<option value='matrix'>Matrix</option>";
                            break;
                        default : break;
                    }
                }
                // refresh the data structure field
                dataSelect.html(options);
                // set the value as the first option on the data-structure option list
                dataSelect.find("option:eq(0)").attr("selected", "selected");
                var dataSelected = $("#data-structure option:eq(0)").prop("value");

                // work out what data attributes are available and then show those inputs
                $("li.data-attributes").css("display", "none");
                for (i = 0; i < dataAttributes.length; i++) {
                    $("li.data-attributes." + dataAttributes[i]).css("display", "block");
                }

                // work out what theme attributes are available and then show them
                $("li.size-attributes").css("display", "none");
                for (i = 0; i < sizeAttributes.length; i++) {
                    $("li.size-attributes." + sizeAttributes[i]).css("display", "block");
                }

                // refresh the x-scale dropdown list
                scaleX.html(setScale(dataScaleX));
                // refresh the x-scale dropdown list
                scaleY.html(setScale(dataScaleY));

                // #### work out what ranges to display #######
                // On the to-do list
                $("li.data-range").css("display", "none");
                
                // select the data structure
                D3Builder.chartData.selectDataStructure(dataSelected);
                // set the class on the body object to control the help options
                D3Builder.chartType.setBodyType(chartType);
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
            $("#type-chart").prop("value", D3Builder.formData.type.primary);
            // if the primary is set then find the secondary
            if (D3Builder.formData.type.primary) {
                // shoe the submenu
                $("li.type-settings." + D3Builder.formData.type.primary).css("display", "block");
                $("#type-chart-" + D3Builder.formData.type.primary).prop("value", D3Builder.formData.type.secondary);
            }
        },
        getValue : function() {
            var type = $("#type-chart").prop("value");
            // set the form Data object if the chart type is set
            if (type) {
                D3Builder.formData.type.primary = type;
                D3Builder.formData.type.secondary = $("li." + type + " select").prop("value");
            }
        }
    };
    
    return chartType;
})(jQuery, d3);

D3Builder.chartSize = (function($, d3, undefined) {
    'use strict';

    var chartSize = {
        reset : function() {
            // set to default values
            var sizes = D3Builder.formDefault.size;
            $("#size-height").prop("value", sizes.height);
            $("#size-width").prop("value", sizes.width);
            $("#size-outer-radius").prop("value", sizes.outerRadius);
            $("#size-inner-radius").prop("value", sizes.innerRadius);
            $("#size-padding").prop("value", sizes.padding);
            $("#size-padding-top").prop("value", sizes.paddingTop);
            $("#size-padding-bottom").prop("value", sizes.paddingBottom);
            $("#size-padding-left").prop("value", sizes.paddingLeft);
            $("#size-padding-right").prop("value", sizes.paddingRight);
        },
        setValue : function() {
            // set to default values
            var sizes = D3Builder.formData.size;
            $("#size-height").prop("value", sizes.height);
            $("#size-width").prop("value", sizes.width);
            $("#size-outer-radius").prop("value", sizes.outerRadius);
            $("#size-inner-radius").prop("value", sizes.innerRadius);
            $("#size-padding").prop("value", sizes.padding);
            $("#size-padding-top").prop("value", sizes.paddingTop);
            $("#size-padding-bottom").prop("value", sizes.paddingBottom);
            $("#size-padding-left").prop("value", sizes.paddingLeft);
            $("#size-padding-right").prop("value", sizes.paddingRight);
        },
        getValue : function() {
            D3Builder.formData.size = {
                height : parseFloat($("#size-height").prop("value")),
                width : parseFloat($("#size-width").prop("value")),
                outerRadius : parseFloat($("#size-outer-radius").prop("value")),
                innerRadius : parseFloat($("#size-inner-radius").prop("value")),
                padding : parseFloat($("#size-padding").prop("value")),
                paddingTop : parseFloat($("#size-padding-top").prop("value")),
                paddingBottom : parseFloat($("#size-padding-bottom").prop("value")),
                paddingLeft : parseFloat($("#size-padding-left").prop("value")),
                paddingRight : parseFloat($("#size-padding-right").prop("value"))
            };
        }
    };

    return chartSize;
})(jQuery, d3);

D3Builder.chartColors = (function($, d3, undefined) {
    'use strict';

    var chartColors = {
        init : function() {
            var colors = this;
            // I'll need to add the default color palette values before I start the initialise the color pickers
            this.managePaletteSize();
            // changes the color scheme
            setTimeout(function() {
                // I need for the color pickers to be finished initialising before I can run this function. bugger
                // set a timeout of 0 to do this. note: I should browser test that this works ok elsewhere
                colors.manageColorScheme();    
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
            $("#color-scheme").prop("value", 0);
            // set palette size to auto
            $("#color-palette-size").prop("value", 0);
            // remove the selected class
            $("fieldset.color .palette li").removeClass("selected");

        },
        setValue : function() {
            // set to default values
            var paletteSize = D3Builder.formData.colors.length,
                paletteList = $("fieldset.color .palette li");

            // set it to a custom scheme
            $("#color-scheme").prop("value", 0);
            // set palette size to auto
            $("#color-palette-size").prop("value", 0);

            for (var i = 0; i < paletteSize; i++) {
                $(paletteList[i]).addClass("selected").find("input").prop("value", D3Builder.formData.colors[i]).trigger("change");
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
                var currentValue = $(this).find("input").prop("value");
                // if currentValue is a color, then add it, else forget it
                if (currentValue) {
                    // turn it into a hex value
                    colorScheme.push("#" + currentValue);
                }
            });
            // update the data object
            D3Builder.formData.colors = colorScheme;
        },
        // palette size counter
        paletteSize : 0,
        managePaletteSize : function() {
            var colors = this,
                paletteColors = $(".palette li.color input");
            
            colors.paletteSize = parseInt($("#color-palette-size").prop("value"));
            // I need to populate the intial palette size
            //console.log(paletteSize);
            $("fieldset.color .palette li.color:lt(" + colors.paletteSize + ")").addClass("selected");
            
            $("#color-palette-size").on("change", function() {
                // update the palette size variable
                colors.paletteSize = parseInt($(this).prop("value"));
                // if it's a custom size then do nothing
                if (colors.paletteSize > 0) {
                    $("fieldset.color .palette li.color:lt(" + colors.paletteSize + ")").addClass("selected");
                    $("fieldset.color .palette li.color:gt(" + (colors.paletteSize - 1) + ")").removeClass("selected");
                }
            });
            
            // add a color to the palette
            $("#color-add").on("click", function() {
                if (colors.paletteSize === 30) {
                    alert("The maximum size of the palette is 30 colours");
                    return;
                }
                // update the palette size
                colors.paletteSize++;
                //console.log(paletteSize);
                $("fieldset.color .palette li.color:eq(" + (colors.paletteSize - 1) + ")").addClass("selected");
                // set palette size to "auto"
                $("#color-palette-size").prop("value", 0);
                // set the theme to custom
                $("#color-scheme").prop("value", 0);
            });
            
            // remove a color from the palette
            $("#color-remove").on("click", function() {
                // check that palette size is not 0
                if (colors.paletteSize === 1) {
                    alert("the palette needs at least one colour");
                    return;
                }
                // update the palette size
                colors.paletteSize--;
                //console.log(paletteSize);
                $("fieldset.color .palette li.selected:eq(" + colors.paletteSize + ")").removeClass("selected");
                // set palette size to "auto"
                $("#color-palette-size").prop("value", 0);
                // set the theme to custom
                $("#color-scheme").prop("value", 0);
            });
        },
        manageColorScheme : function() {
            var colors = this,
                // when page initialises, insert the default color scheme
                colorScheme = $("#color-scheme").prop("value");

            if (colorScheme === "0") {
                console.log("there is no color scheme selected");
            } else {
                colors.changeColorScheme(colorScheme);
            }
            
            // event handling for the select box
            $("#color-scheme").on("change", function() {
                colorScheme = $(this).prop("value");
                if (colorScheme === "0") {
                    console.log("not changing the scheme");
                    return;
                }
                //console.log(ChartColors[colorScheme].length);
                // I will need to keep track of the color scheme length here. doh!
                var schemeLength = colors[colorScheme].length;
                $("fieldset.color .palette li.color:lt(" + schemeLength + ")").addClass("selected");
                $("fieldset.color .palette li.color:gt(" + (schemeLength-1) + ")").removeClass("selected");
                // I need to set the palette size to auto
                $("#color-palette-size").prop("value", 0);
                // will need to set the palette to the right size for the particular scheme
                colors.paletteSize = schemeLength;
                colors.changeColorScheme(colorScheme);
            });
        },
        changeColorScheme : function(newScheme) {
            // changes the color palette
            //console.log(newScheme);
            var colors = this,
                colorArray = colors[newScheme],
                colorArrayLength = colorArray.length,
                palette = $("fieldset.color .palette");
            
            for (var i = 0; i < colorArrayLength; i++) {
                // populate the inputs
                // I have to trigger a keyup event here so that the jpicker plugin can read the value of the input field
                palette.find("li:eq(" + i + ")").find("input").prop("value", colorArray[i]).trigger("change");
            }
            // I'll remove values for those items larger than the array length
            palette.find("li:gt(" + (colorArrayLength - 1) + ")").find("input").prop("value", "").trigger("change");
        }
    };

    return chartColors;
})(jQuery, d3);

D3Builder.chartData = (function($, d3, undefined) {
    'use strict';

    var chartData = {
        init : function() {
            this.dataSource();
            this.dataStructure();
            this.handleFileUpload();
        },
        reset : function() {
            // set to default values
            var defaults = D3Builder.formDefault;
            // set to default values
            $("#data-source").prop("value", defaults.data.source);

            $(".data-source").css("display", "none");
            var dataSource = $(".data-source." + defaults.data.source);
            dataSource.css("display","block");

            // the rest of the form
            $("#data-structure").prop("value", defaults.data.structure);
            $("#data-name").prop("value", defaults.data.attributes.name);
            $("#data-value").prop("value", defaults.data.attributes.value);
            $("#data-children").prop("value", defaults.data.attributes.children);
            $("#data-key").prop("value", defaults.data.attributes.key);
            $("#data-x").prop("value", defaults.data.attributes.x);
            $("#data-y").prop("value", defaults.data.attributes.y);
            $("#data-scaleX").prop("value", defaults.data.scale.x);
            $("#data-scaleY").prop("value", defaults.data.scale.y);
        },
        setValue : function() {
            var formData = D3Builder.formData;
            // set to default values
            $("#data-source").prop("value", formData.data.source);

            $(".data-source").css("display", "none");
            var dataSource = $(".data-source." + formData.data.source);
            dataSource.css("display","block");

            // the rest of the form
            $("#data-structure").prop("value", formData.data.structure);
            $("#data-name").prop("value", formData.data.attributes.name);
            $("#data-value").prop("value", formData.data.attributes.value);
            $("#data-children").prop("value", formData.data.attributes.children);
            $("#data-key").prop("value", formData.data.attributes.key);
            $("#data-x").prop("value", formData.data.attributes.x);
            $("#data-y").prop("value", formData.data.attributes.y);
            $("#data-scaleX").prop("value", formData.data.scale.x);
            $("#data-scaleY").prop("value", formData.data.scale.y);
        },
        getValue : function() {
            //console.log('getting data value');
            var formData = D3Builder.formData;
            
            formData.data = {
                source : $("#data-source").prop("value"),
                structure : $("#data-structure").prop("value"),
                url : $("#data-url").prop("value"),
                file : $("#data-file").prop("value"),
                dataObject : formData.data.dataObject,  //  I need to preserve this value if it is already set via file upload
                // I want to strip down the whitespace
                attributes : {
                    name : $("#data-name").prop("value"),
                    value : $("#data-value").prop("value"),
                    children : $("#data-children").prop("value"),
                    key : $("#data-key").prop("value"),
                    x : $("#data-x").prop("value"),
                    y : $("#data-y").prop("value")
                },
                scale : {
                    x : $("#data-scaleX").prop("value"),
                    y : $("#data-scaleY").prop("value")
                }
            };

            // work out what data url to use
            if (formData.data.structure === "flat") {
                formData.data.dummy = $("#data-dummy-flat").prop("value");
            }
            else if (formData.data.structure === "nested") {
                formData.data.dummy = $("#data-dummy-nested").prop("value");
            }
            else if (formData.data.structure === "quantitative") {
                formData.data.dummy = $("#data-dummy-quantitative").prop("value");
            }
            else if (formData.data.structure === "matrix") {
                formData.data.dummy = $("#data-dummy-matrix").prop("value");
            }   
        },
        fileData : {},  // data object to hold uploaded file
        handleFileUpload : function() {
            // need to reference 'this' from the event handler
            var dataHandler = this,
                formData = D3Builder.formData;

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
                var result = dataHandler.readFile(this.files[0]),
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
                            dataHandler.fileData = $.parseJSON(fileString);
                            formData.data.dataObject = dataHandler.fileData;
                            //console.log('setting datObject');
                        }
                        if (fileType.toLowerCase() === ".csv") {
                            // parse the CSV file - using the csv.toArrays jquery plugin
                            dataHandler.fileData = $.csv.toArrays(fileString, {separator:","}); // ???
                            // convert this to a json object
                            formData.data.dataObject = dataHandler.convertArrayToJSON(dataHandler.fileData);
                            //console.log(formData.data.dataObject);
                        }
                        if (fileType.toLowerCase() === ".tsv") {
                            // parse the TSV file - using the csv.toArrays jquery plugin
                            dataHandler.fileData = $.csv.toArrays(fileString, {separator:"    "}); // ???
                            // convert this to a json object
                            formData.data.dataObject = dataHandler.convertArrayToJSON(dataHandler.fileData);
                            //console.log(formData.data.dataObject);
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
            }
            
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
                var source = $(this).prop("value"),
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
            var chartData = this;
            // handle the data structure select box
            $("#data-structure").on("change", function() {
                var structure = $(this).prop("value");
                
                chartData.selectDataStructure(structure);
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
                // select the X scale option
                $("#data-scaleX").val("ordinal").change();  
            }
            else if (structure === "quantitative") {
                children.css("display", "none");
                $("li.data-source.dummy .quantitative").css("display", "block");
                // select the X scale option
                $("#data-scaleX").val("linear").change();  
            }
            else if (structure === "matrix") {
                children.css("display", "none");
                $("li.data-source.dummy .matrix").css("display", "block");
                // select the X scale option
                $("#data-scaleX").val("linear").change();  
            }
            // everything allowed
            else {
                children.css("display", "block");
            }
        }
    };

    return chartData;
})(jQuery, d3);

D3Builder.chartTheme = (function($, d3, undefined) {
    'use strict';

    var chartTheme = {
        init : function() {
            // set the range value
            var opacity = $('#theme-data-opacity').prop('value');
            $('#theme-data-opacity-value').html(opacity);
            $('#theme-data-opacity').on('change', function(e) {
                $('#theme-data-opacity-value').html($(this).prop('value'));
            });
        },
        reset : function() {
            // set to default values
            $("#theme-background-color").prop("value", "ffffff").trigger("keyup");
            $("#theme-header-name").prop("value", "");
            $("#theme-header-size").prop("value", "20");
            $("#theme-header-offsetY").prop("value", "0");
            $("#theme-header-offsetX").prop("value", "0");
            $("#theme-header-color").prop("value", "000000").css("color", "#fff").trigger("keyup");
            $("#theme-label-size").prop("value", "10");
            $("#theme-label-position").prop("value", "1");
            $("#theme-label-color").prop("value", "000000").css("color", "#fff").trigger("keyup");
            $("#theme-data-border-size").prop("value", "1");
            $("#theme-data-border-color").prop("value", "000000").css("color", "#fff").trigger("keyup");
            $("#theme-data-opacity").prop("value", "0.5");
            $("#theme-data-spacing").prop("value", "1");
            $("#theme-legend-size").prop("value", "16");
            $("#theme-legend-align").prop("value", "right");
            $("#theme-legend-offsetX").prop("value", "0");
            $("#theme-legend-offsetY").prop("value", "0");
            // hide the sections
            $("fieldset.theme .theme-background, fieldset.theme .theme-header, fieldset.theme .theme-labels, fieldset.theme .theme-data").css("display", "none");
            // remove all the form validation classes
            $("fieldset.theme .validate").removeClass("fieldActiveInvalid");
            $("fieldset.theme .validate").removeClass("required");
            //$("fieldset.theme li.error
        },
        setValue : function() {
            var formData = D3Builder.formData;
            // set to default values
            // if there is a background color then set it
            if (formData.theme.backgroundColor) {
                $("#theme-background").attr("checked", "checked");
                $("li.theme-background").css("display", "block");
                $("#theme-background-color").prop("value", formData.theme.backgroundColor).trigger("keyup");
            }
            // if there is a header then set it
            if (formData.theme.headerName) {
                $("#theme-header").attr("checked", "checked");
                $("#li.theme-header").css("display", "block");
                $("#theme-header-name").prop("value", formData.theme.headerName);
                $("#theme-header-size").prop("value", formData.theme.headerSize);
                $("#theme-header-position").prop("value", formData.theme.headerPosition);
                $("#theme-header-offsetY").prop("value", formData.theme.headerOffset.y);
                $("#theme-header-offsetX").prop("value", formData.theme.headerOffset.x);
                $("#theme-header-color").prop("value", formData.theme.headerColor).trigger("keyup");
            }
            // if there are labels
            if (formData.theme.labelSize) {
                $("#theme-labels").attr("checked", "checked");
                $("li.theme-labels").css("display", "block");
                $("#theme-label-size").prop("value", formData.theme.labelSize);
                $("#theme-label-position").prop("value", formData.theme.labelPosition);
                $("#theme-label-color").prop("value", formData.theme.labelColor).trigger("keyup");
            }
            // if there are borders
            if (formData.theme.borderSize) {
                $("#theme-data-border-size").prop("value", formData.theme.borderSize);
                $("#theme-data-border-color").prop("value", formData.theme.borderColor).trigger("keyup");
                $("#theme-data-spacing").prop("value", formData.theme.spacing);
                $("#theme-data-opacity").prop("value", formData.theme.opacity);
                $("#theme-data-opacity-value").html(formData.theme.opacity);
            }
            // if there is a legend
            if (formData.theme.legendSize) {
                $("#theme-legend-size").prop("value", formData.theme.legendSize);
                $("#theme-legend-align").prop("value", formData.theme.legendAlign);
                $("#theme-legend-offsetX").prop("value", formData.theme.legendOffset.x);
                $("#theme-legend-offsetY").prop("value", formData.theme.legendOffset.y);
            }
        },
        getValue : function() {
            var theme = {};
            
            // background color check
            if ($("#theme-background").prop("checked")) {
                theme.backgroundColor = $("#theme-background-color").prop("value");
            }
            else {
                theme.backgroundColor = false;
            }
            
            // header check
            if ($("#theme-header").prop("checked")) {
                theme.headerName = $("#theme-header-name").prop("value");
                theme.headerSize = parseFloat($("#theme-header-size").prop("value"));
                theme.headerPosition = $("#theme-header-position").prop("value");
                theme.headerOffset = {
                    x : parseFloat($("#theme-header-offsetX").prop("value")),
                    y : parseFloat($("#theme-header-offsetY").prop("value"))
                };
                theme.headerColor = $("#theme-header-color").prop("value");
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
            if ($("#theme-labels").prop("checked")) {
                theme.labelSize = parseFloat($("#theme-label-size").prop("value"));
                theme.labelPosition = parseFloat($("#theme-label-position").prop("value"));
                theme.labelColor = $("#theme-label-color").prop("value");
            }
            else {
                theme.labelSize = false;
                theme.labelPosition = 0;
                theme.labelColor = "rgb(0,0,0)";
            }
            
            // chart data style
            if ($("#theme-data").prop("checked")) {
                theme.borderSize = parseFloat($("#theme-data-border-size").prop("value"));
                theme.borderColor = $("#theme-data-border-color").prop("value");
                theme.opacity = $("#theme-data-opacity").prop("value");
                theme.spacing = parseFloat($("#theme-data-spacing").prop("value"));
            }
            else {
                theme.borderSize = 0;
                theme.borderColor = "rgb(0,0,0)";
                theme.opacity = 1;
                theme.spacing = 0;
            }

            // chart legend style
            if ($("#theme-legend").prop("checked")) {
                theme.legendSize = parseFloat($("#theme-legend-size").prop("value"));
                theme.legendAlign = $("#theme-legend-align").prop("value");
                theme.legendOffset = {
                    x : parseFloat($("#theme-legend-offsetX").prop("value")),
                    y : parseFloat($("#theme-legend-offsetY").prop("value"))
                }
            } else {
                theme.legendSize = 0,
                theme.legendAlign = 'right',
                theme.legendOffset = {
                    x : 0,
                    y : 0
                }
            }
            
            // update the data object for the form
            D3Builder.formData.theme = theme;
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
            }

            //console.log(translate);
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
            }

            //console.log(translate);
            return translate;
        }
    };

    return chartTheme;
})(jQuery, d3);

D3Builder.chartEvents = (function($, d3, undefined) {
    'use strict';

    var chartEvents = {
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

    return chartEvents;
})(jQuery, d3);

// run everything at document ready - this is the master controller!!!
$(document).ready(function() {
    // initialise interactive parts of the form
    D3Builder.chartType.init();
    D3Builder.chartTheme.init();
    D3Builder.chartColors.init();
    D3Builder.chartData.init();
    // initialise the Chart Builder object
    // but only after the form sections have been initialised properly
    D3Builder.chartBuilder.init(); 
});


