<?php

	// start putting together the content for the templates

	// call the template scripts
	require_once ('templates/chart.php');
	require_once ('templates/style.php');



    /* creates a compressed zip file */
	function create_zip($files = array(), $destination = '', $overwrite = false) {
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
		    	if($zip->open($destination,$overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true) {
		    		return false;
		    	}
		    	//add the files
		    	foreach($valid_files as $file) {
		    		$zip->addFile($file,$file);
		    	}
		    	//debug
		    	//echo 'The zip archive contains ',$zip->numFiles,' files with a status of ',$zip->status;
		    
		    	//close the zip -- done!
		    	$zip->close();

				header("Content-Disposition: attachment; filename=$destination");
				header("Content-Type: application/zip");
				header("Content-length: " . filesize($destination));
				header("Pragma: no-cache");
				header("Expires: 0");
				header("Content-Transfer-Encoding: binary");
				readfile("$destination");
				//unlink($destination);

		    
		    	//check to make sure the file exists
		    	return file_exists($destination);
			}
			else
			{
		    	return false;
			}
		}

	$files_to_zip = array(
	  'img/avatar.png',
	  'index.html'
	);
	//if true, good; if false, zip creation failed
	$result = create_zip($files_to_zip, 'chart.zip');
	
	echo json_encode($_POST);

?>

