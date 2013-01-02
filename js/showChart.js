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
        this.settings.radius = FormData.size.innerRadius;
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