<?php

	// start putting together the content for the templates

    /* creates a compressed zip file */
	function create_zip($files = array(), $destination = '', $overwrite = false) {
		// delete any existing archive
		if (file_exists($destination)) {
			unlink($destination);
		}
		//if the zip file already exists and overwrite is false, return false
	 	if(file_exists($destination) && !$overwrite) { return false; }
		//vars
		$valid_files = array();
		//if files were passed in...
		if(is_array($files)) {
		   	//cycle through each file
		   	foreach($files as $file) {
		     	//make sure the file exists
		   		if(file_exists($file)) {
		       		$valid_files[] = $file;
		   		}
		   	}
		}
		//if we have good files...
		if(count($valid_files)) {
			
	    	//create the archive
	    	$zip = new ZipArchive();
			// old copied code...
	    	//if($zip->open($destination,$overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true) {
	    	//	return false;
	    	//}
	    	$zip->open($destination, ZipArchive::CREATE);
	    	//add the files
	    	foreach($valid_files as $file) {
	    		$zip->addFile($file,$file);
	    	}
	    	//debug
	    	//echo 'The zip archive contains ',$zip->numFiles,' files with a status of ',$zip->status;
		    
	    	//close the zip -- done!
	    	$zip->close();

			// haven't worked out how to push the zip file from the server yet
			// someting to do with the file stream still being open from creating the zip file???
	    	// set the $zip object to null to kill the stream??? - Dave's suggestion
	    	//$zip = null;

			//header("Content-Disposition: attachment; filename=$destination");
			//header("Content-Type: application/force-download");
			//header("Content-Type: application/octet-stream");
			//header("Content-Type: application/zip");
			//header("Content-length: " . filesize($destination));
			//header("Pragma: no-cache");
			//header("Content-Transfer-Encoding: binary");
			//readfile("$destination");
			//unlink($destination);

			// one example I found:
			/*
				$zip = new ZipArchive();
  				//the string "file1" is the name we're assigning the file in the archive
				$zip->addFile(file_get_contents($filepath1), 'file1'); //file 1 that you want compressed
				$zip->addFile(file_get_contents($filepath2), 'file2'); //file 2 that you want compressed
				$zip->addFile(file_get_contents($filepath3), 'file3'); //file 3 that you want compressed
				echo $zip->file(); //this sends the compressed archive to the output buffer instead of writing it to a file.
			*/
			// another suggestion I found
			// $length = filesize($destination)
			//header("Content-length: " .$length);

	    	//check to make sure the file exists
	    	return file_exists($destination);
		}
		else
		{
	    	return false;
		}
	};
	
	// after the zip file is created, delete the chart folder
	function deleteDir($dirPath) {
	    if (! is_dir($dirPath)) {
	        throw new InvalidArgumentException("$dirPath must be a directory");
	    }
	    if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
	        $dirPath .= '/';
	    }
	    $files = glob($dirPath . '*', GLOB_MARK);
	    foreach ($files as $file) {
	        if (is_dir($file)) {
	            self::deleteDir($file);
	        } else {
	            unlink($file);
	        }
	    }
	    rmdir($dirPath);
	};
	
	function create_file($content, $path) {
		$fileHandle = fopen($path, 'w') or die("can't open file");
		fwrite($fileHandle, $content);
		fclose($fileHandle);
	};

	// define the post objects
	$scriptContent = $_POST['script'];
	$styleContent = $_POST['style'];
	$formData = $_POST['formData'];
	$dataObject = $_POST['dataObject'];  // this is the json as a string
	// note: json_decode didn't do what I wanted. Is there a good way to convert JSON into a string in PHP?
	echo $formData;
	
	// make the temporary directorys
	mkdir("chart");
	mkdir("chart/js");
	mkdir("chart/data");
	mkdir("chart/css");
	
	// copy the required JS files over to the JS folder
	copy('js/d3/'.$formData['type']['primary'].'.js', 'chart/js/'.$formData['type']['primary'].'.js');
	copy('js/libs/d3.v3.min.js', 'chart/js/d3.v3.min.js');
	
	

	// call the template scripts to create the files from
	require_once ('templates/chart.php');
	require_once ('templates/style.php');

	// write the style and html files to the temp folder
	//echo $chartHtml;
	create_file($chartHtml, "chart/chart.html");
	//echo $style;
	create_file($styleFile, "chart/css/style.css");

	// zip the files in the chart folder up
	$files_to_zip = array(
	  'chart/js/'.$formData['type']['primary'].'.js',
	  'chart/js/d3.v3.min.js',
	  'chart/chart.html',
	  'chart/css/style.css'
	);
	
	echo $formData['data']['dataObject'];
	
	// find out where the data is coming from and organise a file for it if needed
	switch ($formData['data']['source']) {
		case "dummy":
			// move the dummy file into the zip folder and rename it
			copy($formData['data']['dummy'], 'chart/'.$formData['data']['dummy']);
			// push this onto the $files_to_zip array
			array_push($files_to_zip, 'chart/'.$formData['data']['dummy']);
			break;
		case "url":
			// just let the chart settings point to the resource. do nothing
			break;
		case "file" :
			// make the dummy data file and add it to the zip
			// ################ I need to change the plugin settings too!!!! hmmm, more complexity :( ####################
			// depending on the file type I have to write different types of files
			create_file($dataObject, 'chart/data/data.json');
			//create_file("data here", 'chart/data/data.json');
			// push this file onto $files_to_zip array
			array_push($files_to_zip, 'chart/data/data.json');
			break;
		default :
			// do nothing
	};

	//if true, good; if false, zip creation failed
	$result = create_zip($files_to_zip, 'chart.zip');
	
	// delete the temporary folders from the server
	//deleteDir('chart/js');
	//deleteDir('chart/css');
	//deleteDir('chart/data');
	//deleteDir('chart');

?>

