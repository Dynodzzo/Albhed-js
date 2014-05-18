<?php

$queryString = http_build_query(array('ie' => 'utf-8', 'tl' => htmlspecialchars($_GET['tl']), 'q' => htmlspecialchars($_GET['q'])));
$context = stream_context_create(array('http' => array('method' => 'GET', 'header' => "Referer: \r\n")));
$soundFile = file_get_contents('http://translate.google.com/translate_tts?' . $queryString, false, $context);
 
header("Content-type: audio/mpeg");
header("Content-Transfer-Encoding: binary");
header('Pragma: no-cache');
header('Expires: 0');
 
echo($soundFile);