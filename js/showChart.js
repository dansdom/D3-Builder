var D3Builder = D3Builder || {};
// settings object that handles most of the plugin settings parameters
// some specific settings will be handled by each build object
D3Builder.settings = (function(d3, $, undefined) {
    'use strict';
    // constructs all the common settings from the form
    var settings = {
        // get the settings for the plugin
        getSettings : function(data) {
            var settingsHolder = {};

            //console.log(data);
            settingsHolder.width = data.size.width;
            settingsHolder.height = data.size.height;
            settingsHolder.margin = {
                top : data.size.paddingTop,
                bottom : data.size.paddingBottom,
                left : data.size.paddingLeft,
                right : data.size.paddingRight
            };
            settingsHolder.padding = data.size.padding;
            settingsHolder.colorRange = data.colors;
            settingsHolder.dataStructure = data.data.attributes;
            // do a case statement to find the data
            switch (data.data.source) {
                case "dummy" :
                    settingsHolder.dataUrl = data.data.dummy;
                    break;
                case "url" :
                    settingsHolder.dataUrl = data.data.url;
                    break;
                case "file" :
                    settingsHolder.data = data.data.dataObject;  // note I will need to read this file and store the result before this point
                    break;
                default : break;
            }
            settingsHolder.chartName = data.theme.headerName;
            settingsHolder.spacing = data.theme.spacing;
            settingsHolder.fontSize = data.theme.labelSize;
            // legend object
            settingsHolder.legend = {};
            if (data.theme.legendSize) {
                settingsHolder.legend = {
                    visible : true,
                    size : data.theme.legendSize,
                    align : data.theme.legendAlign,
                    offset : {
                        x : data.theme.legendOffsetX,
                        y : data.theme.legendOffsetY
                    }
                };
            } else {
                // don't show the legend
                settingsHolder.legend.visible = false;
            }

            return settingsHolder;
        },
        // set common CSS styles. namely the background and the header
        getStyle : function(data, positionType) {
            var chartStyle = "";

            // get all the theme settings and add them to the style element
            if (data.theme.backgroundColor) {
                chartStyle += "svg {background: #" + data.theme.backgroundColor + ";}\n";
            }
            // add the header style if there is a value for it
            if (data.theme.headerName) {
                chartStyle += ".chartName text {font-size:" + data.theme.headerSize + "px; fill:#" + data.theme.headerColor + "; font-weight:bold;-webkit-transform: translate(" + D3Builder.chartTheme[positionType](data) + ");transform: translate(" + D3Builder.chartTheme[positionType](data) + ");}\n";
            }

            return chartStyle;

        },
        // build the chart
        buildChart : function(chartType, settings, chartStyle) {
            var chart = document.getElementById("chart-preview");

            // destroy the current
            if (D3Builder.formData.type.current && D3Builder.formData.type.current !== chartType) {
                d3[D3Builder.formData.type.current](chart, "destroy");
            }

            //console.log(this.chartStyle)
            // add the style element
            $("#chart-style").html(chartStyle);
                
            //console.log(settings);
            d3[chartType](chart, settings);
            D3Builder.formData.type.current = chartType;

            // get the build settings for the chart
            this.getBuildSettings(chartType, settings, chartStyle);
        },
        getBuildSettings : function(chartType, settings, chartStyle) {
            var script  = "var chart = document.getElementById('chart');\n";
                script += "d3." + chartType + "(chart," + JSON.stringify(settings) + ");\n";

            // assign the settings to the CodeBuilder object
            D3Builder.codeBuilder.settings = {
                formData : D3Builder.formData,  // send the form data over for further processing
                script : script, // these are the script options
                style : chartStyle, // this is the plugin css
                dataObject : JSON.stringify(D3Builder.formData.data.dataObject) // chart data object if a file was uploaded
            };
        }
    };

    return settings;
})(d3, jQuery);

