// Configuration Object
//
// sets the options for the interface for each chart type. This is a purely data object

Config = {
	dataAllowed : {
		"pie" : 		["flat", "nested"],
		"pack" : 		["nested"],
		"sunburst" : 	["nested"],
		"force" : 		["nested"],
		"area" : 		["quantitative", "flat"],
		"bar" : 		["quantitative", "flat"],
		"chord" : 		["matrix"],
		"scatterplot" : ["quantitative"]
	},
	dataAttributes : {
		"pie" : 		["name", "value", "children"],
		"pack" : 		["name", "value", "children"],
		"sunburst" : 	["name", "value", "children"],
		"force" : 		["name", "value", "children"],
		"area" : 		["x", "y"],
		"bar" : 		["x", "y"],
		"chord" : 		["x", "y"],
		"scatterplot" : ["x", "y", "category"]
	},
	dataScaleX : {
		"pie" : 		["ordinal"],
		"pack" : 		["ordinal"],
		"sunburst" : 	["ordinal"],
		"force" : 		["ordinal"],
		"area" : 		["linear", "ordinal"],
		"bar" : 		["linear", "ordinal"],
		"chord" : 		["linear"],
		"scatterplot" : ["linear"]
	},
	dataScaleY : {
		"pie" : 		["linear"],
		"pack" : 		["linear"],
		"sunburst" : 	["linear"],
		"force" : 		["linear"],
		"area" : 		["linear"],
		"bar" : 		["linear"],
		"chord" : 		["linear"],
		"scatterplot" : ["linear"]
	}
}