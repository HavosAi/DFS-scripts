<?php
/**
Plugin Name: Google Sheets API
Description: API provided to interact with Google Sheets
Version: 1.0.0
 **/

use Cornel\GoogleSheetsAPI;
require_once __DIR__ . '/vendor/autoload.php';

$init_class = GoogleSheetsAPI\Init::get_instance();
add_action(
	'plugins_loaded',
	[ $init_class, 'init' ]
);
