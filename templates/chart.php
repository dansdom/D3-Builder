<?php

$chartHtml =	'<!DOCTYPE html>'."\n"
				.'<html lang="en">'."\n"
				.'<head>'."\n"
				.'<meta charset="utf-8">'."\n"
				.'<title>D3 Chart</title>'."\n"
				.'<meta name="description" content="">'."\n"
				.'<meta name="author" content="">'."\n"
				.'<meta http-equiv="cleartype" content="on">'."\n"
				.'<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">'."\n"
				.'<meta name="viewport" content="width=device-width,initial-scale=1.0">'."\n"
                .'<link rel="stylesheet" href="css/style.css">'."\n"
				.'<script src="js/d3.v3.min.js"></script>'."\n"
				.'<script>extend = function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=extend(j,b,e)):void 0!==e&&(c[g]= e));return c};</script>'."\n"
				.'<script src="js/'
				// path of the plugin file
				.$formData['type']['primary']
				.'.js"></script>'."\n"
				.'</head>'."\n"
				.'<body>'."\n"
	    		.'<div id="chart">'."\n"
	    		.'<script>'."\n"
	    		// call the plugin
	    		.$scriptContent."\n"
	    		.'</script>'."\n"
				.'</div>'."\n"
				.'</body>'."\n"
				.'</html>';

?>