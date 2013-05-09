// settings object that handles most of the plugin settings parameters
// some specific settings will be handled by each build object
Settings = {
    // get the settings for the plugin
    getSettings : function(data) {
        var settings = {};

        settings.width = data.size.width;
        settings.height = data.size.height;
        settings.padding = data.size.padding;
        settings.colorRange = data.colors;
        settings.dataStructure = data.data.attributes;
        // do a case statement to find the data
        switch (data.data.source) {
            case "dummy" :
                settings.dataUrl = data.data.dummy;
                break;
            case "url" :
                settings.dataUrl = data.data.url;
                break;
            case "file" :
                settings.data = data.data.dataObject;  // note I will need to read this file and store the result before this point
                break;
            default : break;
        };
        settings.chartName = data.theme.headerName;
        settings.spacing = data.theme.spacing;
        settings.fontSize = data.theme.labelSize;

        return settings;
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
            chartStyle += ".chartName {font-size:" + data.theme.headerSize + "px; fill:#" + data.theme.headerColor + "; font-weight:bold;-webkit-transform: translate(" + ChartTheme[positionType](data) + ");transform: translate(" + ChartTheme[positionType](data) + ");}\n";
        }

        return chartStyle;

    },
    // build the chart
    buildChart : function(chartType, settings, chartStyle) {
        var chart = document.getElementById("chart-preview");

        // destroy the current
        if (FormData.type.current && FormData.type.current !== chartType) {
            d3[FormData.type.current](chart, "destroy");
        }

        //console.log(this.chartStyle)
        // add the style element
        $("#chart-style").html(chartStyle);
            
        console.log(settings);
        d3[chartType](chart, settings);
        FormData.type.current = chartType;

        // get the build settings for the chart
        this.getBuildSettings(chartType, settings, chartStyle);
    },
    getBuildSettings : function(chartType, settings, chartStyle) {
        var script  = "var chart = document.getElementById('chart');\n";
            script += "d3." + chartType + "(chart," + JSON.stringify(settings) + ");\n";

        // assign the settings to the CodeBuilder object
        CodeBuilder.settings = {
            formData : FormData,  // send the form data over for further processing
            script : script, // these are the script options
            style : chartStyle, // this is the plugin css
            dataObject : JSON.stringify(FormData.data.dataObject) // chart data object if a file was uploaded
        };
    }
};

// object that builds the "pie" chart
PieChart = {
    init : function() {
        // get the generic settings
        this.settings = Settings.getSettings(FormData);
        // get the specific settings
        this.getSettings();
        // get the common style elements
        this.chartStyle = Settings.getStyle(FormData, "getHeaderPositionCentered");
        // get the specific style
        this.getStyle();
        // build the chart
        Settings.buildChart("pie", this.settings, this.chartStyle);
    },
    getSettings : function() {
        this.settings.innerRadius = FormData.size.innerRadius;
        this.settings.outerRadius = FormData.size.outerRadius;
        //if (FormData.theme.labelPosition > 0) {
            this.settings.labelPosition = FormData.theme.labelPosition;
        //}
        // if it's flat then set the parent to 'undefined'
        if (FormData.data.structure === "flat") {
            this.settings.dataStructure.children = undefined;
        }
    },
    getStyle : function() {
        // add label style
        if (FormData.theme.labelSize) {
            this.chartStyle += ".arc text {font-size:" + FormData.theme.labelSize + "px; fill:#" + FormData.theme.labelColor + "}\n";
        }
        // add borders to the segments
        if (FormData.theme.borderSize) {
            this.chartStyle += ".arc path {stroke-width:" + FormData.theme.borderSize + "px; stroke:#" + FormData.theme.borderColor + ";}\n";
        }
    }
};


