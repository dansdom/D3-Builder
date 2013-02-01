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
				.'<script src="d3.v3.min.js"></script>'."\n"
				.'<script src="'
				// path of the plugin file
				.$typeContent
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