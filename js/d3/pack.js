// extend code
// https://github.com/dansdom/extend
var Extend = Extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=Extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Pack = function (options, element, callback)
    {
        // wrap the element in the jQuery object
        this.el = element;

        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "pack";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = Extend(true, {}, d3.Pack.settings, options);
        this.init();
        // run the callback function if it is defined
        if (typeof callback === "function")
        {
            callback.call();
        }
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Pack.settings = {
        'height' : 800,
        'width' : 800,
        'diameter': 500,
        'padding': 20,
        'spacing' : 0,
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : 'flare.json',  // this is a url for a resource
        'dataType' : 'json',
        // instead of defining a color array, I will set a color scale and then let the user overwrite it
        'colorRange' : [],
        'colors' : {
            'group' : '#1f77b4',
            'leaf' : '#ff7f0e',
            'label' : 'black'
        },
        'opacity' : 0.2,
        'chartType' : 'pack',
        'fontSize' : 12,
        // defines the data structure of the document
        'dataStructure' : {
            'name' : 'name',
            'value' : 'size',
            'children' : 'group'
        },
        'chartName' : null,
        'speed' : 1500  // speed of the trasitions
    };
    
    // plugin functions go here
    d3.Pack.prototype = {
        init : function() {

            var container = this;
            // set the scale for the chart - I may or may not actually use this scale
            container.scaleX = d3.scale.linear().range([0, this.opts.diameter]);
            container.scaleY = d3.scale.linear().range([0, this.opts.diameter]);
            // define the data format - not 100% sure what this does. will need to research this attribute
            container.format = d3.format(",d");
            
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

            // set the layout of the chart
            this.setLayout();
            // set the chart title
            this.setTitle();

            // if type = Bubble (i.e. shallow representation), create the bubble svg
            if (container.opts.chartType == 'bubble') {
                // resets the charts position. Only for the bubble type
                container.chart
                    .on("click", function() {
                        container.resetChart();
                    });

                // place the current nodes
                this.placeCurrentBubbleNodes();
                // remove the old nodes
                this.placeOldBubbleNodes();
                // place the new nodes
                this.placeNewBubbleNodes();
                // make sure the style is right
                container.chart.selectAll(".node").selectAll("circle")
                    .style("fill-opacity", 1)
                    .style("stroke", null)

            }
            // if type = Pack (i.e. deep representation)
            else if (container.opts.chartType == 'pack') {

                // define the data set and then append the g nodes for the data
                // add class depending on if the node has children 
                // place the current nodes
                this.placeCurrentPackNodes();
                // remove the old nodes
                this.placeOldPackNodes();
                // place the new nodes
                this.placeNewPackNodes();
                // style the circles
                
                container.chart.selectAll(".group").selectAll("circle")
                    .style("stroke", container.opts.colors.group)
                    .style("fill", container.opts.colors.group)
                    .style("fill-opacity", container.opts.opacity);

                container.chart.selectAll(".leaf").selectAll("circle")
                    .style("fill", container.opts.colors.leaf);
                
            }
        },
        setLayout : function() {
            var container = this;

            console.log(this.opts);

            // DEFINE EACH OF THE TWO TYPES OF LAYOUTS
            // this is the layout for the regular pack i.e. layered chart
            if (!container.pack) {
                container.pack = d3.layout.pack();
            }
            container.pack
                .size([this.opts.diameter, this.opts.diameter])
                // custom size function as passed into the options object
                .value(function(d) { return d[container.opts.dataStructure.value]})
                // custom children function as passed into the options object
                .children(function(d) { return d[container.opts.dataStructure.children]})
                .padding(container.opts.spacing);

            // this is the layout for the bubble pack i.e. flat chart
            if (!container.bubble) {
                container.bubble = d3.layout.pack()
                    .sort(null);
            }
            container.bubble
                .size([this.opts.diameter, this.opts.diameter])
                .padding(container.opts.spacing);
                
            // create the svg element that holds the chart
            if (!container.chart) {
                container.chart = d3.select(container.el).append("svg");
            }
            container.chart
                .attr("width", this.opts.width)
                .attr("height", this.opts.height)
                .attr("class", container.opts.chartType);

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
        placeCurrentBubbleNodes : function() {
            var container = this;

            // go in and select the nodes
                container.node = container.chart.selectAll(".node")
                    .data(container.bubble.nodes(container.parseData(container.data))
                        .filter(function(d) { return !d.children; }));
                    
            // set the transition of the existing nodes
            container.node
                .transition()
                .duration(container.opts.speed)
                .attr("transform", function(d) { return "translate(" + (d.x + (container.opts.width - container.opts.diameter)/2) + "," + (d.y + (container.opts.height - container.opts.diameter)/2) + ")"; });

            // for existing nodes, select the circle and do the transition for them
            container.node.select("circle")
                .transition()
                .duration(container.opts.speed)
                .attr("r", function(d) { return d.r; })
                .style("fill", function(d) { return container.color(d.packageName); }); 

            // for existing nodes, select the text and then transition them in
            container.node.select("text")
                .transition()
                .delay(container.opts.speed/2)
                .style("font-size", container.opts.fontSize + "px")
                .text(function(d) { return d.className.substring(0, d.r / 4); }); 
        },
        placeOldBubbleNodes : function() {
            var container = this;

            // define the old nodes that don't exist and then fade them out  
            container.node.exit()
                .transition()
                .duration(container.opts.speed)
                .style("fill-opacity", 1e-6)
                .remove();
        },
        placeNewBubbleNodes : function() {
            var container = this,
                // define the new nodes and then move them into the correct place
                newNodes = container.node.enter()
                    .append("g")
                    .attr("transform", function(d) { return "translate(" + (d.x + (container.opts.width - container.opts.diameter)/2) + "," + (d.y + (container.opts.height - container.opts.diameter)/2) + ")"; })
                    .attr("class", "node")
                    .on("click", function(d) { container.zoom(d); });
                    
            // for the new nodes add the4 title for them
            newNodes.append("title")
                .text(function(d) { return d.className + ": " + container.format(d.value); });

            // for the new nodes, append the circles and then fade them in
            newNodes.append("circle")
                .attr("r", 0)
                .transition()
                .duration(container.opts.speed)
                .attr("r", function(d) { return d.r; })
                .style("fill", function(d) { return container.color(d.packageName); });

            // for the new nodes, append the text and them shorten it after the delay that equals the transition
            newNodes.append("text")
                .style("text-anchor", "middle")
                .style("font-size", container.opts.fontSize + "px")
                .attr("dy", ".3em")
                .transition()
                .delay(container.opts.speed)
                .text(function(d) { return d.className.substring(0, d.r / 4); });
        },
        placeCurrentPackNodes : function() {
            var container = this;

            // go in and select the nodes
            container.node = container.chart.datum(container.data).selectAll(".node")
                .data(container.pack.nodes);

            // set the transition of the existing nodes
            container.node.transition()
                .duration(container.opts.speed)
                .attr("transform", function(d) { return "translate(" + (d.x + (container.opts.width - container.opts.diameter)/2) + "," + (d.y + (container.opts.height - container.opts.diameter)/2) + ")"; })
                .attr("class", function(d) {
                    if (d.children) {
                        return "group node";
                    }
                    else {
                        return "leaf node";
                    } 
                });

            // ignore events on the nodes without children
            container.node.filter(function(d) { return !d.children; })
                .style("pointer-events", "none");

            // only put zoom event on nodes that are parents
            // enable pointer events
            container.node.filter(function(d) { return d.children; })
                .on("click", function(d) { container.zoom(d); })
                .style("pointer-events", null);
                    
            container.node.select("circle").transition()
                .duration(container.opts.speed)
                .attr("r", function(d) { return d.r; });

            // start fresh with the text nodes
            container.node.select("text").remove();
            container.node.filter(function(d) { return !d.children; }).append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .transition()
                .delay(container.opts.speed)
                .text(function(d) { return d[container.opts.dataStructure.name].substring(0, d.r / 4); });
        },
        placeOldPackNodes : function() {
            var container = this,
                // define the old nodes that don't exist and then fade them out  
                oldNodes = container.node.exit();

            oldNodes.select("circle")
                .transition()
                .duration(container.opts.speed)
                .style("fill-opacity", 1e-6)
                .style("stroke-opacity", 1e-6)
                .remove();

            oldNodes.select("title")
                .transition()
                .duration(container.opts.speed)
                .remove();

            oldNodes.select("text")
                .transition()
                .duration(container.opts.speed/3)
                .remove();

            oldNodes
                .transition().duration(container.opts.speed)
                .remove();
        },
        placeNewPackNodes : function() {
            var container = this,
                newNodes = container.node.enter()
                    .append("g")
                    .attr("transform", function(d) { return "translate(" + (d.x + (container.opts.width - container.opts.diameter)/2) + "," + (d.y + (container.opts.height - container.opts.diameter)/2) + ")"; })
                    .attr("class", function(d) {
                        if (d.children) {
                            return "group node";
                        }
                        else {
                            return "leaf node";
                        } 
                    });

            // only put zoom event on nodes that are parents
            newNodes.filter(function(d) { return d.children; })
                .on("click", function(d) { container.zoom(d); });

            newNodes.append("circle")
                .attr("r", 0)
                .transition()
                .duration(container.opts.speed)
                .attr("r", function(d) { return d.r; });

            newNodes.filter(function(d) { return !d.children; })
                .append("text")
                .style("text-anchor", "middle")
                .style("font-size", container.opts.fontSize + "px")
                .attr("dy", ".3em")
                .transition()
                .delay(container.opts.speed)
                .text(function(d) { return d[container.opts.dataStructure.name].substring(0, d.r / 4); });

            // ignore events on the nodes without children
            newNodes.filter(function(d) { return !d.children; })
                .style("pointer-events", "none");

            // only put zoom event on nodes that are parents
            // enable pointer events
            newNodes.filter(function(d) { return d.children; })
                .on("click", function(d) { container.zoom(d); })
                .style("pointer-events", null);     
        },
        zoom : function(d, i) {
            var container = this,
                scaleFactor = (this.opts.diameter) / d.r / 2,
                centerAdjustment = {
                    x : ((this.opts.width - this.opts.diameter)/2) / scaleFactor,
                    y : ((this.opts.height - this.opts.diameter)/2) / scaleFactor
                },
                chart = container.chart.selectAll("g"),
                text,
                leftPos = (d.x - d.r),
                topPos = -(d.y - d.r);

            chart.select("text").remove();                

            // if it's a 'pack' chart, then filter text nodes
            if (container.opts.chartType == 'bubble') {
                text = chart
                    .append("text")
                    .style("font-size", "0px")
                    .style("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .transition().delay(container.opts.speed).duration(100)
                    .text(function(d) { return d.className.substring(0, (d.r * scaleFactor) / 4); })
                    .style("font-size", container.opts.fontSize/scaleFactor + "px");
            }
            else if (container.opts.chartType == 'pack') {
                text = chart
                    .filter(function(d) { return !d.children; })
                    .append("text")
                    .style("font-size", "0px")
                    .style("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .transition().delay(container.opts.speed).duration(100)
                    .text(function(d) { return d[container.opts.dataStructure.name].substring(0, (d.r * scaleFactor) / 4); })
                    .style("font-size", container.opts.fontSize/scaleFactor + "px");
            }

            console.log(centerAdjustment);

            // transform each of the nodes
            chart
                .transition().duration(container.opts.speed)
                .attr("transform", function(d) { 
                    return "scale(" + scaleFactor + ") translate(" + (d.x - leftPos + centerAdjustment.x) + "," + (d.y + topPos + centerAdjustment.y) + ")";
                });

            // stops the propagation of the event
            d3.event.stopPropagation();
        },
        // resets the zoom on the chart
        resetChart : function() {
            var container = this,
                text,
                chart = container.chart.selectAll("g");

            chart
                .transition().duration(container.opts.speed)
                .attr("transform", function(d) { 
                return "scale(1) translate(" + d.x + "," + d.y + ")";
            });

            chart
                .select("text")
                .remove();

            // if it's a 'pack' chart, then filter text nodes
            if (container.opts.chartType == 'bubble') {
                text = chart
                    .append("text")
                    .style("font-size", "0px")
                    .style("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .transition().delay(container.opts.speed).duration(100)
                    .text(function(d) {
                        return d.className.substring(0, d.r / 4);
                    })
                    .style("font-size", container.opts.fontSize + "px")

            }
            else if (container.opts.chartType == 'pack') {
                text = chart
                    .filter(function(d) {
                        return !d.children;
                    })
                    .append("text")
                    .style("font-size", "0px")
                    .style("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .transition().delay(container.opts.speed).duration(100)
                    .text(function(d) {
                        return d[container.opts.dataStructure.name].substring(0, d.r / 4);
                    })
                    .style("font-size", container.opts.fontSize + "px")
            }

            // stops the propagation of the event
            if (d3.event) {
                d3.event.stopPropagation();
            }
        },
        // Returns a flattened hierarchy containing all leaf nodes under the root.
        parseData : function(data) {
           
            var dataList = [],
                children = this.opts.dataStructure.children,  // parent label for children
                container = this;
        
            // recursively loop through each child of the object
            function recurse(name, node) {
                if (node[children]) {
                    node[children].forEach(function(child) { recurse(node[container.opts.dataStructure.name], child); });
                }
                else {
                    dataList.push({packageName: name, className: node[container.opts.dataStructure.name], value: node.size});
                }
            };

            recurse(null, data);
            return {children: dataList};  
        },
        // updates the data set for the chart
        updateData : function(url, type) {
            var container = this;

            d3.json(url, function(error, data) {
                container.data = data;
                container.updateChart();
            });
        },
        // gets data from a JSON request
        getData : function() {
            var container = this;

            d3.json(this.opts.dataUrl, function(error, data) {
                container.data = data;
                // build the chart
                container.updateChart();
            });
        },
        // updates the settings of the chart
        settings : function(settings) {
            // I need to sort out whether I want to refresh the graph when the settings are changed
            this.opts = Extend(true, {}, this.opts, settings);
            // will make custom function to handle setting changes
            this.getData();
        },
        // kills the chart
        destroy : function() {
            this.el.removeAttribute(this.namespace);
            this.el.removeChild(this.el.children[0]);
            this.el[this.namespace] = null;
        }     
    };
    
    // the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
    // props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
    d3.pack = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "pack",
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
                el[pluginName] = new d3.Pack(options, el, callback);
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
