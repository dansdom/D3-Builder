// extend code
// https://github.com/dansdom/extend
var Extend = Extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=Extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Pie = function (options, element, callback)
    {
        // wrap the element in the jQuery object
        this.el = element;

        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "pie";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = Extend(true, {}, d3.Pie.settings, options);
        this.init();
        // run the callback function if it is defined
        if (typeof callback === "function")
        {
            callback.call();
        }
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Pie.settings = {
        'height' : 500,
        'width' : 500,
        'radius' : 200,
        'speed' : 1000,
        'padding': 2,
        'labelPosition' : 2.2, // this is the position of the segment labels. 0 = center of chart. 1 = center of segment. > 2 = outside the chart
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : 'flare.json',  // this is a url for a resource
        'dataType' : 'json',        
        'colorRange' : [], // instead of defining a color array, I will set a color scale and then let the user overwrite it
        'fontSize' : 12,
        // defines the data structure of the document
        'dataStructure' : {
            'name' : 'name',
            'value' : 'size',
            'children' : undefined
        },
        'chartName' : false  // If there is a chart name then insert the value. This allows for deep exploration to show category name
    };
    
    // plugin functions go here
    d3.Pie.prototype = {
        init : function() {

            var container = this;
            // define the size of the chart
            container.width = this.opts.width;
            container.height = this.opts.height;
            // set the scale for the chart - I may or may not actually use this scale
            container.scaleX = d3.scale.linear().range([0, container.width]);
            container.scaleY = d3.scale.linear().range([0, container.height]);
            // define the data format - not 100% sure what this does. will need to research this attribute
            //container.format = d3.format(",d");
            // if there is a colour range defined for this chart then use the settings. If not, use the inbuild category20 colour range
            if (this.opts.colorRange.length > 0) {
                container.color = d3.scale.ordinal().range(this.opts.colorRange);
            }
            else {
                container.color = d3.scale.category20();
            }

            // define the data for the graph
            if (typeof this.opts.dataUrl == "string") {
                // go get the data
                this.getData(this.opts.dataUrl, this.opts.dataType);
            }
            else {
                // just going to set data from the opts object
                //this.setData(this.opts.data);
            }

        },
        buildChart : function() {

            var container = this;

            // define the chart layout
            container.arc = d3.svg.arc()
                .startAngle(function(d) { return d.startAngle; })
                .endAngle(function(d) { return d.endAngle; })
                .outerRadius(container.opts.radius - container.opts.padding)
                .innerRadius(0); 

            // define the pie layout
            container.pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return d.value; });


            // add the chart element to the document
            container.chart = d3.select(container.el).append("svg")
                .attr("width", container.width)
                .attr("height", container.height)
                .append("g")
                .attr("transform", "translate(" + container.width / 2 + "," + container.height / 2 + ")");

            // if there is a chart name, then add it
            if (container.opts.chartName) {
                container.chartName = container.chart.append("g")
                    .attr("class", "chartName")
                    .append("text")
                    .text(function() {
                        var chartTitle;
                        if (container.dataCategory) {
                            chartTitle = container.dataCategory;
                        }
                        else {
                            chartTitle = container.opts.chartName;
                        }
                        return chartTitle;
                    });
            }

            // these are the pie segments
            container.values = container.chart.selectAll(".arc")
                .data(container.pie(container.filterData(container.data, container.dataCategory)))  // filter the data by category
                .enter().append("g")
                .attr("class", "arc")
                .on("mouseover", function(d) {
                    var center = container.arc.centroid(d);
                    var move = "translate(" + (center[0] * 0.2) + "," + (center[1] * 0.2) + ")";
                    d3.select(this).transition().duration(200).attr("transform", move);
                })
                .on("mouseout", function() {
                    d3.select(this).transition().duration(200).attr("transform", "translate(0,0)");
                })
                .on("click", function(d) {
                    // get the new data set
                    //console.log(d);
                    // check to see if there are children
                    if (d.data.hasChildren) {
                        container.dataCategory = d.data.category;
                        container.updateChart();
                    }
                });

            // these are the fills of the pie
            container.values.append("path")
                .transition()
                .duration(container.opts.speed)
                .attr("d", container.arc)
                .style("fill", function(d) {
                    return container.color(d.data.category);
                })
                .each(function(d) { 
                    this._current = d;   
                }); // store the initial values of the item

                
            // append the text labels - I could make this an option
            container.values.append("text")
                .attr("transform", function(d) { 
                    var center = container.arc.centroid(d);
                    return "translate(" + (center[0] * container.opts.labelPosition) + "," + (center[1] * container.opts.labelPosition) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function(d) { return d.data.category});
            
        },
        updateChart : function() {

            var container = this,
                speed = container.opts.speed,
                arcTween = function(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function(t) {
                        return container.arc(i(t));
                    };
                };

            // if there is a chart name, then add it
            if (container.opts.chartName) {
                container.chartName = container.chart.select(".chartName").select("text")
                    .text(function() {
                        var chartTitle;
                        if (container.dataCategory) {
                            chartTitle = container.dataCategory;
                        }
                        else {
                            chartTitle = container.opts.chartName;
                        }
                        return chartTitle;
                    });
            }

            container.values = container.chart.selectAll(".arc")
                .data(container.pie(container.filterData(container.data, container.dataCategory)))  // filter the data by category

            container.values.select("path")
                .transition()
                .duration(speed)
                .style("fill", function(d) {
                    //console.log(d);
                    return container.color(d.data.category);
                })
                .attrTween("d", arcTween)

            container.values.select("text")
                .attr("transform", function(d) { 
                    var center = container.arc.centroid(d);
                    return "translate(" + (center[0] * container.opts.labelPosition) + "," + (center[1] * container.opts.labelPosition) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function(d) { return d.data.category});

            // get rid of all the old segments - I might animate them out. i.e. animate to 0 deg
            var oldValues = container.values.exit();
            oldValues.select("path").remove();
            oldValues.select("text").remove();
            oldValues.remove();

            // add the new segments to the chart
            var newValues = container.values.enter()
                .append("g")
                .attr("class", "arc")
                .on("mouseover", function(d) {
                    var center = container.arc.centroid(d);
                    var move = "translate(" + (center[0] * 0.1) + "," + (center[1] * 0.1) + ")";
                    d3.select(this).transition().duration(200).attr("transform", move);
                })
                .on("mouseout", function() {
                    d3.select(this).transition().duration(200).attr("transform", "translate(0,0)");
                })
                .on("click", function(d) {
                    // get the new data set
                    //console.log(d);
                    // check to see if there are children
                    if (d.data.hasChildren) {
                        container.dataCategory = d.data.category;
                        container.updateChart();
                    }
                });
            
            newValues    
                .append("path")
                .style("fill-opacity", 1e-6)
                .transition()
                .delay(speed)
                .duration(speed)
                .attr("d", container.arc)
                .style("fill", function(d) {
                    return container.color(d.data.category);
                })
                .each(function(d) { 
                    if (d) {
                        this._current = d;
                    }
                    else {
                        this._current = 0;
                    }
                })
                .style("fill-opacity", 1);

            newValues.append("text")
                .transition()
                .delay(speed)
                .attr("transform", function(d) { 
                    var center = container.arc.centroid(d);
                    return "translate(" + (center[0] * container.opts.labelPosition) + "," + (center[1] * container.opts.labelPosition) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function(d) { return d.data.category});
        },
        filterData : function(data, category) {
            var chartData = data.filter(function(d) {
                if (d.className == category) {
                    return d;
                }
            });
            return chartData;
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
                dataLength = data.length,
                container = this,
                children = this.opts.dataStructure.children,
                total = 0,
                className,
                i;
        
            // recursively loop through each child of the object
            //console.log(data);
            function recurse(name, node) {
                if (node[children]) {
                    
                    node[children].forEach(function(child) { recurse(node[container.opts.dataStructure.name], child); });
                    // do some error handling here?
                    if (!node[container.opts.dataStructure.name]) {
                        className = undefined;
                    }
                    else {
                        className = node[container.opts.dataStructure.name];
                    }
                    dataList.push({category: className, className: name, value: total, hasChildren: true});
                }
                else {
                    // do some error handling here?
                    total += node.size;
                    if (!node[container.opts.dataStructure.name]) {
                        className = undefined;
                    }
                    else {
                        className = node[container.opts.dataStructure.name];
                    }
                    //console.log('doing push');
                    dataList.push({category: className, className: name, value: node.size, hasChildren: false});  
                }
            };
            
            // if there are children defined in the data, then do the recurse. If not, then loop through the array
            if (children) {
                // this object will hold the current category that is being displayed
                container.dataCategory = data[container.opts.dataStructure.name];
                recurse(null, data);
            }
            else {
                // set the container category to 'all'
                container.dataCategory = 'all';
                for (i = 0; i < dataLength; i++) {
                    dataList.push({category: data[i][container.opts.dataStructure.name], className: 'all', value: data[i][container.opts.dataStructure.value]});
                    total += data[i][container.opts.dataStructure.value];
                };
            }
            
            //console.log(dataList);
            //console.log(container.dataCategory);
            return dataList;   
        },
        // updates the data set for the chart
        updateData : function(url, type) {
            var container = this,
                data = container.data;

            d3.json(url, function(error, data) {
                // data object
                container.data = container.parseData(data);
                container.updateChart();
            });
        },
        // gets data from a JSON request
        getData : function(url, type) {
            var container = this;
            d3.json(url, function(error, data) {
                // data object
                container.data = container.parseData(data);
                container.buildChart();
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
        }     
    };
    
    // the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
    // props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
    d3.pie = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "pie",
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
                el[pluginName] = new d3.Pie(options, el, callback);
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