// object that builds the "pie" chart
D3Builder.pieChart = (function(undefined) {
    'use strict';
    // object that builds the pie chart
    var pieChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPositionCentered");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("pie", this.settings, this.chartStyle);
        },
        getSettings : function() {
            var formData = D3Builder.formData;

            this.settings.innerRadius = formData.size.innerRadius;
            this.settings.outerRadius = formData.size.outerRadius;
            this.settings.opacity = formData.theme.opacity;
            //if (D3Builder.formData.theme.labelPosition > 0) {
                this.settings.labelPosition = formData.theme.labelPosition;
            //}
            // if it's flat then set the parent to 'undefined'
            if (formData.data.structure === "flat") {
                this.settings.dataStructure.children = null;
            }
        },
        getStyle : function() {
            // add label style
            if (D3Builder.formData.theme.labelSize) {
                this.chartStyle += ".arc text {font-size:" + D3Builder.formData.theme.labelSize + "px; fill:#" + D3Builder.formData.theme.labelColor + "}\n";
            }
            // add borders to the segments
            if (D3Builder.formData.theme.borderSize) {
                this.chartStyle += ".arc path {stroke-width:" + D3Builder.formData.theme.borderSize + "px; stroke:#" + D3Builder.formData.theme.borderColor + ";}\n";
            }
        }
    };

    return pieChart;
})();

D3Builder.packChart = (function(undefined) {
    'use strict';
    // object that builds the "pack" chart
    var packChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPosition");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("pack", this.settings, this.chartStyle);
        },
        getSettings : function() {
            this.settings.diameter = D3Builder.formData.size.outerRadius;
            this.settings.chartType = D3Builder.formData.type.secondary;
            this.settings.colors = {
                'group' : D3Builder.formData.colors[0],
                'leaf' : D3Builder.formData.colors[1],
                'label' : D3Builder.formData.colors[2]
            };
            if (D3Builder.formData.theme.labelPosition > 0) {
                this.settings.labelPosition = D3Builder.formData.theme.labelPosition;
            } else {
                this.settings.labelPosition = false;
            }
        },
        getStyle : function() {
            // add label style
            if (D3Builder.formData.theme.labelSize) {
                this.chartStyle += ".node text {font-size:" + D3Builder.formData.theme.labelSize + "px; fill:#" + D3Builder.formData.theme.labelColor + "}\n";
            }
            if (this.settings.chartType === "pack") {
                this.chartStyle += ".pack circle {stroke-width: 1px;}\n";
                this.chartStyle += ".leaf circle {fill-opacity: 1;}\n";
                this.chartStyle += ".group circle:hover {stroke-width:2px;cursor:pointer;}\n";
                this.chartStyle += ".group:first-child circle:hover {cursor:default;stroke-width:1px;stroke:" + this.settings.colors.group + "}\n";
            } else if (this.settings.chartType === "bubble") {
                // not sure I even need to add any style for this type
            }   
        }
    };

    return packChart;
})();

D3Builder.forceChart = (function(undefined) {
    'use strict';

    // object that builds the "force" chart
    var forceChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPosition");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("force", this.settings, this.chartStyle);
        },
        getSettings : function() {
            this.chartType = D3Builder.formData.type.secondary;
            this.settings.colors = {
                'parent' : D3Builder.formData.colors[0],
                'group' : D3Builder.formData.colors[1],
                'child' : D3Builder.formData.colors[2],
                'line' : D3Builder.formData.colors[3]
            };
            // I'll need to add this to the form
            //this.settings.charge = FormData.events.charge;
            //this.settings.linkDistance = FormData.events.distance;
        },
        getStyle : function() {
            // I still need transfer the colour settings from the plugin settings to a class setting in the CSS me thinks ;)
        }
    };

    return forceChart;
})();

D3Builder.sunburstChart = (function(undefined) {
    'use strict';
    // object that builds the "sunburst" chart
    var sunburstChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPosition");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("sunburst", this.settings, this.chartStyle);
        },
        getSettings : function() {
            this.settings.radius = D3Builder.formData.size.outerRadius;
            this.settings.elements = {
                'borderWidth' : D3Builder.formData.theme.borderSize + "px",
                'borderColor' : "#" + D3Builder.formData.theme.borderColor
            };
        },
        getStyle : function() {
            // add borders to the segments
            if (D3Builder.formData.theme.borderSize) {
                this.chartStyle += ".arc path {stroke-width:" + D3Builder.formData.theme.borderSize + "px; stroke:#" + D3Builder.formData.theme.borderColor + ";}\n";
            }
        }
    };

    return sunburstChart;
})();

