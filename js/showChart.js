// object that builds the "pie" chart
PieChart = {
    init : function() {
        this.getSettings();
        this.getStyle();
        this.buildChart();
    },
    // data object to hold the plugin settings
    settings : {},
    getSettings : function() {
        this.settings.innerRadius = FormData.size.innerRadius;
        this.settings.outerRadius = FormData.size.outerRadius;
        this.settings.width = FormData.size.width;
        this.settings.height = FormData.size.height;
        this.settings.padding = FormData.size.padding;
        // do a case statement to find the data
        switch (FormData.data.source) {
            case "dummy" :
                this.settings.dataUrl = FormData.data.dummy;
                break;
            case "url" :
                this.settings.dataUrl = FormData.data.url;
                break;
            case "file" : 
                this.settings.dataUrl = FormData.data.file;  // note I will need to read this file and store the result before this point
                break;
            default : break;
        };
        this.settings.colorRange = FormData.colors;
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        // if it's flat then set the parent to 'undefined'
        if (FormData.data.structure === "flat") {
            this.settings.dataStructure.children = undefined;
        }
        this.settings.chartName = FormData.theme.headerName;
    },
    chartStyle : "",
    getStyle : function() {
        this.chartStyle = "";
        // get all the theme settings and add them to the style element
        if (FormData.theme.backgroundColor) {
            this.chartStyle += "svg {background: #" + FormData.theme.backgroundColor + ";}";
        }
        // add the header style if there is a vlue for it
        if (FormData.theme.headerName) {
            this.chartStyle += ".chartName {font-size:" + FormData.theme.headerSize + "px; fill:#" + FormData.theme.headerColor + "; font-weight:bold;-webkit-transform: translate(" + ChartTheme.getHeaderPositionCentered(FormData) + ");transform: translate(" + ChartTheme.getHeaderPositionCentered(FormData) + ");}";
        }
        // add label style
        if (FormData.theme.labelSize) {
            this.chartStyle += ".arc text {font-size:" + FormData.theme.labelSize + "px; fill:#" + FormData.theme.labelColor + "}";
        }
        // add borders to the segments
        if (FormData.theme.borderSize) {
            this.chartStyle += ".arc path {stroke-width:" + FormData.theme.borderSize + "px; stroke:#" + FormData.theme.borderColor + ";}";
        }
    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current
        if (FormData.type.current && FormData.type.current !== "pie") {
            d3[FormData.type.current](chart, "destroy");
        }

        //console.log(this.chartStyle)
        // add the style element
        $("#chart-style").html(this.chartStyle);
            
        console.log(settings);
        d3.pie(chart, settings);
        FormData.type.current = "pie";
    }
};

// object that builds the "pack" chart
PackChart = {
    init : function() {
        console.log("building pack chart");
        this.getSettings();
        this.getStyle();
        this.buildChart();
    },
    settings : {},
    getSettings : function() {
        this.settings.height = FormData.size.height;
        this.settings.width = FormData.size.width;
        this.settings.diameter = FormData.size.outerRadius;
        this.settings.padding = FormData.size.padding;
        // do a case statement to find the data
        switch (FormData.data.source) {
            case "dummy" :
                this.settings.dataUrl = FormData.data.dummy;
                break;
            case "url" :
                this.settings.dataUrl = FormData.data.url;
                break;
            case "file" : 
                this.settings.dataUrl = FormData.data.file;  // note I will need to read this file and store the result before this point
                break;
            default : break;
        };
        this.settings.chartType = FormData.type.secondary;
        this.settings.colorRange = FormData.colors;
        this.settings.colors = {
            'group' : FormData.colors[0],
            'leaf' : FormData.colors[1],
            'label' : FormData.colors[2]
        };
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        // I'll need to add this to the form
        //this.settings.speed = FormData.events.speed;
        this.settings.chartName = FormData.theme.headerName;

    },
    chartStyle : "",
    getStyle : function() {
        this.chartStyle = "";
        // get all the theme settings and add them to the style element
        if (FormData.theme.backgroundColor) {
            this.chartStyle += "svg {background: #" + FormData.theme.backgroundColor + ";}";
        }
        // add the header style if there is a vlue for it
        if (FormData.theme.headerName) {
            this.chartStyle += ".chartName {font-size:" + FormData.theme.headerSize + "px; fill:#" + FormData.theme.headerColor + ";font-weight:bold;-webkit-transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");}";
        }
        // add label style
        if (FormData.theme.labelSize) {
            this.chartStyle += ".node text {font-size:" + FormData.theme.labelSize + "px; fill:#" + FormData.theme.labelColor + "}";
        }
        if (this.settings.chartType === "pack") {
            this.chartStyle += ".pack circle {stroke-width: 1px;}";
            this.chartStyle += ".leaf circle {fill-opacity: 1;}";
            this.chartStyle += ".group circle:hover {stroke-width:2px;cursor:pointer;}";
            this.chartStyle += ".group:first-child circle:hover {cursor:default;stroke-width:1px;stroke:" + this.settings.colors.group + "}";
        }
        else if (this.settings.chartType === "bubble") {
            // not sure I even need to add any style for this type
        }
        
    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current chart
        if (FormData.type.current && FormData.type.current !== "pack") {
            d3[FormData.type.current](chart, "destroy");
        }

        // console.log(this.chartStyle);
        // add the style element
        $("#chart-style").html(this.chartStyle);

        d3.pack(chart, settings);
        // set the current chart type type
        FormData.type.current = "pack";
    }
};

