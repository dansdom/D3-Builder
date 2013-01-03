// form data object
// this objects holds the entire form data object
FormData = {
    type : {
        current : null,  // this stores the currently displayed chart type to handle the transitions
        primary : "pie",
        secondary : "pie"
    },
    size : {
        height : 0,
        width : 0,
        outerRadius : 0,
        innerRadius : 0,
        padding : 0
    },
    colors : [], // color array
    data : {
        source : "string",  // hmmm what to default to?
        structure : "flat", // this will either be "flat" or "nested"
        dummy : null, // dummy data set to be used
        url : null, // url of data resource
        file : null, // if a resource is uploaded then I will have to pull the file and read it, and then add it
        attributes : {
            name : "name",
            value : "size",
            children : "children"
        },
        scale : {
            x : "linear",  // these scales can be "linear", "exponential" or "ordinal". default to "linear"
            y : "linear"
        }
    },
    theme : {
        backgroundColor : false,
        headerName : false,
        headerSize : false,
        headerPosition : false,
        headerOffset : {
            y : 0,
            x : 0
        },
        headerColor : "rgb(0,0,0)",
        labelSize : false,
        labelPosition : 0,
        labelColor : "rgb(0,0,0)",
        borderSize : 0,
        borderColor : "rgb(0,0,0)"
    },
    events : {},
    // this initialises the plugin and builds the chart
    buildChat : function() {
        // yet to do though
    }
};

// object that builds the pie chart
PieChart = {
    init : function() {
        this.getSettings();
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
        this.settings.chartName = FormData.theme.headerName;
    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current chart if it's not a pie
        if (FormData.type.current && FormData.type.current !== "pie") {
            console.log("destroying old chart");
            //$("#chart-preview svg").remove();
            d3[FormData.type.current](chart, "destroy");
        }
            
        d3.pie(chart, settings);
        FormData.type.current = "pie";
        console.log("current: " + FormData.type.current);
    }
};

// object that builds the pack chart
PackChart = {
    init : function() {
        console.log("building pack chart");
        this.getSettings();
        this.buildChart();
    },
    settings : {},
    getSettings : function() {
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

    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current chart if it's not a pie
        if (FormData.type.current && FormData.type.current !== "pack") {
            console.log("destroying old chart");
            d3[FormData.type.current](chart, "destroy");
        }

        d3.pack(chart, settings);
        // set the current chart type type
        FormData.type.current = "pack";
    }
};

// object that builds the force chart
ForceChart = {
    init : function() {
        console.log("building force chart");
        this.getSettings();
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

    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current chart if it's not a pie
        if (FormData.type.current && FormData.type.current !== "force") {
            console.log("destroying old chart");
            d3[FormData.type.current](chart, "destroy");
        }

        d3.force(chart, settings);
        // set the current chart type type
        FormData.type.current = "force";
    }
};

// object that builds the sunburst chart
SunburstChart = {
    init : function() {
        console.log("building sunburst chart");
        this.getSettings();
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
        this.settings.colors = {
            'parent' : FormData.colors[0],
            'group' : FormData.colors[1],
            'child' : FormData.colors[2]
        };
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        // I'll need to add this to the form
        //this.settings.speed = FormData.events.speed;

    },
    buildChart : function() {
        var chart = document.getElementById("chart-preview"),
            settings = this.settings;

        // destroy the current chart if it's not a pie
        if (FormData.type.current && FormData.type.current !== "sunburst") {
            console.log("destroying old chart");
            d3[FormData.type.current](chart, "destroy");
        }

        d3.sunburst(chart, settings);
        // set the current chart type type
        FormData.type.current = "sunburst";
    }
};