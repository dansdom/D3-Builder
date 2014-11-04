// extend code
// https://github.com/dansdom/extend
var extend = extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 Bar Graph template
(function (d3, undefined) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.Bar = function (options, element, callback) {
        this.el = element;
        this.callback = callback;
        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "bar";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = extend(true, {}, d3.Bar.settings, options);
        this.init();
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.Bar.settings = {
        'height': '730',
        'width': '460',
        'speed' : 1000,  // transition speed
        'margin': {top: 30, right: 10, bottom: 80, left: 80},
        'data' : null,  // I'll need to figure out how I want to present data options to the user
        'dataUrl' : null,  // this is a url for a resource
        'dataType' : 'json',
        'dateFormat' : '%d-%b-%y',  // if a date scale is being used then this is the option to format it
        'colorRange' : ["#3182bd","#6baed6","#9ecae1","#c6dbef","#e6550d","#fd8d3c","#fdae6b","#fdd0a2","#31a354","#74c476","#a1d99b","#c7e9c0","#756bb1","#9e9ac8","#bcbddc","#dadaeb","#636363","#969696","#bdbdbd","#d9d9d9"], // instead of defining a color array, I will set a color scale and then let the user overwrite it
        // maybe only if there is one data set???
        'elements' : {
            'layoutType' : 'stacked',  // 'stacked' or 'grouped'
            'barOpacity' : 1,
            'barWidth' : 20,  // only set when linear scale. If ordinal then it will be calculated automatically
            'xAxis' : {
                'visible' : true,
                'tickSize' : 5,
                'label' : true,
                'labelOffsetX' : 0,
                'labelOffsetY' : 40,
                'labelRotate' : 0,
                'rangeMin' : null, // can set a value for the minimum range on the x-axis
                'rangeMax' : null,  // can set a value for the maximum range on the x-axis
                'domainMin' : null, // will accept 'data-min'. can maually set the minimum value of the chart's domain
                'domainMax' : null,  // can maually set the maximum value of the chart's domain
                'domainCustom' : null // can specify a custom domain for the X axis
            },
            'yAxis' : {
                'visible' : true,
                'tickSize' : 5,
                'label' : true,
                'labelOffsetX' : -40,
                'labelOffsetY' : 0,
                'labelRotate' : -90,
                'rangeMin' : null, // can set a value for the minimum range on the x-axis
                'rangeMax' : null,  // can set a value for the maximum range on the x-axis
                'domainMin' : null, // will accept 'data-min'. can maually set the minimum value of the chart's domain
                'domainMax' : null,  // can maually set the maximum value of the chart's domain
                'domainCustom' : null // can specify a custom domain for the Y axis
            }
        },
        'dataStructure' : {
            'x' : 'name',  // this value may end up being an array so I can support multiple data sets. These define the axis' for ordinal scale
            'y' : 'value',
            'key' : 'key',
            'ticksX' : 10,  // tha amount of ticks on the x-axis
            'ticksY' : 5  // the amount of ticks on the y-axis
        },
        'scale' : {
            'x' : 'linear',  // add ordinal support
            'y' : 'linear'
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
    d3.Bar.prototype = {
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
            } else {
                container.color = d3.scale.category20();
            }

            container.margin = this.opts.margin;
            container.width = this.opts.width - container.margin.left - container.margin.right;
            container.height = this.opts.height - container.margin.top - container.margin.bottom; 

            // define the scale and axis' for the graph
            this.setScale();
            this.setAxis();

            // create the svg element that holds the chart
            this.setLayout();
            // set the title
            this.setTitle();
            // add the elements to the chart
            this.addElements();
            // add the x and y axis to the chart
            this.addAxis();

            // make the legend
            this.setLegend();
            // add the tooltip
            this.addTooltip();

            // run the callback function after the plugin has finished initialising
            if (typeof container.callback === "function") {
                container.callback.call(this, container);
            }
        },
        setLayout : function() {
            var container = this;

            // define the svg element
            if (!container.svg) {
                container.svg = d3.select(container.el).append("svg");     
            }
            container.svg
                .datum(container.data)
                .attr({
                    "width" : container.width + container.margin.left + container.margin.right,
                    "height" : container.height + container.margin.top + container.margin.bottom
                });

            // define the chart element
            if (!container.chart) {
                container.chart = container.svg.append("g");
                    
            }
            container.chart
                .attr({
                    "class" : "chart",
                    "transform" : "translate(" + container.margin.left + "," + container.margin.top + ")"
                });
        },
        setTitle : function() {
            var container = this;

            if (container.opts.chartName) {
                if (!container.chartName) {
                    container.chartName = container.chart.append("g")
                        .attr("class", "chartName")
                        .append("text");
                        //console.log('adding chart name');
                }
                container.chartName = container.chart.select(".chartName").select("text")
                    .text(container.opts.chartName);
            }
        },
        setLegend : function() {
            var container = this,
                newGroups,
                oldGroups,
                legendOpts = container.opts.legend,
                legendSize = parseFloat(legendOpts.size) || 20,
                legendX = parseFloat(legendOpts.offset.x) || 0,
                legendY = parseFloat(legendOpts.offset.y) || 0,
                legendHeight = (container.dataNest.length-1) * (legendSize + 2);

            function updateGroups(groups) {
                groups.each(function(d, i) {
                    var currentGroup = d3.select(this);
                    
                    currentGroup.attr({
                            "class" : function(d) { return "legend-group " + d.key; },
                            "transform" : function() { 
                                var groupPosition;
                                if (container.opts.elements.layoutType === 'stacked') {
                                    groupPosition = "translate(" + legendX + ", " + (legendHeight - (i * (legendSize + 2)) + legendY) + ")"; 
                                } else {
                                    groupPosition = "translate(" + legendX + ", " + ((i * (legendSize + 2)) + legendY) + ")"; 
                                }
                                return groupPosition;
                            }
                        });

                    currentGroup.select("text")
                        .text(function(d) { return d.key; })
                        .attr({
                            "x" : function() { //container.width - 5
                                if (legendOpts.align === 'left') {
                                    return legendSize + 5;
                                } else {
                                    return container.width - 5;
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
                                    return 0;
                                } else {
                                    return container.width;
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
                            "class" : function(d) { return "legend-group " + d.key; },
                            "transform" : function() { 
                                var groupPosition;
                                if (container.opts.elements.layoutType === 'stacked') {
                                    groupPosition = "translate(" + legendX + ", " + (legendHeight - (i * (legendSize + 2)) + legendY) + ")"; 
                                } else {
                                    groupPosition = "translate(" + legendX + ", " + ((i * (legendSize + 2)) + legendY) + ")"; 
                                }
                                return groupPosition;
                            }
                        });

                    currentGroup.append("text")
                        .text(function(d) { return d.key; })
                        .attr({
                            "x" : function() { //container.width - 5
                                if (legendOpts.align === 'left') {
                                    return legendSize + 5;
                                } else {
                                    return container.width - 5;
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
                                    return 0;
                                } else {
                                    return container.width;
                                }
                            }
                        });
                });
            }

            if (legendOpts.visible) {
                if (!container.legend) {
                    container.legend = container.chart.append("g")
                        .attr("class", "legend");
                }
                // construct a legend for data group
                container.legendGroups = container.legend.selectAll(".legend-group")
                    .data(container.dataNest);

                // update the current legend items
                updateGroups(container.legendGroups);

                // add the new legend items
                newGroups = container.legendGroups.enter()
                    .append("g")
                    .attr("class", function(d) { return "legend-group " + d.key; })
                addGroups(newGroups);

                // remove old legend items
                oldGroups = container.legendGroups.exit()
                    .remove();

            } else {
                container.chart.select(".legend").remove();
                container.legend = null;
            }
        },
        addAxis : function() {
            var container = this,
                elementOpts = container.opts.elements;

            // if we are building an x-axis
            if (elementOpts.xAxis.visible) {
                // look to see if it is already defined
                if (!container.X) {
                    container.X = container.chart.append("g");   
                }
                // style the x-axis
                container.X
                    .attr({
                        "class" : "x-axis",
                        "transform" : "translate(0," + container.height + ")"
                    })
                    .style("shape-rendering", "crispEdges")
                    .call(container.xAxis);
                // add the labels
                container.addXLabels();
            }
            // else if the x-axis exists then remove it
            else if (container.X) {
                container.X.remove();
                // I have to set this to undefined so that I can test for it again
                container.X = undefined;
                container.XLabel = undefined;
            }

            // if we are building a y-axis
            if (elementOpts.yAxis.visible) {
                // look to see if it is already defined
                if (!container.Y) {
                    container.Y = container.chart.append("g");
                }
                container.Y
                    .attr("class", "y-axis")
                    .style("shape-rendering", "crispEdges")
                    .call(container.yAxis);
                // add the labels
                container.addYLabels();
            }
            // else if the -axis exists then remove it
            else if (container.Y) {
                container.Y.remove();
                container.Y = undefined;
                container.YLabel = undefined;
            }
        },
        addXLabels : function() {
            var container = this,
                xOpts = container.opts.elements.xAxis;

            if (xOpts.label) {
                if (!container.XLabel) {
                    container.XLabel = container.X.append("text");
                }
                // add the settings to the label
                container.XLabel
                    .attr({
                        "dx" : function() {
                            var chartLength = container.width,
                                labelPosition = (chartLength/2) + xOpts.labelOffsetX;
                            return labelPosition;
                        },
                        "dy" : xOpts.labelOffsetY,
                        "transform" : "rotate(" + xOpts.labelRotate + ")"
                    })
                    .style("shape-rendering", "crispEdges")
                    .text(container.opts.dataStructure.x);
            }
            // else remove the label
            else {
                if (container.XLabel) {
                    container.XLabel.remove();
                    container.XLabel = undefined;
                }
            }
        },
        addYLabels : function() {
            var container = this,
                yOpts = container.opts.elements.yAxis;

            if (yOpts.label) {
                if (!container.YLabel) {
                    container.YLabel = container.Y.append("text");
                }
                container.YLabel
                    .attr({
                        "dy" : yOpts.labelOffsetX,
                        // note, this is tricky because of the rotation it is actually the "dx" value that gives the vertical positon and not the "dy" value
                        "dx" : function() {
                            var chartHeight = container.height,
                                labelPosition = (chartHeight/2) + yOpts.labelOffsetY;
                            return -labelPosition;
                        },
                        "transform" : "rotate(" + yOpts.labelRotate + ")"
                    })
                    .style("shape-rendering", "crispEdges")
                    .text(container.opts.dataStructure.y);
            }
            // else remove the label
            else {
                if (container.YLabel) {
                    container.YLabel.remove();
                    container.YLabel = undefined;
                }
            }
        },
        addElements : function() {
            var container = this,
                elements = container.opts.elements,
                dataStructure = container.opts.dataStructure,
                currentGroups,
                newGroups,
                oldGroups;

            currentGroups = container.chart.selectAll(".data-group");
            container.groups = container.chart.selectAll(".data-group")
                .data(container.dataGroups);

            //console.log(container.dataGroups);

            // add the new data
            newGroups = container.groups.enter()
                .append("g")
                .attr("class", function(d) { return "data-group"; });

            // if groups then update the groups, if not then make stacks
            if (container.opts.elements.layoutType === 'grouped') {
                if (container.opts.scale.x !== 'ordinal') {
                    alert('grouped data must be on an ordinal scale. Set scale.x = "ordinal"');
                    return;
                } 
                container.updateGroupedData(container.groups);
                container.updateGroupedData(newGroups);
            } else {
                container.updateStackedData(container.groups);
                container.updateStackedData(newGroups);
            }
            

            // remove the old data
            oldGroups = container.groups.exit()
                .remove(); 
        },
        // updates the current groups on the chart
        updateGroupedData : function(groups) {
            var container = this,
                currentGroup;

            //console.log('updating ' + groups.length + ' current groups');
            groups.each(function(d, i) {
                //console.log(i);
                //console.log(d);
                //currentGroup.attr("class", function(d) { return "data-group"; });
                container.updateGroup(this, d, i);
            });
        },
        updateStackedData : function(groups) {
            var container = this,
                currentGroup;

            //console.log('updating ' + groups.length + ' current groups');
            groups.each(function(d,i ) {
                //console.log(i);
                //console.log(d);
                //currentGroup.attr("class", function(d) { return "data-group"; });
                container.updateStack(this, d, i);
            });
        },
        updateGroup : function(group, d, i) {
            //console.log('updating group');
            //console.log(group);
            //console.log(d);
            //console.log(i);

            var container = this,
                currentGroup = d3.select(group),
                groupBars = currentGroup.selectAll("rect").data(d.values),
                groupItems = d.values.map(function(d) { return d[container.opts.dataStructure.key]; }),
                groupScale = d3.scale.ordinal();
            
            groupScale.domain(groupItems).rangeRoundBands([0, container.xScale.rangeBand()]);
            //console.log(groupScale.rangeBand());
            //console.log(container.xScale(d.key));
            currentGroup.attr("transform", function(d) { return "translate(" + container.xScale(d.key) + ",0)" });

            groupBars
                .attr({
                    "width" : groupScale.rangeBand(),
                    "x" : function(d, i) { return groupScale(d[container.opts.dataStructure.key]); },
                    "y" : function(d) { return container.yScale(d[container.opts.dataStructure.y]); },
                    "height" : function(d) { return container.height - container.yScale(d[container.opts.dataStructure.y]); }
                })
                .style("fill", function(d, i) { return container.color(i); });

            groupBars.enter()
                .append("rect")
                .attr({
                    "width" : groupScale.rangeBand(),
                    "x" : function(d, i) { return groupScale(d[container.opts.dataStructure.key]); },
                    "y" : function(d) { return container.yScale(d[container.opts.dataStructure.y]); },
                    "height" : function(d) { return container.height - container.yScale(d[container.opts.dataStructure.y]); }
                })
                .style("fill", function(d, i) { return container.color(i); });

            groupBars.exit().remove();

            // add tooltip event
            if (container.opts.tooltip.visible) {
                container.addTooltipEvents(groupBars);
            }
        },
        updateStack : function(group, d, i) {
            var container = this,
                currentGroup = d3.select(group),
                groupBars = currentGroup.selectAll("rect").data(d.values),
                barWidth = container.opts.elements.barWidth;

            if (container.opts.scale.x === 'ordinal') {
                barWidth = container.xScale.rangeBand();
            }

            currentGroup.attr("transform", function(d) { return "translate(" + container.xScale(d.key) + ",0)" });

            groupBars
                .attr({
                    "width" : barWidth,
                    "x" : 0,
                    "y" : function(d) { return container.yScale(d.y1); },
                    "height" : function(d) { return container.yScale(d.y0) - container.yScale(d.y1); },
                })
                .style("fill", function(d, i) { return container.color(i); });

            groupBars.enter()
                .append("rect")
                .attr({
                    "width" : barWidth,
                    "x" : 0,
                    "y" : function(d) { return container.yScale(d.y1); },
                    "height" : function(d) { return container.yScale(d.y0) - container.yScale(d.y1); },
                })
                .style("fill", function(d, i) { return container.color(i); });

            groupBars.exit().remove();

            // add tooltip events
            if (container.opts.tooltip.visible) {
                container.addTooltipEvents(groupBars);
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
                        .text(d[container.opts.dataStructure.key]);

                    tooltip.select(".value").select("span")
                        .text(d[container.opts.dataStructure.y]);
                })
                .on("mouseout.tooltip", function(d, i) {
                    d3.select("#" + container.opts.tooltip.id).style("display", "none");
                });
        },
        isScaleNumeric : function(scale) {
            // find out whether the scale is numeric or not
            switch(scale) {
                case "linear" :
                    return true;
                case "pow" :
                    return true;
                case "log" :
                    return true;
                case "quanitze" :
                    return true;
                case "identity" :
                    return true;
                default : 
                    return false;
            }
        },
        parseData : function(data) {
            // if the scale is ordinal, I have to put in an opening value so that I can push the data across the chart
            // the first thing I have to do here is make sure the "value" field is numeric.
            var container = this,
                scaleX = container.opts.scale.x,
                scaleY = container.opts.scale.y,
                dataLength = data.length,
                i, j;

            if (container.isScaleNumeric(scaleX)) {
                for (i = 0; i < dataLength; i++) {
                    // parse the x scale
                    data[i][container.opts.dataStructure.x] = parseFloat(data[i][container.opts.dataStructure.x]);
                }
            }

            if (container.isScaleNumeric(scaleY)) {
                for (j = 0; j < dataLength; j++) {
                    // parse the y scale
                    data[j][container.opts.dataStructure.y] = parseFloat(data[j][container.opts.dataStructure.y]);
                }
            }

            // if there is a date range then parse the data as a date
            if (container.opts.scale.x === "date") {
                for (i = 0; i < dataLength; i++) {
                    data[i][container.opts.dataStructure.x] = d3.time.format(container.opts.dateFormat).parse(data[i][container.opts.dataStructure.x]);
                }
            }
            if (container.opts.scale.y === "date") {
                for (j = 0; j < dataLength; j++) {
                    data[j][container.opts.dataStructure.y] = d3.time.format(container.opts.dateFormat).parse(data[j][container.opts.dataStructure.y]);
                }
            }
            
            // define the nested data structure
            if (!container.nest) {
                container.nest = d3.nest()
                    .key(function(d) { return d[container.opts.dataStructure.key]; });
            }

            var nestedData = container.nest.entries(data);
            
            // if the key is undefined then set it to 'none'
            if (nestedData.length === 1) {
                if (nestedData[0].key === 'undefined') {
                    nestedData[0].key = 'none';
                    for (i = 0; i < nestedData[0].values.length; i++) {
                        nestedData[0].values[i][container.opts.dataStructure.key] = 'none';
                    }
                }
            }

            // unlike the area and scatterplaot chart, the daata needs to be stacked by the X axis data points, not the data groups
            function stackData(data) {
                var dataStack = [],
                    xGroup,
                    group,
                    value,
                    groupLabel,
                    groupTotal,
                    i, j, k;

                for (i in data[0].values) {
                    xGroup = [];
                    groupTotal = 0;
                    groupLabel = data[0].values[i][container.opts.dataStructure.x];
                    
                    for (j in data) {
                        for (k in data[j].values) {
                            if (data[j].values[k][container.opts.dataStructure.x] === groupLabel) {
                                value = data[j].values[k];
                                value['y0'] = groupTotal;
                                groupTotal = groupTotal + value[container.opts.dataStructure.y];
                                value['y1'] = groupTotal;
                                xGroup.push(value);
                            }
                        }
                        //console.log('Group Total: ' + groupTotal);
                    }
                    group = {
                        key : groupLabel,
                        values : xGroup,
                        total : groupTotal
                    };
                    dataStack.push(group);
                    //console.groupEnd();
                }
                //console.log(dataStack);
                return dataStack;
            }

            // find any missing data and add a zero value for it
            //console.log(nestedData);
            container.dataNest = container.checkMissingValues(nestedData);
            //console.log(container.dataNest);
            container.dataGroups = stackData(container.dataNest);

            return data;
        },
        // check for any missing values in the data set
        checkMissingValues : function(data) {
            var container = this,
                layer,
                layerValue,
                layerX,
                i, j;

            function checkGroups(pointX) {
                var layer,
                    i, j,
                    hasPointX,
                    emptyDataPoint;
               
                for (i = 0; i < data.length; i++) {
                    layer = data[i];
                    //console.log(layer);
                    hasPointX = false;
                    for (j = 0; j < layer.values.length; j++) {
                        //console.log(layer.values[j]);
                        //console.log('point x: ' + pointX);
                        if (layer.values[j][container.opts.dataStructure.x] === pointX) {
                            hasPointX = true;
                        }
                    }
                    if (!hasPointX) {
                        emptyDataPoint = {};
                        emptyDataPoint[container.opts.dataStructure.x] = pointX;
                        emptyDataPoint[container.opts.dataStructure.y] = 0;
                        emptyDataPoint[container.opts.dataStructure.key] = data[i].key;
                        data[i].values.push(emptyDataPoint);
                    }
                }
            }

            for (i = 0; i < data.length; i++) {
                layer = data[i];
                for (j = 0; j < layer.values.length; j++) {
                    layerValue = layer.values[j];
                    //console.log(layerValue);
                    layerX = layerValue[container.opts.dataStructure.x];
                    // check each data group for this x value
                    checkGroups(layerX);
                }
            }

            function sortArrayValues(index) {
                data[index].values.sort(function(a, b) { return d3.ascending(a[container.opts.dataStructure.x], b[container.opts.dataStructure.x]); });
            }

            // re-order each data layer
            for (i = 0; i < data.length; i++) {
                if (container.isScaleNumeric(container.opts.scale.x)) {                    
                    sortArrayValues(i);
                }
            }

            return data;
        },
        // need to do some thinking around these next 2 functions
        // NOTE: there is SOO much to do in this function. definately will have to go back and make the scales more flexible - not sure if the bar chart should have non-ordinal scales
        setScale : function() {
            var container = this,
                elements = container.opts.elements,
                xStructure = container.opts.dataStructure.x,
                yStructure = container.opts.dataStructure.y,
                xScaleOpts = container.opts.scale.x,
                yScaleOpts = container.opts.scale.y,
                xRangeMin = elements.xAxis.rangeMin || 0,
                yRangeMin = elements.yAxis.rangeMin || 0,
                xRangeMax = elements.xAxis.rangeMax || container.width,
                yRangeMax = elements.yAxis.rangeMax || container.height,
                xDomainMin = elements.xAxis.domainMin || 0,
                xDomainMax = elements.xAxis.domainMax || d3.max(container.data, function(d) { return d[xStructure]; }) || 0,
                yDomainMin = elements.yAxis.domainMin || 0,
                yDomainMax = elements.yAxis.domainMax || d3.max(container.data, function(d) { return d[yStructure]; }) || 0,
                // domain for stacked bars
                yDomainGroupMin = 0,
                yDomainGroupMax = d3.max(container.dataGroups, function(d) { return d.total });
             
            if (xDomainMin === 'data-min') {
                xDomainMin = d3.min(container.data, function(d) { return d[xStructure]; });
            }

            if (yDomainMin === 'data-min') {
                yDomainMin = d3.min(container.data, function(d) { return d[yStructure]; });
                yDomainGroupMin = d3.min(container.dataGroups, function(d) { return d.total });
            }

            // set the X scale
            if (xScaleOpts === "date") {
                container.xScale = d3.time.scale();
                container.xScale
                    .domain(d3.extent(container.data, function(d) { return d[xStructure]; }))
                    .range([xRangeMin, xRangeMax]);
            }
            else {
                container.xScale = d3.scale[xScaleOpts]();
            }

            // set the Domain and range for the X axis
            if (xScaleOpts === "linear") {
                // setting the X scale domain to go from the min value to the max value of the data.x set
                // if multiple areas on the chart, I will have to check all data sets before settings the domain
                container.xScale
                    .domain([xDomainMin, xDomainMax])
                    // set the range to go from 0 to the width of the chart
                    .range([xRangeMin, xRangeMax]);
            }            
            else if (xScaleOpts === "ordinal") {
                container.xScale
                    .rangeRoundBands([xRangeMin, xRangeMax], 0.1);

                // if the domain is custom and it's an array    
                if (elements.xAxis.domainCustom && Array.isArray(elements.xAxis.domainCustom)) {
                    container.xScale.domain(elements.xAxis.domainCustom);
                } else {
                    container.xScale.domain(container.data.map(function(d) { return d[xStructure]; }));
                }
            }
            // hopefully I can fit into one of the two current treatments
            else if (xScaleOpts === "pow") {
            }


            // if the scale is ordinal then add the rangeBounds - e.g.: .rangeRoundBands([0, width], .1);  (http://bl.ocks.org/3885304)
            if (yScaleOpts === "date") {
                container.yScale = d3.time.scale();
                container.yScale
                    .domain(d3.extent(container.data, function(d) { return d[yStructure]; }));

                container.yScale
                    .range([yRangeMax, yRangeMin]);
            } else {
                container.yScale = d3.scale[container.opts.scale.y]();
            }
            // set the Domain and range for the Y axis
            if (yScaleOpts === "linear") {
                container.yScale
                    .range([yRangeMax, yRangeMin])
                    .domain([yDomainMin, yDomainMax]);
                    // set the range to go from 0 to the height of the chart
                if (container.opts.elements.layoutType === 'stacked') {
                    // if it's stacked then take the max value of any group total
                    container.yScale
                        .domain([yDomainGroupMin, yDomainGroupMax]);
                }
            } else if (yScaleOpts === "ordinal") {  // ###### more thought needs to be put into whether this  should even be here ######
                container.yScale
                    .domain([yDomainMin, yDomainMax]);
                container.yScale
                    .range([yRangeMax, yRangeMin]);
            }
            // hopefully I can fit into one of the two current treatments
            else if (yScaleOpts === "pow") {
            }
        },
        setAxis : function() {
            var container = this;
            // need to add tick options here
            container.xAxis = d3.svg.axis()
                .scale(container.xScale)
                .ticks(container.opts.dataStructure.ticksX)
                .tickSize(container.opts.elements.xAxis.tickSize)
                .orient("bottom");

            container.yAxis = d3.svg.axis()
                .scale(container.yScale)
                .ticks(container.opts.dataStructure.ticksY)
                .tickSize(container.opts.elements.yAxis.tickSize)
                .orient("left");
        },
        // updates the data set for the chart
        // I may just want to process the input and then call getData()
        updateData : function(data) {
            var container = this;

            container.opts.dataUrl = data;
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
                //console.log(container.data);
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
            this.opts = extend(true, {}, this.opts, settings);
            // will make custom function to handle setting changes
            this.getData();
        },
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
    d3.bar = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "bar",
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
                el[pluginName] = new d3.Bar(options, el, callback);
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