// object that builds the "force" chart
ForceChart = {
    init : function() {
        console.log("building force chart");
        this.getSettings();
        this.getStyle();
        this.buildChart();
    },
    settings : {},
    getSettings : function() {
        this.settings.height = FormData.size.height;
        this.settings.width = FormData.size.width;
        this.settings.padding = FormData.size.padding;
        // do a case statement to find the data
        switch (FormData.data.source) {
            case "dummy" :
                this.settings.dataUrl = FormData.data.dummy;
                break;
            case "url" :
                this.settings.dataUrl = FormData.data.url;
                break;
            case "file" : 
                this.settings.dataUrl = FormData.data.file;  // note I will need to read this file and store the result before this point
                break;
            default : break;
        };
        this.chartType = FormData.type.secondary;
        this.settings.colorRange = FormData.colors;
        this.settings.colors = {
            'parent' : FormData.colors[0],
            'group' : FormData.colors[1],
            'child' : FormData.colors[2],
            'line' : FormData.colors[3]
        };
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        // I'll need to add this to the form
        //this.settings.charge = FormData.events.charge;
        //this.settings.linkDistance = FormData.events.distance;
        this.settings.chartName = FormData.theme.headerName;

    },
    chartStyle : "",
    getStyle : function() {
        this.chartStyle = "";
        // get all the theme settings and add them to the style element
        if (FormData.theme.backgroundColor) {
            this.chartStyle += "svg {background: #" + FormData.theme.backgroundColor + ";}";
        }
        // add the header style if there is a vlue for it
        if (FormData.theme.headerName) {
            this.chartStyle += ".chartName {font-size:" + FormData.theme.headerSize + "px; fill:#" + FormData.theme.headerColor + ";font-weight:bold;-webkit-transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");}";
        }
    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current chart
        if (FormData.type.current && FormData.type.current !== "force") {
            d3[FormData.type.current](chart, "destroy");
        }

        // console.log(this.chartStyle);
        // add the style element
        $("#chart-style").html(this.chartStyle);

        d3.force(chart, settings);
        // set the current chart type type
        FormData.type.current = "force";
    }
};

// object that builds the "sunburst" chart
SunburstChart = {
    init : function() {
        console.log("building sunburst chart");
        this.getSettings();
        this.getStyle();
        this.buildChart();
    },
    settings : {},
    getSettings : function() {
        this.settings.height = FormData.size.height;
        this.settings.width = FormData.size.width;
        this.settings.radius = FormData.size.outerRadius;
        this.settings.padding = FormData.size.padding;
        // do a case statement to find the data
        switch (FormData.data.source) {
            case "dummy" :
                this.settings.dataUrl = FormData.data.dummy;
                break;
            case "url" :
                this.settings.dataUrl = FormData.data.url;
                break;
            case "file" : 
                this.settings.dataUrl = FormData.data.file;  // note I will need to read this file and store the result before this point
                break;
            default : break;
        };
        this.settings.colorRange = FormData.colors;
        this.settings.elements = {
            'borderWidth' : FormData.theme.borderSize + "px",
            'borderColor' : "#" + FormData.theme.borderColor
        }
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        // I'll need to add this to the form
        //this.settings.speed = FormData.events.speed;
        this.settings.chartName = FormData.theme.headerName;

    },
    chartStyle : "",
    getStyle : function() {
        this.chartStyle = "";
        // get all the theme settings and add them to the style element
        if (FormData.theme.backgroundColor) {
            this.chartStyle += "svg {background: #" + FormData.theme.backgroundColor + ";}";
        }
        // add the header style if there is a vlue for it
        if (FormData.theme.headerName) {
            this.chartStyle += ".chartName {font-size:" + FormData.theme.headerSize + "px; fill:#" + FormData.theme.headerColor + ";font-weight:bold;-webkit-transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");}";
        }
        // add borders to the segments
        if (FormData.theme.borderSize) {
            this.chartStyle += ".arc path {stroke-width:" + FormData.theme.borderSize + "px; stroke:#" + FormData.theme.borderColor + ";}";
        }
    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current chart
        if (FormData.type.current && FormData.type.current !== "sunburst") {
            d3[FormData.type.current](chart, "destroy");
        }

        // console.log(this.chartStyle);
        // add the style element
        $("#chart-style").html(this.chartStyle);

        d3.sunburst(chart, settings);
        // set the current chart type type
        FormData.type.current = "sunburst";
    }
};