// object that builds the "pack" chart
PackChart = {
    init : function() {
        // get the generic settings
        this.settings = Settings.getSettings(FormData);
        // get the specific settings
        this.getSettings();
        // get the common style elements
        this.chartStyle = Settings.getStyle(FormData, "getHeaderPosition");
        // get the specific style
        this.getStyle();
        // build the chart
        Settings.buildChart("pack", this.settings, this.chartStyle);
    },
    getSettings : function() {
        this.settings.diameter = FormData.size.outerRadius;
        this.settings.chartType = FormData.type.secondary;
        this.settings.colors = {
            'group' : FormData.colors[0],
            'leaf' : FormData.colors[1],
            'label' : FormData.colors[2]
        };
        if (FormData.theme.labelPosition > 0) {
            this.settings.labelPosition = FormData.theme.labelPosition;
        }
        else {
            this.settings.labelPosition = false;
        }
        // I'll need to add this to the form
        //this.settings.speed = FormData.events.speed;

    },
    getStyle : function() {
        // add label style
        if (FormData.theme.labelSize) {
            this.chartStyle += ".node text {font-size:" + FormData.theme.labelSize + "px; fill:#" + FormData.theme.labelColor + "}\n";
        }
        if (this.settings.chartType === "pack") {
            this.chartStyle += ".pack circle {stroke-width: 1px;}\n";
            this.chartStyle += ".leaf circle {fill-opacity: 1;}\n";
            this.chartStyle += ".group circle:hover {stroke-width:2px;cursor:pointer;}\n";
            this.chartStyle += ".group:first-child circle:hover {cursor:default;stroke-width:1px;stroke:" + this.settings.colors.group + "}\n";
        }
        else if (this.settings.chartType === "bubble") {
            // not sure I even need to add any style for this type
        }
        
    }
};


// object that builds the "force" chart
ForceChart = {
    init : function() {
        // get the generic settings
        this.settings = Settings.getSettings(FormData);
        // get the specific settings
        this.getSettings();
        // get the common style elements
        this.chartStyle = Settings.getStyle(FormData, "getHeaderPosition");
        // get the specific style
        this.getStyle();
        // build the chart
        Settings.buildChart("force", this.settings, this.chartStyle);
    },
    getSettings : function() {
        this.chartType = FormData.type.secondary;
        this.settings.colors = {
            'parent' : FormData.colors[0],
            'group' : FormData.colors[1],
            'child' : FormData.colors[2],
            'line' : FormData.colors[3]
        };
        // I'll need to add this to the form
        //this.settings.charge = FormData.events.charge;
        //this.settings.linkDistance = FormData.events.distance;

    },
    getStyle : function() {
        // I still need transfer the colour settings from the plugin settings to a class setting in the CSS me thinks ;)
    }
};


// object that builds the "sunburst" chart
SunburstChart = {
    init : function() {
        // get the generic settings
        this.settings = Settings.getSettings(FormData);
        // get the specific settings
        this.getSettings();
        // get the common style elements
        this.chartStyle = Settings.getStyle(FormData, "getHeaderPosition");
        // get the specific style
        this.getStyle();
        // build the chart
        Settings.buildChart("sunburst", this.settings, this.chartStyle);
    },
    getSettings : function() {
        this.settings.radius = FormData.size.outerRadius;
        this.settings.elements = {
            'borderWidth' : FormData.theme.borderSize + "px",
            'borderColor' : "#" + FormData.theme.borderColor
        }
        // I'll need to add this to the form
        //this.settings.speed = FormData.events.speed;

    },
    getStyle : function() {
        // add borders to the segments
        if (FormData.theme.borderSize) {
            this.chartStyle += ".arc path {stroke-width:" + FormData.theme.borderSize + "px; stroke:#" + FormData.theme.borderColor + ";}\n";
        }
    }
};


// object that builds the "area" chart
AreaChart = {
    init : function() {
        // get the generic settings
        this.settings = Settings.getSettings(FormData);
        // get the specific settings
        this.getSettings();
        // get the common style elements
        this.chartStyle = Settings.getStyle(FormData, "getHeaderPosition");
        // get the specific style
        this.getStyle();
        // build the chart
        Settings.buildChart("area", this.settings, this.chartStyle);
    },
    getSettings : function() {
        this.settings.margin = {
            top : FormData.size.padding,
            bottom : FormData.size.padding,
            left : FormData.size.padding,
            right : FormData.size.padding
        };
        this.settings.elements = {
            'shape' : FormData.colors[0],
            'line' : FormData.colors[1],
            'dot' : FormData.colors[2],
            'x' : FormData.colors[3],
            'y' : FormData.colors[4]
        };
        this.settings.scale = {
            x : FormData.data.scale.x,
            y : FormData.data.scale.y
        };
        // set the children to undefined so that the title will show
        this.settings.dataStructure.children = undefined;

    },
    getStyle : function() {
        // if the labels are turned off then set the label size to 0
        if (!FormData.theme.labelSize) {
            FormData.theme.labelSize = 0;
        }
        this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;shape-rendering: crispEdges;}\n";
        this.chartStyle += ".line {fill: none;stroke: " + FormData.colors[1] + ";stroke-width: " + FormData.theme.borderSize + "px;}\n";
        this.chartStyle += ".dot {fill: " + FormData.colors[2] + ";stroke: " + FormData.colors[1] + ";stroke-width: 1px;}\n";
        this.chartStyle += ".tick {fill:none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;}\n";
        this.chartStyle += "text {fill: #" + FormData.theme.labelColor + ";font-size:" + FormData.theme.labelSize + "px;}\n"
    }
};


