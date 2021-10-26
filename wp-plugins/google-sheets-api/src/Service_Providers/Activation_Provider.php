<?php

namespace Cornel\GoogleSheetsAPI\Service_Providers;

use Cornel\GoogleSheetsAPI\Services\Activation;

class Activation_Provider implements Service_Provider_Interface {

	public function register() {
		$service = new Activation();

		add_action(
			'register_uninstall_hook',
			[ $service, 'uninstall_hook' ]
		);
	}
}
