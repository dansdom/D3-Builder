
var D3Builder = D3Builder || {};
// form data object
// this is the default form object
D3Builder.formDefault = {
    type : {
        current : null,  // this stores the currently displayed chart type to handle the transitions
        primary : 0,
        secondary : "pie"
    },
    size : {
        height : 680,
        width : 680,
        outerRadius : 300,
        innerRadius : 0,
        padding : 50,
        paddingTop : 50,
        paddingBottom : 50,
        paddingLeft : 50,
        paddingRight : 50
    },
    colors : [], // color array
    data : {
        source : "spoke",  // hmmm what to default to?
        structure : "flat", // this will either be "flat" or "nested"
        allowed : "flat", // data type allowed "flat-single", "nested-single", "flat-multi", "nested-multi", "both-single", "both-multi" - multi allows for multiple values in each field
        dummy : null, // dummy data set to be used
        url : null, // url of data resource
        file : null, // if a resource is uploaded then I will have to pull the file and read it, and then add it
        dataObject : null,  // this stores the data as an object - from file upload or dummy
        attributes : {
            name : "name",
            value : "size",
            children : "children",
            key : "colour",
            x : "x",
            y : "y",
            ticksX : "auto",
            ticksY : "auto"
        },
        scale : {
            x : "linear",  // these scales can be "linear", "pow" or "ordinal". default to "linear"
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

// this objects holds the entire form data object
D3Builder.formData = {
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
        padding : 0,
        paddingTop : 0,
        paddingBottom : 0,
        paddingLeft : 0,
        paddingRight : 0
    },
    colors : [], // color array
    data : {
        source : "spoke",  // hmmm what to default to?
        structure : "flat", // this will either be "flat" or "nested"
        allowed : "flat", // data type allowed "flat", "nested", "flat-multi", "nested-multi" - multi allows for multiple values in each field
        dummy : null, // dummy data set to be used
        url : null, // url of data resource
        file : null, // if a resource is uploaded then I will have to pull the file and read it, and then add it
        dataObject : null,  // this stores the data as an object - from file upload or dummy
        attributes : {
            name : "name",
            value : "size",
            children : "children",
            key : "colour",
            x : "x",
            y : "y",
            ticksX : "auto",
            ticksY : "auto"
        },
        scale : {
            x : "linear",  // these scales can be "linear", "pow" or "ordinal". default to "linear"
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