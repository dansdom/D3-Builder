D3-Builder
==========

Chart building tool using D3 library



TO DO LIST:

1. I think the data options aren't 100% yet

4. optimise the jQuery selectors. atm they are like a big pile of shit.

6. start hooking up the 'upload file' option - started, but need to change the plugins to accept the data object

10. lots of work to implement the 'theme' options

11. Let users create and save their own colour schemes? maybe save a seperate cookie for each scheme, and then go check them? I'll explore this a little later

I may save these colors to the server and then provide them as options on the interface



Priorities:

1. clean up the jPicker plugin. 

2. data parsing from inside each plugin. There neds to be regex that strips out garbage and then parseFloat of those qulitative values on the chart

3. implement the spacing attribute on the force chrt. use it to set the force between tree nodes

4. there are a bunch of plugin settings (see 2. - also for the chord chart) that are no fully implemented through the interface. Namely the "theme" tab. This needs to be gone through

5. add a nice animation transition for the scales? that would be nice

6. interface options that will hide and show available settings field for each chart

100. UX and design - this will be an after thought. I want the menu and form to be absolutely positioned and then the chart centered horizontally in the remaining space




Known Bugs: (that are bugging me)

1. select pie (nested), build chart. then select flat data and build. Fails to build the flat chart

2. changing from bubble to pack layout doesn't change the colors properly



Chart Plugins priority:
1. scatterplot

2. difference chart

3. multiple line chart and area (write into current plugins)

3. stacked area and line chart

4. tree layout

5. Hierarchical Edge Bundling

6. node link tree

7. Streamgraph
