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

	    	// set the $zip object to null to kill the stream???
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

	$scriptContent = $_POST['script'];
	$styleContent = $_POST['style'];
	$typeContent = $_POST['type'];

	// call the template scripts
	require_once ('templates/chart.php');
	require_once ('templates/style.php');

	// make the temporary directory
	mkdir("chart");

	//echo $chartHtml;
	//echo $style;

	// write the style and html files to the temp folder
	$htmlFile = "chart/chart.html";
	$htmlFileHandle = fopen($htmlFile, 'w') or die("can't open file");
	fwrite($htmlFileHandle, $chartHtml);
	fclose($htmlFileHandle);

	$styleFile = "chart/style.css";
	$styleFileHandle = fopen($styleFile, 'w') or die("can't open file");
	fwrite($styleFileHandle, $style);
	fclose($styleFileHandle);

	// copy the other files over to the folder
	copy('js/d3/'.$typeContent.'.js', 'chart/'.$typeContent.'.js');
	copy('js/libs/d3.v3.min.js', 'chart/d3.v3.min.js');

	
	// zip the files in the chart folder up
	$files_to_zip = array(
	  'chart/'.$typeContent.'.js',
	  'chart/d3.v3.min.js',
	  'chart/chart.html',
	  'chart/style.css'
	);

	//if true, good; if false, zip creation failed
	$result = create_zip($files_to_zip, 'chart.zip');

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

	deleteDir('chart');


?>

