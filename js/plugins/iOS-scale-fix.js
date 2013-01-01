var ScaleFix = {
	viewportmeta : document.querySelector && document.querySelector('meta[name="viewport"]'),
    ua : navigator.userAgent,
	gestureStart : function()
	{
		ScaleFix.viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";    
	},
	init : function()
	{
		if (ScaleFix.viewportmeta && /iPhone|iPad/.test(ScaleFix.ua) && !/Opera Mini/.test(ScaleFix.ua)) 
		{
			ScaleFix.viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
			document.addEventListener("gesturestart", ScaleFix.gestureStart, false);
		}
		window.onorientationchange = function()
		{
		    document.body.scrollLeft = 0;      		
		};
	}
};

ScaleFix.init();