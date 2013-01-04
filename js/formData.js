// form data object
// this is the default form object
FormDefault = {
    type : {
        current : null,  // this stores the currently displayed chart type to handle the transitions
        primary : 0,
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
}


// this objects holds the entire form data object
FormData = {
    type : {
        current : null,  // this stores the currently displayed chart type to handle the transitions
        primary : 0,
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