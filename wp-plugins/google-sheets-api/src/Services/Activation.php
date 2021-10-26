<?php

namespace Cornel\GoogleSheetsAPI\Services;

class Activation {
	public function uninstall_hook() {
		delete_option( Admin::API_KEY_OPTION );
		delete_option( Admin::SPREADSHEET_ID );
	}
}
