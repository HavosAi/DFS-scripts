<?php

namespace Cornel\GoogleSheetsAPI\Services;

class Admin {

	const API_KEY_OPTION = 'google_sheets_api_key';
	const SPREADSHEET_ID = 'google_sheets_spreadsheet_id';

	public function register_admin_menu() {
		add_submenu_page(
			'options-general.php',
			'Google Sheets API',
			'Google Sheets API',
			'manage_options',
			'google-sheets-api',
			[ $this, 'render_main_menu_page' ]
		);
	}

	public function render_main_menu_page() {
		echo '<form method="POST" action="options.php">';
		settings_fields( 'google_sheets_api' );
		do_settings_sections( 'google_sheets_api' );
		submit_button();
		echo '</form>';
	}

	public function register_settings() {
		add_settings_section(
			'google_sheets_api_main_settings_section',
			'Google Sheets API settings',
			'',
			'google_sheets_api'
		);
		add_settings_field(
			self::API_KEY_OPTION,
			'API Key',
			[ $this, 'render_text_field' ],
			'google_sheets_api',
			'google_sheets_api_main_settings_section',
			[ 'key' => self::API_KEY_OPTION ]
		);
		register_setting( 'google_sheets_api', self::API_KEY_OPTION );

		add_settings_field(
			self::SPREADSHEET_ID,
			'Spreadsheet ID',
			[ $this, 'render_text_field' ],
			'google_sheets_api',
			'google_sheets_api_main_settings_section',
			[ 'key' => self::SPREADSHEET_ID ]
		);
		register_setting( 'google_sheets_api', self::SPREADSHEET_ID );
	}

	public function render_text_field( $args )  {
		if (empty($args['key'])) {
			return;
		}

		$value = get_option( $args['key'] );
		echo '<input name="' . $args['key'] . '" id="' . $args['key'] . '" type="text" value="' . $value . '" />';
	}
}
