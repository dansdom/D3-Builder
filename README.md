D3-Builder
==========

Chart building tool using D3 library



TO DO LIST:

1. I think the data options aren't 100% yet

4. optimise the jQuery selectors.



Priorities:

1. data parsing from inside each plugin. There neds to be regex that strips out garbage and then parseFloat of those qulitative values on the chart

2. implement the spacing attribute on the force chrt. use it to set the force between tree nodes

3. there are a bunch of plugin settings (see 2. - also for the chord chart) that are no fully implemented through the interface. Namely the "theme" tab. This needs to be gone through

4. add a nice animation transition for the scales? that would be nice

5. interface options that will hide and show available settings field for each chart




Known Bugs: (that are bugging me)

1. select pie (nested), build chart. then select flat data and build. Fails to build the flat chart



Chart Plugins priority:
1. Streamgraph

2. difference chart

3. multiple line chart and area (write into current plugins)

3. stacked area and line chart

4. tree layout

5. Hierarchical Edge Bundling

6. node link tree
