<?php
header("Content-type: application/json");
$url = "https://api.darksky.net/forecast";
//darksky url

$apikey = "36075cdea17b62dc9afee06f01f44d99"; 
//enter your DarkSky.net API key above

$units = "ca";
//enter your units for the weather here

$latlng = "45.5555,-75.5555"; //default latitude and longitude
if( isset($_REQUEST['latlng'])){
    $latlng = trim($_REQUEST['latlng']);
}

// create a new cURL resource
$ch = curl_init();
// set URL and other appropriate options
curl_setopt($ch, CURLOPT_URL, $url . "/". $apikey ."/" . $latlng . "?units=" . $units);
//ADD the proper value for UNITS to the end of the URL on the line above


curl_setopt($ch, CURLOPT_HEADER, 0);

// grab URL and pass it to the browser
curl_exec($ch);

// close cURL resource, and free up system resources
curl_close($ch);
?>