<?php

namespace Cornel\GoogleSheetsAPI\Service_Providers;

use Cornel\GoogleSheetsAPI\Router\Router_Interface;
use Cornel\GoogleSheetsAPI\Services\Google_Sheets_API;

class Google_Sheets_API_Provider implements Service_Provider_Interface {

	protected $router;
	protected $service;

	public function __construct( Router_Interface $router ) {
		$this->router = $router;
	}

	public function register() {
		$this->service = new Google_Sheets_API();

		add_action(
			'rest_api_init',
			[ $this, 'register_routes' ]
		);
	}

	public function register_routes() {
		$this->router->register_route(
			'/get-data',
			[ $this->service, 'get_data' ],
			'GET'
		);
	}
}
