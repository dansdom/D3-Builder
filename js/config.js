// Configuration Object
//
// sets the options for the interface for each chart type. This is a purely data object

var Config = {
    dataAllowed : {
        "pie" :         ["flat", "nested"],
        "pack" :        ["nested"],
        "sunburst" :    ["nested"],
        "force" :       ["nested"],
        "area" :        ["quantitative", "flat"],
        "bar" :         ["quantitative", "flat"],
        "chord" :       ["matrix"],
        "scatterplot" : ["quantitative"]
    },
    dataAttributes : {
        "pie" :         ["name", "value", "children"],
        "pack" :        ["name", "value", "children"],
        "sunburst" :    ["name", "value", "children"],
        "force" :       ["name", "value", "children"],
        "area" :        ["x", "y", "key"],
        "bar" :         ["x", "y", "key"],
        "chord" :       ["x", "y"],
        "scatterplot" : ["x", "y", "key"]
    },
    dataScaleX : {
        "pie" :         ["ordinal"],
        "pack" :        ["ordinal"],
        "sunburst" :    ["ordinal"],
        "force" :       ["ordinal"],
        "area" :        ["linear", "ordinal"],
        "bar" :         ["linear", "ordinal"],
        "chord" :       ["linear"],
        "scatterplot" : ["linear"]
    },
    dataScaleY : {
        "pie" :         ["linear"],
        "pack" :        ["linear"],
        "sunburst" :    ["linear"],
        "force" :       ["linear"],
        "area" :        ["linear"],
        "bar" :         ["linear"],
        "chord" :       ["linear"],
        "scatterplot" : ["linear"]
    },
    sizePadding : {
        "pie" :         ["padding"],
        "pack" :        ["padding"],
        "sunburst" :    ["padding"],
        "force" :       ["padding"],
        "area" :        ["padding-left", "padding-right", "padding-top", "padding-bottom"],
        "bar" :         ["padding-left", "padding-right", "padding-top", "padding-bottom"],
        "chord" :       ["padding"],
        "scatterplot" : ["padding-left", "padding-right", "padding-top", "padding-bottom"]
    }
};