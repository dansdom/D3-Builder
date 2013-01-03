// extend code
// https://github.com/dansdom/extend
var Extend = Extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=Extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Force = function (options, element, callback)
    {
        // wrap the element in the jQuery object
        this.el = element;

        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "force";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = Extend(true, {}, d3.Force.settings, options);
        this.init();
        // run the callback function if it is defined
        if (typeof callback === "function")
        {
            callback.call();
        }
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Force.settings = {
        'height' : 500,
        'width' : 500,
        'padding': 2,
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : 'flare.json',  // this is a url for a resource
        'dataType' : 'json',
        // instead of defining a color array, I will set a color scale and then let the user overwrite it
        'colorRange' : [],
        'colors' : {            // colors for the nodes
            'parent' : 'white',
            'group' : 'blue',
            'child' : 'red'
        },
        'fontSize' : 12,
        // defines the data structure of the document
        'dataStructure' : {
            'name' : 'name',
            'children' : 'children',
            'value' : 'size'
        },
        'charge' : 100 , // the size of the force
        'linkDistance' : 100 // I may calculate this from the data and chart size
    };
    
    // plugin functions go here
    d3.Force.prototype = {
        init : function() {

            var container = this;
            
            // set the scale for the chart - I may or may not actually use this scale
            container.scaleX = d3.scale.linear().range([0, container.opts.width]);
            container.scaleY = d3.scale.linear().range([0, container.opts.height]);
            // define the data format - not 100% sure what this does. will need to research this attribute
            //container.format = d3.format(",d");
            this.getData();
        },
        updateChart : function() {

            var container = this,
                children = container.opts.dataStructure.children,
                value = container.opts.dataStructure.value,
                tree = d3.layout.tree().links(container.data),
                click = function(d) {

                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                        d[children] = null;
                    } else {
                        d.children = d._children;
                        d[children] = d._children;
                        d._children = null;
                    }
                    container.data = container.parseData(container.dataSet);
                    container.updateChart();
                },
                circleColor = function(d) {
                    var color;

                    if (d._children) {
                        color = container.opts.colors.group;
                    }
                    else if (d.children) {
                        color = container.opts.colors.parent;
                    }
                    else {
                        color = container.opts.colors.child;
                    }
                    return color;
                },
                circleSize = function(d) {
                    var radius,
                        dimensions = container.totalDataSize / (container.opts.height * container.opts.width);
                    // I would like to calculate this based on the total data size and the chart size
                    if (d.children) {
                        radius = 5;
                    }
                    else {
                        radius = Math.sqrt(d[value]) / Math.ceil(dimensions * 8); 
                    }
                    return radius;
                };

            // if there is a colour range defined for this chart then use the settings. If not, use the inbuild category20 colour range
            if (this.opts.colorRange.length > 0) {
                container.color = d3.scale.ordinal().range(this.opts.colorRange);
            }
            else {
                container.color = d3.scale.category20();
            }
                
            // define the chart layout
            this.setLayout();

            // re-set the force layout
            container.force
                .nodes(container.data)
                .links(tree)
                .linkDistance(function(d) {
                    var distance,
                        dimensions = container.totalDataSize / (container.opts.height * container.opts.width);

                    if (d.target._children) {
                        distance = container.opts.linkDistance / (dimensions * 30);
                    }
                    else {
                        distance = container.opts.linkDistance / (dimensions * 80);
                    }
                    return distance;
                })
                .start();

            // update the links
            container.links = container.chart.selectAll("line.link")
                .data(tree, function(d) { return d.target.id; });

            // enter any new lines
            container.links.enter().insert("svg:line", ".node")
                .attr("class", "link")
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
            
            // remove old links
            container.links.exit().remove();

            // update the nodes
            container.nodes = container.chart.selectAll("circle.node")
                .data(container.data, function(d) { return d.id; })
                .style("fill", circleColor);

            container.nodes.transition()
                .attr("r", circleSize);

            // enter new nodes
            container.nodes.enter().append("svg:circle")
                .attr("class", "node")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", circleSize)
                .style("fill", circleColor)
                .on("click", click)
                .call(container.force.drag);

            // exit old nodes
            container.nodes.exit().remove();

        },
        setLayout : function() {
            var container = this,
                tick = function() {
                    container.links
                        .attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });
                    
                    container.nodes.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                }; 

            // ####### LAYOUT #######
            if (!container.force) {
                container.force = d3.layout.force()
                    .size([container.opts.width, container.opts.height])
                    .charge(function(d) { 
                        var charge;
                        if (d._children) {
                            charge = -d.size / container.opts.charge;
                        }
                        else {
                            charge = -(container.opts.charge / 3);
                        }
                        return charge;
                    })
                    .on("tick", tick);
            }

            if (!container.tree) {
                container.tree = d3.layout.tree()
                    .children(function(d) { return d.children})
                    .value(function(d) { return d.size});
            }
                
            if (!container.chart) {
                // create the svg element that holds the chart
                container.chart = d3.select(container.el).append("svg")
                    .attr("width", container.opts.width)
                    .attr("height", container.opts.height);
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
            var nodes = [], 
                i = 0,
                children = this.opts.dataStructure.children,
                value = this.opts.dataStructure.value,
                container = this;

            //console.log(data);
            function recurse(node) {
                
                if (node[children]) {
                    // this is whack. The force layout only excepts the children attribute. dang :(
                    node.children = node[children];
                    node[value] = node.children.reduce(function(previous, current) { return previous + recurse(current); }, 0);
                }
                if (!node.id) {
                    node.id = ++i;
                }
                nodes.push(node);
                //console.log(node[value]);
                return node[value];
            };

            data[value] = recurse(data);
            //console.log(nodes);
            container.totalDataSize = nodes[nodes.length - 1][value];
            //console.log(container.totalDataSize);
            return nodes;
        },
        
        // updates the data set for the chart
        updateData : function(url, type) {
            var container = this,
                data = container.data;

            d3.json(url, function(error, data) {
                // build the chart
                data.fixed = true;
                data.x = container.opts.width / 2;
                data.y = container.opts.height / 2;

                container.dataSet = data;
                // data object
                container.data = container.parseData(data);
                container.updateChart();
            });
        },
        // gets data from a JSON request
        getData : function() {
            var container = this;
            d3.json(container.opts.dataUrl, function(error, data) {
                // build the chart
                data.fixed = true;
                data.x = container.opts.width / 2;
                data.y = container.opts.height / 2;

                container.dataSet = data;
                // data object
                container.data = container.parseData(data);
                container.updateChart();
            });
        },
        // updates the settings of the chart
        settings : function(settings) {
            // I need to sort out whether I want to refresh the graph when the settings are changed
            this.opts = Extend(true, {}, this.opts, settings);
            // will make custom function to handle setting changes
            this.applySettings();
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
    d3.force = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "force",
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
                el[pluginName] = new d3.Force(options, el, callback);
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
