// extend code
// https://github.com/dansdom/extend
//var extend = extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Sunburst = function (options, element, callback) {
        // wrap the element in the jQuery object
        this.el = element;
        this.callback = callback;
        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "sunburst";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = extend(true, {}, d3.Sunburst.settings, options);
        this.init();
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Sunburst.settings = {
        'height' : 200,
        'width' : 200,
        'radius' : 200,
        'speed' : 1000,
        'padding': 2,
        'labelPosition' : 1, // this is the position of the segment labels. 0 = center of chart. 1 = center of segment. > 2 = outside the chart
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : 'flare.json',  // this is a url for a resource
        'dataType' : 'json',        
        'colorRange' : [], // instead of defining a color array, I will set a color scale and then let the user overwrite it
        'elements' : {            // style colors
            'borderColor' : 'white',
            'borderWidth' : 1
        },
        'fontSize' : 12,
        // defines the data structure of the chart
        'dataStructure' : {
            'name' : 'label',
            'value' : 'size'
        },
        'tooltip' : { // tooltip options
            'visible' : true,
            'id' : 'tooltip',
            'height' : 60,
            'width' : 200,
            'offset' : {
                'x' : 10,
                'y' : -30
            }
        },
        'chartName' : null
    };
    
    // plugin functions go here
    d3.Sunburst.prototype = {
        init : function() {

            var container = this;
            
            // set the scale for the chart - I may or may not actually use this scale
            container.scaleX = d3.scale.linear().range([0, this.opts.width]);
            container.scaleY = d3.scale.linear().range([0, this.opts.height]);
            // define the data format - not 100% sure what this does. will need to research this attribute
            //container.format = d3.format(",d");

            this.getData();

        },
        updateChart : function() {

            var container = this,
                arcTween = function(a) {
                    var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
                    return function(t) {
                        var b = i(t);
                        a.x0 = b.x;
                        a.dx0 = b.dx;
                        return container.arc(b);
                    };
                },
                stash = function(d) {
                    d.x0 = 0; // d.x;
                    d.dx0 = 0; //d.dx;
                };

            // if there is a colour range defined for this chart then use the settings. If not, use the inbuild category20 colour range
            if (this.opts.colorRange.length > 0) {
                container.color = d3.scale.ordinal().range(this.opts.colorRange);
            } else {
                container.color = d3.scale.category20c();
            }

            // set the layout for the chart
            this.setLayout();
            // set the chart title
            this.setTitle();
            // add the tooltip
            this.addTooltip();

            container.path = container.chart.datum(container.data).select(".sunburst").selectAll("path")
                .data(container.partition.nodes);

            container.path
                .each(stash)
                .transition()
                .duration(container.opts.speed)
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                //.attr("d", container.arc)
                .attrTween("d", arcTween)
                .style({
                    "stroke" : container.opts.elements.borderColor,
                    "stroke-width" : container.opts.elements.borderWidth,
                    "fill" : function(d) {
                        if (d[container.opts.dataStructure.children]) {
                            return container.color(d.name);
                        } else {
                            return container.color(d.parent.name);
                        }
                    }
                });
                
            var oldValues = container.path.exit();
            oldValues.remove();

            var newValues = container.path.enter();
            newValues.append("path")
                .each(stash)
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                //.attr("d", container.arc)
                .style({
                    "stroke" : container.opts.elements.borderColor,
                    "stroke-width" : container.opts.elements.borderWidth,
                    "fill" : function(d) {
                        if (d[container.opts.dataStructure.children]) {
                            return container.color(d.name);
                        } else {
                            return container.color(d.parent.name);
                        }
                    },
                    "fill-rule" : "evenodd"
                })
                .transition()
                .duration(container.opts.speed)
                .attrTween("d", arcTween); 

            if (container.opts.tooltip.visible) {
                container.addTooltipEvents(container.path);
                //container.addTooltipEvents(newValues);
            }

            // run the callback function after the plugin has finished initialising
            if (typeof container.callback === "function") {
                container.callback.call(this, container);
            }  
        },
        setLayout : function() {
            var container = this;

            // define the svg element that holds the chart
            if (!container.chart) {
                container.chart = d3.select(container.el).append("svg");
                    
            }
            container.chart
                .attr({
                    "width" : container.opts.width,
                    "height" : container.opts.height
                });

            // define the sunburst element
            if (!container.sunburst) {
                container.sunburst = container.chart.append("g")
                    .attr("class", "sunburst");
            }
            container.sunburst
                .attr("transform", "translate(" + (container.opts.width / 2) + "," + (container.opts.height / 2) + ")");

            // define the partition element
            if (!container.partition) {
                container.partition = d3.layout.partition()
                    .sort(null);
                    
            }
            container.partition
                .size([2 * Math.PI, container.opts.radius * container.opts.radius])
                .children(function(d) {return d[container.opts.dataStructure.children]; })
                .value(function(d) { return d[container.opts.dataStructure.value]; });

            // define the arc
            if (!container.arc) {
                container.arc = d3.svg.arc()
                    .startAngle(function(d) { return d.x; })
                    .endAngle(function(d) { return d.x + d.dx; })
                    .innerRadius(function(d) { return Math.sqrt(d.y); })
                    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
            }
        },
        addTooltip : function() {
            var container = this,
                toolOpts = container.opts.tooltip,
                tooltip, name, value;

            if (toolOpts.visible) {
                // create a stacking context
                d3.select(container.el).style("position", "relative");
                // if the tooltip already exists then remove it
                tooltip = d3.select(container.el).select("#" + toolOpts.id).remove();
                tooltip = d3.select(container.el).append("div");                

                tooltip.attr('id', toolOpts.id)
                    .attr("class", "tooltip")
                    .style({
                        "height" : toolOpts.height + "px",
                        "width" : toolOpts.width + "px",
                        "position" : "absolute",
                        "display" : "none",
                        "top" : "0px",
                        "left" : "0px"
                    });
                name = tooltip.append("div").attr("class", "name");
                name.append("label").text("Name: ");
                name.append("span");
                value = tooltip.append("div").attr("class", "value");
                value.append("label").text("Value: ");
                value.append("span")
            }
        },
        addTooltipEvents : function(elements) {
            var container = this;

            // remove any previously bound tooltip first
            elements
                .on("mouseover.tooltip", null)
                .on("mouseout.tooltip", null)
                .on("mouseover.tooltip", function(d, i) {
                    var tooltip = d3.select("#" + container.opts.tooltip.id),
                        mouse = d3.mouse(container.el);

                    tooltip.style({
                        "display" : "block",
                        "left" : (mouse[0] + container.opts.tooltip.offset.x) + "px",
                        "top" : (mouse[1] + container.opts.tooltip.offset.y) + "px"
                    });

                    tooltip.select(".name").select("span")
                        .text(d.name);

                    tooltip.select(".value").select("span")
                        .text(d.value);
                })
                .on("mouseout.tooltip", function(d, i) {
                    d3.select("#" + container.opts.tooltip.id).style("display", "none");
                });
        },
        setTitle : function() {
            var container = this;

            // ####### CHART TITLE #######
            if (container.opts.chartName) {
                if (!container.chartName) {
                    container.chartName = container.chart.append("g")
                        .attr("class", "chartName")
                        .append("text");
                }
                container.chartName = container.chart.select(".chartName").select("text")
                    .text(container.opts.chartName);
            }
        },
        // resets the zoom on the chart
        resetChart : function() {
            var container = this;

            container.updateChart(container.data);
                
            // stops the propagation of the event
            if (d3.event) {
                d3.event.stopPropagation();
            }
        },
        // Returns a flattened hierarchy containing all leaf nodes under the root.
        parseData : function(data) {
           
            var dataList = [],
                children = this.opts.dataStructure.children,
                container = this;
        
            // recursively loop through each child of the object
            function recurse(name, node) {
                if (node[children]) {
                    node[children].forEach(function(child) { recurse(node[container.opts.dataStructure.name], child); });
                }
                else {
                    dataList.push({name: name, className: node[container.opts.dataStructure.name], value: parseFloat(node[container.opts.dataStructure.value])});
                }
            }

            recurse(null, data);
            return {children: dataList};  
        },
        // updates the data set for the chart
        updateData : function(url, type) {
            var container = this,
                data = container.data;

            d3.json(url, function(error, data) {
                // data object
                container.data = data;
                //container.data = container.parseData(data);
                container.updateChart();
            });
        },
        // gets data from a JSON request
        getData : function() {
            var container = this;

            // need to test if the data is provided or I have to make a requset first
            if (container.opts.data) {
                container.data = container.opts.data;
                container.updateChart();
            } else {
                d3.json(this.opts.dataUrl, function(error, data) {
                    // data object
                    container.data = data;
                    //container.data = container.parseData(data);
                    container.updateChart();
                });
            }
        },
        // updates the settings of the chart
        settings : function(settings) {
            // the data object is giving to much recursion on the extend function.
            // will have to manually clean it if more data is being set
            if (settings.data) {
                this.opts.data = null;
            }
            // I need to sort out whether I want to refresh the graph when the settings are changed
            this.opts = extend(true, {}, this.opts, settings);
            // will make custom function to handle setting changes
            this.getData();
        },
        // kills the chart
        destroy : function() {
            this.el.removeAttribute(this.namespace);
            this.el.removeChild(this.el.children[0]);
            this.el[this.namespace] = null;
            if (this.opts.tooltip.visible) {
                d3.select(this.el).select("#" + this.opts.tooltip.id).remove();
            }
        }     
    };
    
    // the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
    // props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
    d3.sunburst = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "sunburst",
            args,
            i;

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
        }

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
                el[pluginName] = new d3.Sunburst(options, el, callback);
            }
        }
        
        // if the argument is a string representing a plugin method then test which one it is
        if ( typeof options === 'string' ) {
            // define the arguments that the plugin function call may make 
            args = Array.prototype.slice.call(arguments, 2);
            // iterate over each object that the function is being called upon
            if (element.length) {
                for (i = 0; i < element.length; i++) {
                    applyPluginMethod(element[i]);
                }
            }
            else {
                applyPluginMethod(element);
            }
            
        }
        // initialise the function using the arguments as the plugin options
        else {
            // initialise each instance of the plugin
            if (element.length) {
                for (i = 0; i < element.length; i++) {
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
