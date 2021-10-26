<?php

namespace Cornel\GoogleSheetsAPI\Router;

class Router implements Router_Interface {
	private $namespace = 'google-sheets-api';

	public function register_route( $route, $callback, $method = 'GET' ) {
		register_rest_route(
			$this->namespace,
			$route,
			[
				'methods' => $method,
				'callback' => $callback,
			]
		);
	}
}
