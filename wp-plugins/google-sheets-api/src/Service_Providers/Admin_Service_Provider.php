<?php

namespace Cornel\GoogleSheetsAPI\Service_Providers;

use Cornel\GoogleSheetsAPI\Services\Admin;

class Admin_Service_Provider implements Service_Provider_Interface {

	public function register() {
		$service = new Admin();

		add_action(
			'admin_menu',
			[ $service, 'register_admin_menu' ]
		);
		add_action(
			'admin_init',
			[ $service, 'register_settings' ]
		);
	}
}