// object that builds the "bar" chart - I badly need to clean up this function and the bar chart plugin options as well
BarChart = {
    init : function() {
        // get the generic settings
        this.settings = Settings.getSettings(FormData);
        // get the specific settings
        this.getSettings();
        // get the common style elements
        this.chartStyle = Settings.getStyle(FormData, "getHeaderPosition");
        // get the specific style
        this.getStyle();
        // build the chart
        Settings.buildChart("bar", this.settings, this.chartStyle);
    },
    getSettings : function() {
        this.settings.margin = {
            top : FormData.size.padding,
            bottom : FormData.size.padding,
            left : FormData.size.padding,
            right : FormData.size.padding
        };
        this.settings.elements = {
            'bars' : FormData.colors[0],
            'line' : FormData.colors[1],
            'dot' : FormData.colors[2],
            'x' : FormData.colors[3],
            'y' : FormData.colors[4]
        };
        this.settings.scale = {
            x : FormData.data.scale.x,
            y : FormData.data.scale.y
        };
        // set the children to undefined so that the title will show
        this.settings.dataStructure.children = undefined;
    },
    getStyle : function() {
        // if the labels are turned off then set the label size to 0
        if (!FormData.theme.labelSize) {
            FormData.theme.labelSize = 0;
        }
        this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;shape-rendering: crispEdges;}\n";
        this.chartStyle += ".line {fill: none;stroke: " + FormData.colors[1] + ";stroke-width: " + FormData.theme.borderSize + "px;}\n";
        this.chartStyle += ".dot {fill: " + FormData.colors[2] + ";stroke: " + FormData.colors[1] + ";stroke-width: 1px;}\n";
        this.chartStyle += ".tick {fill:none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;}\n";
        this.chartStyle += "text {fill: #" + FormData.theme.labelColor + ";font-size:" + FormData.theme.labelSize + "px;}\n";
    }
};


// object that builds the "chord" chart - I badly need to clean up this function and the bar chart plugin options as well
ChordChart = {
    init : function() {
        // get the generic settings
        this.settings = Settings.getSettings(FormData);
        // get the specific settings
        this.getSettings();
        // get the common style elements
        this.chartStyle = Settings.getStyle(FormData, "getHeaderPositionCentered");
        // get the specific style
        this.getStyle();
        // build the chart
        Settings.buildChart("chord", this.settings, this.chartStyle);
    },
    getSettings : function() {
        this.settings.spacing = FormData.size.innerRadius;
        this.settings.elements = {
            'bars' : FormData.colors[0],
            'line' : FormData.colors[1],
            'dot' : FormData.colors[2],
            'x' : FormData.colors[3],
            'y' : FormData.colors[4]
        };
        /* 
        this.settings.scale = {
            x : FormData.data.scale.x,
            y : FormData.data.scale.y
        };
        */
        // set the children to undefined so that the title will show
        this.settings.dataStructure.children = undefined;
    },
    getStyle : function() {
        // add the header style if there is a vlue for it
        if (FormData.theme.headerName) {
            this.chartStyle += "svg .chartName text {font-size:" + FormData.theme.headerSize + "px; fill:#" + FormData.theme.headerColor + "}\n";
        }
        this.chartStyle += ".group text {font: " + FormData.theme.labelSize + "px sans-serif;pointer-events: none;}\n"; 
        this.chartStyle += ".chords path {fill-opacity: .67;stroke: #" + FormData.theme.borderColor + ";stroke-width: .5px;}\n";
        this.chartStyle += ".tickUnit line {stroke: #" + FormData.theme.labelColor + "}\n";
        this.chartStyle += ".tickUnit text {fill: #" + FormData.theme.labelColor + "}\n";
        this.chartStyle += "text {fill: #" + FormData.theme.labelColor + ";font-size:" + FormData.theme.labelSize + "px;}\n";
    }
};