D3Builder.areaChart = (function(undefined) {
    'use strict';
    // object that builds the "area" chart
    var areaChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPosition");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("area", this.settings, this.chartStyle);
        },
        getSettings : function() {
            var formData = D3Builder.formData;

            this.settings.margin = {
                top : formData.size.paddingTop,
                bottom : formData.size.paddingBottom,
                left : formData.size.paddingLeft,
                right : formData.size.paddingRight
            };
            // I should come back to these settings and add form elements for more settings
            this.settings.elements = {
                line : true,
                lineOpacity : 1,
                area : true,
                areaOpacity : 0.8,
                dot : true,
                dotRadius : 3
            };
            this.settings.scale = {
                x : formData.data.scale.x,
                y : formData.data.scale.y
            };
            // set the children to undefined so that the title will show
            this.settings.dataStructure.children = null;

        },
        getStyle : function() {
            var formData = D3Builder.formData;

            // if the labels are turned off then set the label size to 0
            if (!formData.theme.labelSize) {
                formData.theme.labelSize = 0;
            }
            this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;shape-rendering: crispEdges;}\n";
            this.chartStyle += ".line {fill: none;stroke: " + formData.colors[1] + ";stroke-width: " + formData.theme.borderSize + "px;}\n";
            this.chartStyle += ".dot {fill: " + formData.colors[2] + ";stroke: " + formData.colors[1] + ";stroke-width: 1px;}\n";
            this.chartStyle += ".tick {fill:none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;}\n";
            this.chartStyle += "text {fill: #" + formData.theme.labelColor + ";font-size:" + formData.theme.labelSize + "px;stroke:none}\n";
        }
    };
    
    return areaChart;
})();

D3Builder.barChart = (function(undefined) {
    'use strict';
    // object that builds the "bar" chart - I badly need to clean up this function and the bar chart plugin options as well
    var barChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPosition");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("bar", this.settings, this.chartStyle);
        },
        getSettings : function() {
            var formData = D3Builder.formData;

            this.settings.margin = {
                top : formData.size.paddingTop,
                bottom : formData.size.paddingBottom,
                left : formData.size.paddingLeft,
                right : formData.size.paddingRight
            };
            this.settings.elements = {
                barWidth : 10,
                barOpacity : 0.8
            };
            this.settings.scale = {
                x : formData.data.scale.x,
                y : formData.data.scale.y
            };
            // set the children to undefined so that the title will show
            this.settings.dataStructure.children = null;
        },
        getStyle : function() {
            var formData = D3Builder.formData;

            // if the labels are turned off then set the label size to 0
            if (!D3Builder.formData.theme.labelSize) {
                D3Builder.formData.theme.labelSize = 0;
            }
            this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;shape-rendering: crispEdges;}\n";
            this.chartStyle += ".line {fill: none;stroke: " + formData.colors[1] + ";stroke-width: " + formData.theme.borderSize + "px;}\n";
            this.chartStyle += ".dot {fill: " + formData.colors[2] + ";stroke: " + formData.colors[1] + ";stroke-width: 1px;}\n";
            this.chartStyle += ".tick {fill:none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;}\n";
            this.chartStyle += "text {fill: #" + formData.theme.labelColor + ";font-size:" + formData.theme.labelSize + "px;stroke:none}\n";
        }
    };

    return barChart;
})();

D3Builder.chordChart = (function(undefined) {
    'use strict';
    // object that builds the "chord" chart - I badly need to clean up this function and the bar chart plugin options as well
    var chordChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPositionCentered");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("chord", this.settings, this.chartStyle);
        },
        getSettings : function() {
            var formData = D3Builder.formData;

            this.settings.spacing = formData.size.innerRadius;
            this.settings.labelPosition = formData.theme.labelPosition;
            // set the children to undefined so that the title will show
            this.settings.dataStructure.children = null;
        },
        getStyle : function() {
            var formData = D3Builder.formData;

            // add the header style if there is a vlue for it
            if (formData.theme.headerName) {
                this.chartStyle += "svg .chartName text {font-size:" + formData.theme.headerSize + "px; fill:#" + formData.theme.headerColor + "}\n";
            }
            this.chartStyle += ".group text {font: " + formData.theme.labelSize + "px sans-serif;pointer-events: none;}\n"; 
            this.chartStyle += ".chords path {fill-opacity: .67;stroke: #" + formData.theme.borderColor + ";stroke-width: .5px;}\n";
            this.chartStyle += ".tickUnit line {stroke: #" + formData.theme.labelColor + "}\n";
            this.chartStyle += ".tickUnit text {fill: #" + formData.theme.labelColor + "}\n";
            this.chartStyle += "text {fill: #" + formData.theme.labelColor + ";font-size:" + formData.theme.labelSize + "px;}\n";
        }
    };

    return chordChart;
})();