// object that builds the "area" chart
AreaChart = {
    init : function() {
        this.getSettings();
        this.getStyle();
        this.buildChart();
    },
    // data object to hold the plugin settings
    settings : {},
    getSettings : function() {
        this.settings.width = FormData.size.width;
        this.settings.height = FormData.size.height;
        this.settings.margin = {
            top : FormData.size.padding,
            bottom : FormData.size.padding,
            left : FormData.size.padding,
            right : FormData.size.padding
        };
        // do a case statement to find the data
        switch (FormData.data.source) {
            case "dummy" :
                this.settings.dataUrl = FormData.data.dummy;
                break;
            case "url" :
                this.settings.dataUrl = FormData.data.url;
                break;
            case "file" : 
                this.settings.dataUrl = FormData.data.file;  // note I will need to read this file and store the result before this point
                break;
            default : break;
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
        this.settings.colorRange = FormData.colors;
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        this.settings.chartName = FormData.theme.headerName;
    },
    chartStyle : "",
    getStyle : function() {
        this.chartStyle = "";

        // get all the theme settings and add them to the style element
        if (FormData.theme.backgroundColor) {
            this.chartStyle += "svg {background: #" + FormData.theme.backgroundColor + ";}";
        }
        // add the header style if there is a vlue for it
        if (FormData.theme.headerName) {
            this.chartStyle += ".chartName {font-size:" + FormData.theme.headerSize + "px; fill:#" + FormData.theme.headerColor + ";font-weight:bold;-webkit-transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");}";
        }
        
        this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;shape-rendering: crispEdges;}";
        this.chartStyle += ".line {fill: none;stroke: " + FormData.colors[1] + ";stroke-width: " + FormData.theme.borderSize + "px;}";
        this.chartStyle += ".dot {fill: " + FormData.colors[2] + ";stroke: " + FormData.colors[1] + ";stroke-width: 1px;}";
        this.chartStyle += ".tick {fill:none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;}";
        this.chartStyle += "text {fill: #" + FormData.theme.labelColor + ";font-size:" + FormData.theme.labelSize + "px;}"
    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current
        if (FormData.type.current && FormData.type.current !== "area") {
            d3[FormData.type.current](chart, "destroy");
        }

        //console.log(this.chartStyle)
        // add the style element
        $("#chart-style").html(this.chartStyle);
            
        console.log(settings);
        d3.area(chart, settings);
        FormData.type.current = "area";
    }
};

// object that builds the "bar" chart - I badly need to clean up this function and the bar chart plugin options as well
BarChart = {
    init : function() {
        this.getSettings();
        this.getStyle();
        this.buildChart();
    },
    // data object to hold the plugin settings
    settings : {},
    getSettings : function() {
        this.settings.width = FormData.size.width;
        this.settings.height = FormData.size.height;
        this.settings.margin = {
            top : FormData.size.padding,
            bottom : FormData.size.padding,
            left : FormData.size.padding,
            right : FormData.size.padding
        };
        // do a case statement to find the data
        switch (FormData.data.source) {
            case "dummy" :
                this.settings.dataUrl = FormData.data.dummy;
                break;
            case "url" :
                this.settings.dataUrl = FormData.data.url;
                break;
            case "file" : 
                this.settings.dataUrl = FormData.data.file;  // note I will need to read this file and store the result before this point
                break;
            default : break;
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
        this.settings.colorRange = FormData.colors;
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        this.settings.chartName = FormData.theme.headerName;
    },
    chartStyle : "",
    getStyle : function() {
        this.chartStyle = "";

        // get all the theme settings and add them to the style element
        if (FormData.theme.backgroundColor) {
            this.chartStyle += "svg {background: #" + FormData.theme.backgroundColor + ";}";
        }
        // add the header style if there is a vlue for it
        if (FormData.theme.headerName) {
            this.chartStyle += ".chartName {font-size:" + FormData.theme.headerSize + "px; fill:#" + FormData.theme.headerColor + ";font-weight:bold;-webkit-transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");transform: translate(" + ChartTheme.getHeaderPosition(FormData) + ");}";
        }
        
        this.chartStyle += ".axis path, .axis line, .domain {fill: none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;shape-rendering: crispEdges;}";
        this.chartStyle += ".line {fill: none;stroke: " + FormData.colors[1] + ";stroke-width: " + FormData.theme.borderSize + "px;}";
        this.chartStyle += ".dot {fill: " + FormData.colors[2] + ";stroke: " + FormData.colors[1] + ";stroke-width: 1px;}";
        this.chartStyle += ".tick {fill:none;stroke:#" + FormData.theme.borderColor + ";stroke-width:" + FormData.theme.borderSize + "px;}";
        this.chartStyle += "text {fill: #" + FormData.theme.labelColor + ";font-size:" + FormData.theme.labelSize + "px;}"
    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current
        if (FormData.type.current && FormData.type.current !== "bar") {
            d3[FormData.type.current](chart, "destroy");
        }

        //console.log(this.chartStyle)
        // add the style element
        $("#chart-style").html(this.chartStyle);
            
        console.log(settings);
        d3.bar(chart, settings);
        FormData.type.current = "bar";
    }
}