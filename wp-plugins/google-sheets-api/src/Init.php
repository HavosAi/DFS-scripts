<?php

namespace Cornel\GoogleSheetsAPI;

use Cornel\GoogleSheetsAPI\Router\Router;

class Init {
	private $services;

	private static $instance;

	private function __construct() {
		$this->services = [];
	}

	private function __clone() {
	}

	public function init() {
		(new Service_Providers\Activation_Provider())->register();
		(new Service_Providers\Google_Sheets_API_Provider( new Router() ))->register();
		(new Service_Providers\Admin_Service_Provider())->register();
	}

	public static function get_instance() {
		if ( ! empty( self::$instance ) ) {
			return self::$instance;
		}

		return new self;
	}
}
