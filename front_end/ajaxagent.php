<?php 
function do_post_request($post_data)
 {    
	 $requestString = http_build_query($post_data);
	 $request.="POST "."/data/find"." HTTP/1.1\n";
	 $request.="Host: "."10.50.6.70"."\n";
	 $request.="Content-type: application/x-www-form-urlencoded\n";
	 $request.="Content-length: ".strlen($requestString)."\n";
	 $request.="Connection: close\n";
	 $request.="\n";
	 $request.=$requestString."\n";

	$fp = fsockopen("10.50.6.70", "8080");
	fputs($fp, $request);//把HTTP头发送出去

	while(!feof($fp)) 
	{    
	    $rowdata.= fgets($fp, 1024);
	}
	fclose($fp);

	$body= stristr($rowdata,"\r\n\r\n");
	$body=substr($body,4,strlen($body));
	return $body;
} 

header("Content-type: application/json");
echo do_post_request($_POST);
?>