// extend code
// https://github.com/dansdom/extend
var Extend = Extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=Extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Area = function (options, element, callback)
    {
        // wrap the element in the jQuery object
        this.el = element;

        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "area";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = Extend(true, {}, d3.Area.settings, options);
        this.init();
        // run the callback function if it is defined
        if (typeof callback === "function")
        {
            callback.call();
        }
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Area.settings = {
        'height': '730',
        'width': '460',
        'speed' : 2000,  // transition speed
        'margin': {top: 30, right: 10, bottom: 30, left: 30},
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : null,  // this is a url for a resource
        'dataType' : 'json',
        'labelPosition' : false,
        'colorRange' : [], // instead of defining a color array, I will set a color scale and then let the user overwrite it
        // maybe only if there is one data set???
        'elements' : {
            'shape' : '#fd8d3c',  // I'll have more than just circles here - set to null if no shape is wanted
            'line' : 'black',  // the line on the graph - set to null if no line is wanted
            //'area' : 'white',  // I think if there are multiple areas, then I may use the colorRange
            'dot' : '#fdd0a2', // the dots on the line (I may make this a customisable shape though) - set to null if no dot is wanted
            'dotRadius' : 3.5,  // 0 will show no dots
            'x' : true, //  x-axis - set to null if not wanted - leaving the colors for the stylesheet
            'y' : true //   y-axis - set to null if not wanted - leaving the colors for the stylesheet
        },
        'fontSize' : 12,
        'dataStructure' : {
            'x' : 'x1',  // this value may end up being an array so I can support multiple data sets
            'y' : 'y1',
            'ticksX' : 10,  // tha amount of ticks on the x-axis
            'ticksY' : 5,  // the amount of ticks on the y-axis
            'children' : undefined
        },
        'scale' : {
            'x' : 'linear',
            'y' : 'linear'
        },
        'chartName' : false  // If there is a chart name then insert the value. This allows for deep exploration to show category name
    };
    
    // plugin functions go here
    d3.Area.prototype = {
        init : function() {
            var container = this;

            // build the chart with the data
            this.getData();
        },
        updateChart : function() {
            var container = this;

            // if there is a colour range defined for this chart then use the settings. If not, use the inbuild category20 colour range
            if (this.opts.colorRange.length > 0) {
                container.color = d3.scale.ordinal().range(this.opts.colorRange);
            }
            else {
                container.color = d3.scale.category20();
            }

            container.margin = this.opts.margin,
            container.width = this.opts.width - container.margin.left - container.margin.right;
            container.height = this.opts.height - container.margin.top - container.margin.bottom; 

            // define the scale and axis' for the graph
            this.setScale();
            this.setAxis();

            // create the svg element that holds the chart
            this.setLayout();
            // set the chart title
            this.setTitle();

            // define the line of the chart
            container.line = this.getLine();
            // define the area that sits under the line
            container.area = this.getArea();

            // add the elements to the chart
            this.addElements();
            // add the x and y axis to the chart
            this.addAxis();
            
        },
        setLayout : function() {
            var container = this;

            // define the svg element
            if (!container.svg) {
                container.svg = d3.select(container.el).append("svg")      
            }
            container.svg
                .datum(container.data)
                .attr("width", container.width + container.margin.left + container.margin.right)
                .attr("height", container.height + container.margin.top + container.margin.bottom);

            // define the chart element
            if (!container.chart) {
                container.chart = container.svg.append("g");
                    
            }
            container.chart
                .attr("class", "chart")
                .attr("transform", "translate(" + container.margin.left + "," + container.margin.top + ")");
        },
        setTitle : function() {
            var container = this;

            // ####### CHART TITLE #######
            if (container.opts.chartName) {
                if (!container.chartName) {
                    container.chartName = container.chart.append("g")
                        .attr("class", "chartName")
                        .append("text");
                        console.log('adding chart name');
                }
                container.chartName = container.chart.select(".chartName").select("text")
                    .text(function() {
                        var chartTitle;
                        if (container.opts.dataStructure.children) {
                            chartTitle = container.dataCategory;
                            console.log('there is children');
                        }
                        else {
                            chartTitle = container.opts.chartName;
                            console.log('there is no children');
                        }
                        console.log(chartTitle);
                        return chartTitle;
                    });
            }
        },
        addAxis : function() {
            var container = this;

            // define the X and Y axis
            if (!container.X) {
                container.X = container.chart.append("g")
            }
            container.X
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + container.height + ")")
                //.style("fill", "none")  // I'm thinking about using the css file for these class styles. Will sleep on it
                //.style("stroke", "#000")
                .style("shape-rendering", "crispEdges")
                .call(container.xAxis);

            if (!container.Y) {
                container.Y = container.chart.append("g")
            }
            container.Y
                .attr("class", "y-axis")
                //.style("fill", "none")
                //.style("stroke", "#000")
                .style("shape-rendering", "crispEdges")
                .call(container.yAxis);
        },
        addElements : function() {
            var container = this;

            // these two guys are going to need to be put into seperate functions that allow for multiple inputs
            // add the line
            if (container.opts.elements.shape) {
                if (!container.path) {
                    container.path = container.chart.append("path")
                        .attr("class", "line");
                        //.attr("d", container.line)
                        
                }
                // update the chart line with the new data
                container.chart.selectAll("path.line")
                    .data([container.data])
                    .transition()
                    .duration(500)
                    .attr("d", container.line)
                    .style("stroke", container.opts.elements.line);
            }
            
            // add the area 
            if (container.opts.elements.line) {
                if (!container.block) {
                    container.block = container.chart.append("path"); 
                }
            }
            container.block
                .attr("class", "area")
                .attr("d", container.area)
                .style("fill", container.opts.elements.shape);
            
            // update the chart area with the new data
            container.chart.selectAll("path.area")
                .data([container.data])
                .transition()
                .duration(500)
                .attr("d", container.area)
                .style("fill", container.opts.elements.shape);
            

            // add the dots to the line
            // will put more options in here to specify the dots
            if (container.opts.elements.dot) {
                
                // get the dots on the line
                container.circle = container.chart.selectAll(".dot")
                    .data(container.data.filter(function(d) { return d[container.opts.dataStructure.y]; }))

                // current circles
                container.circle
                    .style("stroke-opacity", 1e-6)
                    .style("fill-opacity", 1e-6)
                    .attr("cx", container.line.x())
                    .attr("cy", container.line.y())
                    .transition()
                  .delay(500)
                    .duration(500)
                    .attr("r", container.opts.elements.dotRadius)
                    .style("fill", container.opts.elements.dot)
                    .style("stroke", container.opts.elements.line)
                    .style("stroke-opacity", 1)
                    .style("fill-opacity", 1);

                // add the new dots
                container.circle.enter().append("circle")
                    .attr("class", "dot")
                    .attr("cx", container.line.x())
                    .attr("cy", container.line.y())
                    .attr("r", container.opts.elements.dotRadius)
                    .style("fill", container.opts.elements.dot)
                    .style("stroke", container.opts.elements.line)
                    .style("stroke-opacity", 1e-6)
                    .style("fill-opacity", 1e-6)
                // define the transition of the new circles
                  .transition()
                  .delay(500)
                    .duration(500)
                    .attr("cx", container.line.x())
                    .attr("cy", container.line.y())
                    .style("stroke-opacity", 1)
                    .style("fill-opacity", 1);

                // remove the old ones
                container.circle.exit()
                  .transition()
                    .duration(500)
                    .style("stroke-opacity", 1e-6)
                    .style("fill-opacity", 1e-6)
                    .remove();
            }  
        },
        getLine : function() {
            var container = this;
            return d3.svg.line()
                .x(function(d) { return container.xScale(d[container.opts.dataStructure.x]); })
                .y(function(d) { return container.yScale(d[container.opts.dataStructure.y]); });
        },
        getArea : function() {
            var container = this;
            return d3.svg.area()
                .x(container.line.x())
                .y1(container.line.y())
                .y0(container.yScale(0));
        },
        isScaleNumeric : function(scale) {
            // find out whether the scale is numeric or not
            switch(scale) {
                case "linear" :
                    return true;
                    break;
                case "pow" :
                    return true;
                    break;
                case "log" :
                    return true;
                    break;
                case "quanitze" :
                    return true;
                    break;
                case "identity" :
                    return true;
                    break;
                default : 
                    return false;
            }
        },
        parseData : function(data) {
            // I may want to flatten out nested data here. not sure yet
            // if the scale is ordinal, I have to put in an opening value so that I can push the data across the chart
            // the first thing I have to do here is make sure the "value" field is numeric.
            var container = this,
                scaleX = container.opts.scale.x,
                scaleY = container.opts.scale.y,
                dataLength = data.length;

            if (container.isScaleNumeric(scaleX)) {
                for (var i = 0; i < dataLength; i++) {
                    // parse the x scale
                    data[i][container.opts.dataStructure.x] = parseFloat(data[i][container.opts.dataStructure.x]);
                }
            }

            if (container.isScaleNumeric(scaleY)) {
                for (var j = 0; j < dataLength; j++) {
                    // parse the y scale
                    data[j][container.opts.dataStructure.y] = parseFloat(data[j][container.opts.dataStructure.y]);
                }
            }

            return data;
        },
        // need to do some thinking around these next 2 functions
        // NOTE: there is SOO much to do in this function. definately will have to go back and make the scales more flexible
        setScale : function() {
            var container = this;

            // set the X scale
            container.xScale = d3.scale[container.opts.scale.x]()

            if (container.opts.scale.x === "linear") {
                // setting the X scale domain to go from the min value to the max value of the data.x set
                // if multiple areas on the chart, I will have to check all data sets before settings the domain
                container.xScale
                    .domain([
                        d3.min(container.data, function(d) { return d[container.opts.dataStructure.x]; }),
                        d3.max(container.data, function(d) { return d[container.opts.dataStructure.x]; })
                    ])
                    // set the range to go from 0 to the width of the chart
                    .range([0, container.width]);
            }            
            else if (container.opts.scale.x === "ordinal") {
                container.xScale
                    .domain(container.data.map(function(d) { return d[container.opts.dataStructure.x]; }))
                    .rangeRoundBands([0, container.width], 0.1);
            }
            // hopefully I can fit into one of the two current treatments
            else if (container.opts.scale.x === "pow") {
            }


            // if the scale is ordinal then add the rangeBounds - e.g.: .rangeRoundBands([0, width], .1);  (http://bl.ocks.org/3885304)
            container.yScale = d3.scale[container.opts.scale.y]()
                // setting the Y scale domain to go from 0 to the max value of the data.y set
            if (container.opts.scale.y === "linear") {
                container.yScale
                    .domain([
                        0,
                        d3.max(container.data, function(d) { return d[container.opts.dataStructure.y]; })
                    ])
                    // set the range to go from 0 to the height of the chart
                    .range([container.height, 0]);
            }            
            else if (container.opts.scale.y === "ordinal") {
                container.yScale
                    .domain([
                        0, 
                        d3.max(container.data, function(d) { return d[container.opts.dataStructure.y]; } )])
                    .range([container.height, 0]);
            }
            // hopefully I can fit into one of the two current treatments
            else if (container.opts.scale.y === "pow") {
            }
        },
        setAxis : function() {

            var container = this;
            // need to add tick options here

            this.xAxis = d3.svg.axis()
                .scale(this.xScale)
                .ticks(container.opts.dataStructure.ticksX)
                .orient("bottom");

            this.yAxis = d3.svg.axis()
                .scale(this.yScale)
                .ticks(container.opts.dataStructure.ticksY)
                .orient("left");
        },
        // updates the data set for the chart
        // I may just want to process the input and then call getData()
        updateData : function(data) {
            var container = this;

            //container.opts.dataUrl = data;
            this.getData();
        },
        // gets data from a JSON request
        getData : function() {
            var container = this;
            
            // check to see where the data is coming from
            if (container.opts.dataUrl) {
                // go get the data from an ajax call
                // test whether it's json or csv
                
                var regex = /\.([0-9a-z]+)(?:[\?#]|$)/i;
                var urlExt = container.opts.dataUrl.substring((container.opts.dataUrl.length - 5));
                var fileType = urlExt.match(regex)[0];
                
                if (fileType === ".json") {
                    //console.log('do json call');
                    // build the chart
                    d3.json(container.opts.dataUrl, function(error, data) {
                        container.data = container.parseData(data);
                        container.updateChart(); 
                    });
                }
                else if (fileType === ".csv") {
                    //console.log('do csv call');
                    // build the chart
                    d3.csv(container.opts.dataUrl, function(error, data) {
                        container.data = container.parseData(data);
                        container.updateChart(); 
                    });
                }
                else if (fileType === ".tsv") {
                    //console.log('do csv call');
                    // build the chart
                    d3.csv(container.opts.dataUrl, function(error, data) {
                        container.data = container.parseData(data);
                        container.updateChart(); 
                    });
                }
            }
            else {
                // the data is passed straight into the plugin form either a function or a data object
                // I expect a JSON object here
                container.data = container.parseData(container.opts.data);
                container.updateChart(); 
            }    
        },
        // updates the settings of the chart
        settings : function(settings) {
            // the data object is giving to much recursion on the Extend function.
            // will have to manually clean it if more data is being set
            if (settings.data) {
                this.opts.data = null;
            }
            // I need to sort out whether I want to refresh the graph when the settings are changed
            this.opts = Extend(true, {}, this.opts, settings);
            // will make custom function to handle setting changes
            this.getData();
        },
        destroy : function() {
            this.el.removeAttribute(this.namespace);
            this.el.removeChild(this.el.children[0]);
            this.el[this.namespace] = null;
        }     
    };
    
    // the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
    // props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
    d3.area = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "area",
            args;

        function applyPluginMethod(el) {
            var pluginInstance = el[pluginName];   
            // if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
            if (!pluginInstance) {
                alert("The plugin has not been initialised yet when you tried to call this method: " + options);
                //return;
            }
            // if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
            if (typeof pluginInstance[options] !== "function" || options.charAt(0) === "_") {
                alert("the plugin contains no such method: " + options);
                //return;
            }
            // apply the method that has been called
            else {
                pluginInstance[options].apply(pluginInstance, args);
            }
        };

        function initialisePlugin(el) {
            // define the data object that is going to be attached to the DOM element that the plugin is being called on
            // need to create a global data holding object. 
            var pluginInstance = el[pluginName];
            // if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
            if (pluginInstance) {
                // going to need to set the options for the plugin here
                pluginInstance.settings(options);
            }
            // initialise a new instance of the plugin
            else {
                el.setAttribute(pluginName, true);
                // I think I need to anchor this new object to the DOM element and bind it
                el[pluginName] = new d3.Area(options, el, callback);
            }
        };
        
        // if the argument is a string representing a plugin method then test which one it is
        if ( typeof options === 'string' ) {
            // define the arguments that the plugin function call may make 
            args = Array.prototype.slice.call(arguments, 2);
            // iterate over each object that the function is being called upon
            if (element.length) {
                for (var i = 0; i < element.length; i++) {
                    applyPluginMethod(element[i]);
                };
            }
            else {
                applyPluginMethod(element);
            }
            
        }
        // initialise the function using the arguments as the plugin options
        else {
            // initialise each instance of the plugin
            if (element.length) {
                for (var i = 0; i < element.length; i++) {
                    initialisePlugin(element[i]);
                }
            }
            else {
                initialisePlugin(element);
            }
        }
        return this;
    };
// end of module
})(d3);