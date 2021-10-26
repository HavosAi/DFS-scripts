<?php
namespace Cornel\GoogleSheetsAPI\Router;

interface Router_Interface {
	public function register_route( $route, $callback, $method );
}
