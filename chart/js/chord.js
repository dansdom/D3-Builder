// extend code
// https://github.com/dansdom/extend
var Extend = Extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=Extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Chord = function (options, element, callback)
    {
        // wrap the element in the jQuery object
        this.el = element;

        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "chord";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = Extend(true, {}, d3.Chord.settings, options);
        this.init();
        // run the callback function if it is defined
        if (typeof callback === "function")
        {
            callback.call();
        }
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Chord.settings = {
        'height' : 500,
        'width' : 500,
        'radius' : 200,
        'speed' : 1000,
        'padding' : 10,
        'spacing': 5,  // effective setting in D3 is between 0.03 and 0.1. therefore this value will be divided by 100
        'labelPosition' : 3, // this may get replaced by the labelFrequency setting, or this replace it.
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
        'tickFrequency' : 0.3,  // this is a frquency multiplier - may not produce whole numbers
        'labelFrequency' : 5,
        'decimalPlaces' : 2,
        'chartName' : false  // If there is a chart name then insert the value. This allows for deep exploration to show category name
    };
    
    // plugin functions go here
    d3.Chord.prototype = {
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
            }
            else {
                container.color = d3.scale.category20();
            }
                
            // set the layout of the chart
            this.setLayout();
            // set the chart title
            this.setTitle();
            
            // set the arcs of the chart    
            this.setArcs();
            
            // set the paths for the chart
            this.setChords();

            // set the ticks for the chart
            this.setTicks();

            // add the labels on the chart
            this.addLabels();
            
        },
        setLayout : function() {
            var container = this;

            // set the chart radii
            container.innerRadius = Math.min(container.opts.width - container.opts.padding, container.opts.height - container.opts.padding) * .40;
            container.outerRadius = container.innerRadius * 1.1;
            // define the arc and chord for the transitions
            container.svgArc = d3.svg.arc().innerRadius(container.innerRadius).outerRadius(container.outerRadius);
            container.svgChord = d3.svg.chord().radius(container.innerRadius);

            // ###### LAYOUT ######
            // define the chord layout
            if (!container.chord) {
                container.chord = d3.layout.chord();
            }
            // store the old values of the chart
            else {
                container.oldValues = {
                    groups : container.chord.groups(),
                    chords : container.chord.chords()
                };
            }
            container.chord
                .padding(container.opts.spacing/100)  // divide by 100 so it fits in the D3-Builder interface
                .sortSubgroups(d3.descending)
                .matrix(container.data);

            // ######## SVG ########
            if (!container.svg) {
                // add the chart element to the document
                container.svg = d3.select(container.el).append("svg")
            }
            container.svg
                .attr("width", container.opts.width)
                .attr("height", container.opts.height);

            // ####### CHART #########
            if (!container.chart) {
                container.chart = container.svg.append("g")
            }
            container.chart
                .attr("transform", "translate(" + (container.opts.width / 2) + "," + (container.opts.height / 2) + ")");
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
        setArcs : function() {
            var container = this,
                fade = function(opacity) {
                    // Returns an event handler for fading a given chord group.
                    return function(g, i) {
                        container.chart.selectAll(".chords path")
                            .filter(function(d) { return d.source.index != i && d.target.index != i; })
                            .transition()
                            .style("opacity", opacity);
                    };
                },
                // Interpolate the arcs
                arcTween = function(arc_svg, old) {
                    return function(d,i) {
                        // if there is no data stored in the old group then set it to the same as the new value
                        if (!old.groups[i]) {
                            old.groups[i] = d;
                        }
                        i = d3.interpolate(old.groups[i], d);
                        return function(t) {
                            return arc_svg(i(t));
                        }
                    }
                };

            if (!container.arcs) {
                container.arcs = container.chart.append("g")
                    .attr("class", "arcs");
            }
            
            container.arcGroups = container.arcs.selectAll(".group")
                .data(container.chord.groups);

            // add the new groups
            container.arcGroups.enter()
                .append("g")
                .attr("class", "group")
                .on("mouseover", fade(.1))
                .on("mouseout", fade(1))
                .append("path");

            // fade out the old arcs
            container.arcGroups.exit()
                .transition()
                .duration(container.opts.speed)
                .style("fill-opacity", 1e-6)
                .style("stroke-opacity", 1e-6)
                .remove();
            
            // define the arc paths
            container.arcPaths = container.arcGroups.select("path");
            // if there are old values then animate from them
            if (container.oldValues) {
                container.arcPaths
                    .attr("id", function(d, i) { return "group" + i; })
                    .transition()
                    .duration(container.opts.speed)
                    .style("fill", function(d) { return container.color(d.index); })
                    .style("stroke", function(d) { return container.color(d.index); })
                    .attrTween("d", arcTween(container.svgArc, container.oldValues));   
            }
            else {
                container.arcPaths
                    .attr("id", function(d, i) { return "group" + i; })
                    .transition()
                    .duration(container.opts.speed)
                    .style("fill", function(d) { return container.color(d.index); })
                    .style("stroke", function(d) { return container.color(d.index); })
                    .attr("d", container.svgArc);
            }
                
        },
        setChords : function() {
            var container = this,
                chordTween = function(chord_svg, old) {
                    return function(d,i) {
                        // if there is no old data then set it to the current value
                        if (!old.chords[i]) {
                            old.chords[i] = d;
                        }
                        i = d3.interpolate(old.chords[i], d);
                        return function(t) {
                            return chord_svg(i(t));
                        }
                    }
                };

            if (!container.chords) {
                container.chords = container.chart.append("g")
                    .attr("class", "chords");
            }

            container.chordPaths = container.chords.selectAll("path")
                .data(container.chord.chords);

            container.chordPaths
                .enter().append("path");

            if (container.oldValues) {
                container.chordPaths
                    .transition()
                    .duration(container.opts.speed)
                    .attrTween("d", chordTween(container.svgChord, container.oldValues))
                    .style("fill", function(d) { return container.color(d.target.index); })
                    .style("opacity", 1);
            }
            else {
                container.chordPaths
                    .transition()
                    .duration(container.opts.speed)
                    .attr("d", container.svgChord)
                    .style("fill", function(d) { return container.color(d.target.index); })
                    .style("opacity", 1);
            }

            container.chordPaths.exit()
                .transition()
                .duration(container.opts.speed)
                .style("fill-opacity", 1e-6)
                .style("stroke-opacity", 1e-6)
                .remove();
                
        },
        setTicks : function() {
            var container = this,
                // Returns an array of tick angles and labels, given a group.
                // Note: this function is a bit of a mess atm. Will need to refactor
                groupTicks = function(d) {
                    var k = (d.endAngle - d.startAngle) / d.value;
                    //console.log("value: " + d.value);
                    // get angle, then divide by total angle. this gives me the percetage
                    var anglePercentage = (d.endAngle - d.startAngle) / (Math.PI * 2) * 100;
                    //console.log(anglePercentage);
                    // value per degree of the circle
                    var valueDeg = d.value / anglePercentage;
                    //console.log("valueDeg: " + valueDeg);
                    // number of digits in that value
                    var valueDegUnit = parseInt(valueDeg).toString().length;
                    //console.log("value per degree: " + valueDegUnit);
                    // 10 to the power of that value minus 1
                    var steps = Math.pow(10, valueDegUnit - 1);
                    //console.log("steps: " + steps);
                    return d3.range(0, d.value, steps/container.opts.tickFrequency).map(function(v, i) {
                        //console.log("v: "+v+", i:"+i);
                        return {
                            angle: v * k + d.startAngle,
                            label: (function() {
                                //i % container.opts.tickFrequency ? null : v / 1000 + "k"
                                var label;
                                if (i % container.opts.labelFrequency) {
                                    label = null;
                                }
                                else {
                                    //label = (v).toFixed(container.opts.decimalPlaces) + stepUnit;
                                    label = container.getStepLabel(v, steps);
                                }
                                return label;
                            })()
                        };
                    });
                };

            if (!container.ticks) {
                container.ticks = container.chart.append("g")
                    .attr("class", "ticks");
            }

            // remove all the ticks
            container.ticks.selectAll("g").remove();

            // define the tick groups
            container.tickGroups = container.ticks.selectAll("g")
                .data(container.chord.groups);
            // add new tick groups
            container.tickGroups.enter().append("g")
                .attr("class", "tickGroup");
            
            // define the units within each group
            container.tickUnits = container.tickGroups.selectAll("g")
                .data(groupTicks);
                
            container.tickUnits.enter().append("g")
                .attr("class", "tickUnit")
                .attr("transform", function(d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + " translate(" + container.outerRadius +", 0)";
                });

            container.tickUnits.append("line")
                .transition()
                .duration(container.opts.speed)
                .attr("x1", 1)
                .attr("y1", 0)
                .attr("x2", 5)
                .attr("y2", 0);

            container.tickUnits.append("text")
                .style("opacity", 1e-6)
                .attr("x", 8)
                .attr("dy", ".35em")
                .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
                .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                .text(function(d) { return d.label; })
                .transition()
                .duration(container.opts.speed)
                .style("opacity", 1);
                

        },
        addLabels : function() {
            var container = this;

            // remove all the labels and then start again
            container.arcGroups.selectAll(".label").remove();
            //  container.chordPaths
            container.labels = container.arcGroups.append("svg:text")
                    .attr("class", "label")
                    .attr("x", 6)
                    .attr("dy", 17);
                
            // add the text paths - atm I'm just adding the value of the group, but with better data integration I will probably use the category name
            container.labels
                .append("svg:textPath")
                // this xlink:href maps the path element onto a target glyph with the matching id
                .attr("xlink:href", function(d, i) { return "#group" + i; })
                .text(function(d) { return d.value.toFixed(container.opts.decimalPlaces)} )
                .attr("startOffset", 5);

        },
        getStepLabel : function(value, step) {
            var container = this,
                labelLength = parseInt(value).toString().length,
                divider = 1,
                stepUnit = "";

            // I need to work how how many values I will test for
            if (labelLength > 3 && labelLength < 7) {
                stepUnit = "k";
                divider = 1000;
            }
            else if (labelLength > 6 && labelLength < 10) {
                stepUnit = "m";
                divider = 1000000;
            }
            else if (labelLength > 9 && labelLength < 13) {
                stepUnit = "b";
                divider = 1000000000;
            }
            //console.log("unit: " + stepUnit);
            var endResult = (value / divider).toFixed(container.opts.decimalPlaces) + " " + stepUnit;
            //console.log("end value: " + endResult);
            //console.groupEnd();
            
            return endResult;
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
        // I may just want to process the input and then call getData()
        updateData : function(url, type) {
            var container = this,
                data = container.data;

            d3.json(url, function(error, data) {
                // data object
                //container.data = container.parseData(data);
                container.data = data;
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
            }
            else {
                d3.json(container.opts.dataUrl, function(error, data) {
                    // data object
                    //container.data = container.parseData(data);
                    container.data = data;
                    container.updateChart();
                });
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
        // kills the chart
        destroy : function() {
            this.el.removeAttribute(this.namespace);
            this.el.removeChild(this.el.children[0]);
            this.el[this.namespace] = null;
        }     
    };
    
    // the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
    // props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
    d3.chord = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "chord",
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
                el[pluginName] = new d3.Chord(options, el, callback);
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
