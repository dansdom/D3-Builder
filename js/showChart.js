// form data object
// this objects holds the entire form data object
FormData = {
    type : {
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
            parent : "parent"
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
    events : {} 
};

// object that builds the pie chart
PieChart = {
    init : function() {
        console.log("building pie chart");
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

            console.log(settings);
            
        d3.pie(chart, settings);
    }
};
/*
// these are the plugin default settings that will be over-written by user settings
    d3.Pack.settings = {
        'diameter': 500,
        'padding': 2,
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : 'flare.json',  // this is a url for a resource
        'dataType' : 'json',
        // instead of defining a color array, I will set a color scale and then let the user overwrite it
        'colorRange' : [],
        'chartType' : 'pack',
        'fontSize' : 12,
        // defines the data structure of the document
        'dataStructure' : {
            'name' : 'name',
            'value' : 'size',
            'children' : 'group'
        },
        'speed' : 1500  // speed of the trasitions
    };
*/
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
            default : break;type.secondary;
        };type.secondary;
        this.chartType = FormData.type.secondary;
        this.settings.colorRange = FormData.colors;
        this.settings.fontSize = FormData.theme.labelSize;
        this.settings.dataStructure = FormData.data.attributes;
        // I'll need to add this to the form
        //this.settings.speed = FormData.events.speed;

    },
    buildChart : function() {

    }
};