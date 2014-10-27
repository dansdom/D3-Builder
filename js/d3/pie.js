// extend code
// https://github.com/dansdom/extend
//var extend = extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Pie = function (options, element, callback) {
        // wrap the element in the jQuery object
        this.el = element;
        this.callback = callback;
        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "pie";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = extend(true, {}, d3.Pie.settings, options);
        this.init();
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Pie.settings = {
        'height' : 500,
        'width' : 500,
        'innerRadius' : 20,
        'outerRadius' : 200,
        'speed' : 1000,
        'padding': 2,
        'labelPosition' : false, // this is the position of the segment labels. 0 = center of chart. 1 = center of segment. > 2 = outside the chart
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : 'flare.json',  // this is a url for a resource
        'dataType' : 'json',        
        'colorRange' : [], // instead of defining a color array, I will set a color scale and then let the user overwrite it
        'opacity' : 0.5,  // opacity of the segments
        'fontSize' : 12,
        // defines the data structure of the document
        'dataStructure' : {
            'name' : 'name',
            'value' : 'size',
            'children' : undefined
        },
        'legend' : { // shows a legend for the groups
            'visible' : true,  // set false for no legend
            'size' : 16,  // line height/ font-size and box size for each legend item
            'align' : 'right', // align 'left' or 'right' of the chart
            'offset' : {  // offset of the legend
                'x' : 0,
                'y' : 0
            }
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
        'chartName' : false  // If there is a chart name then insert the value. This allows for deep exploration to show category name
    };
    
    // plugin functions go here
    d3.Pie.prototype = {
        init : function() {
            var container = this;
            // set the scale for the chart - I may or may not actually use this scale
            container.scaleX = d3.scale.linear().range([0, this.opts.width]);
            container.scaleY = d3.scale.linear().range([0, this.opts.height]);
            // define the data format - not 100% sure what this does. will need to research this attribute
            //container.format = d3.format(",d");
            
            // go get the data
            this.getData();
        },
        updateChart : function() {
            var container = this,
                oldValues,
                newValues;

            // if there is a colour range defined for this chart then use the settings. If not, use the inbuild category20 colour range
            if (this.opts.colorRange.length > 0) {
                container.color = d3.scale.ordinal().range(this.opts.colorRange);
            } else {
                container.color = d3.scale.category20();
            }
                
            // set the layout of the chart
            this.setLayout();
            // set the chart title
            this.setTitle();
            // add the tooltip
            this.addTooltip();
            
            // ############ VALUES #############
            container.values = container.chart.selectAll(".arc")
                .data(container.pie(container.filterData(container.data, container.dataCategory)));  // filter the data by category
                
            // remove the old data
            oldValues = container.values.exit();
            oldValues.select("path").remove();
            oldValues.select("text").remove();
            oldValues.remove();

            // define the new values
            newValues = container.values
                .enter().append("g")
                .attr("class", "arc");
            // set the values of the chart    
            this.setValues(oldValues, newValues);
            
            // set the paths for the chart
            this.setPaths(oldValues, newValues);
            // set the labels for the chart
            this.setLabels(oldValues, newValues);

            // add tooltip events
            if (container.opts.tooltip.visible) {
                container.addTooltipEvents(newValues);
                container.addTooltipEvents(oldValues);
            }

            // make the legend
            this.setLegend();

            // run the callback function after the plugin has finished initialising
            if (typeof container.callback === "function") {
                container.callback.call(this, container);
            }
        },
        setLayout : function() {
            var container = this;

            // ###### LAYOUT ######
            // define the pie layout
            if (!container.pie) {
                container.pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.value; });
            }

            // ###### ARC #######
            if (!container.arc) {
                container.arc = d3.svg.arc()
                    .startAngle(function(d) { return d.startAngle; })
                    .endAngle(function(d) { return d.endAngle; });
            }
            container.arc
                .outerRadius(container.opts.outerRadius - container.opts.padding)
                .innerRadius(container.opts.innerRadius);

            // ######## SVG ########
            if (!container.svg) {
                // add the chart element to the document
                container.svg = d3.select(container.el).append("svg");
            }
            container.svg
                .attr("width", this.opts.width)
                .attr("height", this.opts.height);

            // ####### CHART #########
            if (!container.chart) {
                container.chart = container.svg.append("g");
            }
            container.chart
                .attr("transform", "translate(" + this.opts.width / 2 + "," + this.opts.height / 2 + ")");
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
                    .text(function() {
                        var chartTitle;
                        if (container.opts.dataStructure.children) {
                            chartTitle = container.dataCategory;
                        }
                        else {
                            chartTitle = container.opts.chartName;
                        }
                        return chartTitle;
                    });
            }
        },
        setLegend : function() {
            var container = this,
                newGroups,
                oldGroups,
                legendOpts = container.opts.legend,
                legendSize = parseFloat(legendOpts.size) || 20,
                legendX = parseFloat(legendOpts.offset.x) || 0,
                legendY = parseFloat(legendOpts.offset.y) || 0;

            function updateGroups(groups) {
                groups.each(function(d, i) {
                    var currentGroup = d3.select(this);
                    currentGroup.attr({
                            "class" : function(d) { return "legend-group " + d.category; },
                            "transform" : function() { return "translate(" + legendX + ", " + ((i * (legendSize + 2)) + legendY) + ")"; }
                        });

                    currentGroup.select("text")
                        .text(function(d) { return d.category; })
                        .attr({
                            "x" : function() { //container.width - 5
                                if (legendOpts.align === 'left') {
                                    return legendSize * 2 + 5;
                                } else {
                                    return container.opts.width - legendSize - 5;
                                }
                            }, 
                            "y" : legendOpts.size / 2,
                            "dy" : ".35em"
                        })
                        .style({
                            "text-anchor" : function() {
                                if (legendOpts.align === "left") {
                                    return "start";
                                } else {
                                    return "end";
                                }
                            },
                            "font-size" : legendOpts.size - 4  + "px"
                        });

                    currentGroup.select("rect")
                        .attr({
                            "fill" : function(d) { return container.color(i); },
                            "width" : legendOpts.size,
                            "height" : legendOpts.size,
                            "x" : function() { //container.width
                                if (legendOpts.align === 'left') {
                                    return legendSize;
                                } else {
                                    return container.opts.width - legendSize;
                                }
                            } 
                        });
                });
            }

            function addGroups(groups) {
                groups.each(function(d, i) {
                    var currentGroup = d3.select(this);
                    currentGroup
                        .attr({
                            "class" : function(d) { return "legend-group " + d.category; },
                            "transform" : function() { return "translate(" + legendX + ", " + ((i * (legendSize + 2)) + legendY) + ")"; }
                        });

                    currentGroup.append("text")
                        .text(function(d) { return d.category; })
                        .attr({
                            "x" : function() { //container.width - 5
                                if (legendOpts.align === 'left') {
                                    return legendSize * 2 + 5;
                                } else {
                                    return container.opts.width - legendSize - 5;
                                }
                            }, 
                            "y" : legendOpts.size / 2,
                            "dy" : ".35em"
                        })
                        .style({
                            "text-anchor" : function() {
                                if (legendOpts.align === "left") {
                                    return "start";
                                } else {
                                    return "end";
                                }
                            },
                            "font-size" : legendOpts.size - 4  + "px"
                        });

                    currentGroup.append("rect")
                        .attr({
                            "fill" : function(d) { return container.color(i); },
                            "width" : legendOpts.size,
                            "height" : legendOpts.size,
                            "x" : function() { //container.width
                                if (legendOpts.align === 'left') {
                                    return legendSize;
                                } else {
                                    return container.opts.width - legendSize;
                                }
                            }
                        });
                });
            }

            if (legendOpts.visible) {
                if (!container.legend) {
                    container.legend = container.chart.append("g")
                        .attr("class", "legend")
                        .attr("transform", "translate(" + (-container.opts.width/2) + ", " + (-container.opts.height/2) + ")");
                }
                // construct a legend for data group
                container.legendGroups = container.legend.selectAll(".legend-group")
                    .data(container.data);

                // update the current legend items
                updateGroups(container.legendGroups);

                // add the new legend items
                newGroups = container.legendGroups.enter()
                    .append("g")
                    .attr("class", function(d) { console.log(d); return "legend-group " + d.category; })
                addGroups(newGroups);

                // remove old legend items
                oldGroups = container.legendGroups.exit()
                    .remove();

            } else {
                container.chart.select(".legend").remove();
                container.legend = null;
            }
        },
        setValues : function(oldValues, newValues) {
            var container = this;

            // add event binding
            container.values
                // clear current events
                .on("mouseover.transition", null)
                .on("mouseout.transition", null)
                .on("click.transition", null)
                .on("mouseover.transition", function(d) {
                    var center = container.arc.centroid(d);
                    var move = "translate(" + (center[0] * 0.2) + "," + (center[1] * 0.2) + ")";
                    d3.select(this).transition().duration(200).attr("transform", move);
                })
                .on("mouseout.transition", function() {
                    d3.select(this).transition().duration(200).attr("transform", "translate(0,0)");
                })
                .on("click.transition", function(d) {
                    // get the new data set
                    //console.log(d);
                    // check to see if there are children
                    if (d.data.hasChildren) {
                        container.dataCategory = d.data.category;
                        container.updateChart();
                    }
                });
        },
        setPaths : function(oldValues, newValues) {
            var container = this,
                speed = container.opts.speed,
                arcTween = function(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function(t) {
                        return container.arc(i(t));
                    };
                };

            // ######## PATHS ###########
            // these are the fills of the pie
            container.values.select("path")
                .transition()
                .duration(speed)
                .attr("d", container.arc)
                .style({
                    "fill" : function(d) { return container.color(d.data.category); },
                    "fill-opacity" : container.opts.opacity
                })
                .attrTween("d", arcTween);

            // set the new values
            newValues    
                .append("path")
                .style("fill-opacity", 1e-6)
                .transition()
                .delay(speed)
                .duration(speed)
                .attr("d", container.arc)
                .style({
                    "fill" : function(d) { return container.color(d.data.category); },
                    "fill-opacity" : container.opts.opacity
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
        },
        setLabels : function(oldValues, newValues) {
            var container = this,
                labelPosition = this.opts.labelPosition;

            // if the label position is set then add the labels, if not then don't and remove any old ones
            if (labelPosition > 0) {

                newValues.append("text")
                    .transition()
                    .delay(container.opts.speed)
                    .attr("transform", function(d) { 
                        var center = container.arc.centroid(d);
                        return "translate(" + (center[0] * labelPosition) + "," + (center[1] * labelPosition) + ")";
                    })
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.data.category; });

                // is there a better way of coding this???
                container.values.each(function() {
                    //console.log(this);
                    var slice = d3.select(this),
                        label = slice.select("text")[0][0];

                    if (label) {
                        slice.select("text")
                            .attr("transform", function(d) { 
                                var center = container.arc.centroid(d);
                                return "translate(" + (center[0] * labelPosition) + "," + (center[1] * labelPosition) + ")";
                            })
                            .attr("dy", ".35em")
                            .style("text-anchor", "middle")
                            .text(function(d) { return d.data.category; });
                    } else {
                        slice.append("text")
                            .transition()
                            .delay(container.opts.speed)
                            .attr("transform", function(d) { 
                                var center = container.arc.centroid(d);
                                return "translate(" + (center[0] * labelPosition) + "," + (center[1] * labelPosition) + ")";
                            })
                            .attr("dy", ".35em")
                            .style("text-anchor", "middle")
                            .text(function(d) { return d.data.category; });
                    }
                });
            } else {
                //oldValues.select("text").remove();
                container.values.select("text").remove();
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
                        .text(d.data.category);

                    tooltip.select(".value").select("span")
                        .text(d.data.value);
                })
                .on("mouseout.tooltip", function(d, i) {
                    d3.select("#" + container.opts.tooltip.id).style("display", "none");
                });
        },
        filterData : function(data, category) {
            var chartData = data.filter(function(d) {
                if (d.className === category) {
                    return d;
                }
            });
            //console.log(chartData);
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
                    total += parseFloat(node[container.opts.dataStructure.value]);
                    if (!node[container.opts.dataStructure.name]) {
                        className = undefined;
                    }
                    else {
                        className = node[container.opts.dataStructure.name];
                    }
                    //console.log('doing push');
                    dataList.push({category: className, className: name, value: parseFloat(node[container.opts.dataStructure.value]), hasChildren: false});  
                }
            }
            
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
                }
            }
            
            //console.log(dataList);
            //console.log(container.dataCategory);
            return dataList;   
        },
        // updates the data set for the chart
        // I may just want to process the input and then call getData()
        updateData : function(url, type) {
            var container = this,
                data = container.data;

            d3.json(url, function(error, data) {
                // data object
                container.data = container.parseData(data);
                container.updateChart();
            });
        },
        getData : function() {
            var container = this;

            // need to test if the data is provided or I have to make a requset first
            if (container.opts.data) {
                container.data = container.parseData(container.opts.data);
                container.updateChart();
            }
            else {
                // gets data from a JSON request
                d3.json(container.opts.dataUrl, function(error, data) {
                    // data object
                    container.data = container.parseData(data);
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
    d3.pie = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "pie",
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
                el[pluginName] = new d3.Pie(options, el, callback);
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