D3Builder.scatterplotChart = (function(undefined) {
    'use strict';
    // object that builds the "scatterplot" chart
    var scatterplotChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPosition");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("scatterplot", this.settings, this.chartStyle);
        },
        getSettings : function() {
            var formData = D3Builder.formData;

            this.settings.margin = {
                top : formData.size.paddingTop,
                bottom : formData.size.paddingBottom,
                left : formData.size.paddingLeft,
                right : formData.size.paddingRight
            };
            this.settings.elements = {
                dotRadius : 3
            };
            this.settings.scale = {
                x : formData.data.scale.x,
                y : formData.data.scale.y
            };

        },
        getStyle : function() {
            var formData = D3Builder.formData;
            // if the labels are turned off then set the label size to 0
            if (!D3Builder.formData.theme.labelSize) {
                D3Builder.formData.theme.labelSize = 0;
            }
            this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;shape-rendering: crispEdges;}\n";
            this.chartStyle += ".line {fill: none;stroke: " + formData.colors[1] + ";stroke-width: " + formData.theme.borderSize + "px;}\n";
            this.chartStyle += ".dot {fill: " + formData.colors[2] + ";stroke: " + formData.colors[1] + ";stroke-width: 1px;}\n";
            this.chartStyle += ".tick {fill:none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;}\n";
            this.chartStyle += "text {fill: #" + formData.theme.labelColor + ";font-size:" + formData.theme.labelSize + "px;stroke:none}\n";
        }
    };

    return scatterplotChart;
})();


D3Builder.streamgraphChart = (function(undefined) {
    'use strict';
    // objects that builds the streamgraph chart
    var streamgraphChart = {
        init : function() {
            // get the generic settings
            this.settings = D3Builder.settings.getSettings(D3Builder.formData);
            // get the specific settings
            this.getSettings();
            // get the common style elements
            this.chartStyle = D3Builder.settings.getStyle(D3Builder.formData, "getHeaderPosition");
            // get the specific style
            this.getStyle();
            // build the chart
            D3Builder.settings.buildChart("streamgraph", this.settings, this.chartStyle);
        },
        getSettings : function() {
            var formData = D3Builder.formData;

            this.settings.margin = {
                top : formData.size.paddingTop,
                bottom : formData.size.paddingBottom,
                left : formData.size.paddingLeft,
                right : formData.size.paddingRight
            };
            this.settings.elements = {
                line : 'red',
                area : true
            };
            this.settings.scale = {
                x : formData.data.scale.x,
                y : formData.data.scale.y
            };
        },
        getStyle : function() {
            var formData = D3Builder.formData;

            // if the labels are turned off then set the label size to 0
            if (!formData.theme.labelSize) {
                formData.theme.labelSize = 0;
            }
            this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;shape-rendering: crispEdges;}\n";
            this.chartStyle += ".line {fill: none;stroke: " + formData.colors[1] + ";stroke-width: " + formData.theme.borderSize + "px;}\n";
            this.chartStyle += ".dot {fill: " + formData.colors[2] + ";stroke: " + formData.colors[1] + ";stroke-width: 1px;}\n";
            this.chartStyle += ".tick {fill:none;stroke:#" + formData.theme.borderColor + ";stroke-width:" + formData.theme.borderSize + "px;}\n";
            this.chartStyle += "text {fill: #" + formData.theme.labelColor + ";font-size:" + formData.theme.labelSize + "px;stroke:none}\n";
        }
    }

    return streamgraphChart;

})();