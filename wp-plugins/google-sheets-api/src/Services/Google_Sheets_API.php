<?php

namespace Cornel\GoogleSheetsAPI\Services;

class Google_Sheets_API {

	private $api_key;
	private $spreadsheet_id;

	public function __construct() {
		$this->api_key        = get_option( Admin::API_KEY_OPTION );
		$this->spreadsheet_id = get_option( Admin::SPREADSHEET_ID );
	}

	public function get_data() {
		if ( empty( $this->api_key ) ) {
			return [
				'API Key is not valid'
			];
		}

		if ( empty( $this->spreadsheet_id ) ) {
			return [
				'Spreadsheet ID is not valid'
			];
		}

		$tab = ! empty( $_GET['tab'] ) ? filter_var( $_GET['tab'], FILTER_VALIDATE_INT ) : 0;

		try {
			$client      = $this->get_client();
			$service     = new \Google_Service_Sheets( $client );
			$spreadsheet = $service->spreadsheets->get( $this->spreadsheet_id );
			$sheets      = $spreadsheet->getSheets();
			$sheet       = $sheets[ $tab ];

			$response = $service->spreadsheets_values->get( $this->spreadsheet_id, $sheet->properties->title );
			$result   = $response->getValues();
		} catch ( \Exception $e ) {
			$result = [
				'Failed to fetch Google API'
			];
		}


		return $result;
	}

	public function get_client() {
		$client = new \Google_Client();
		$client->setDeveloperKey( $this->api_key );

		return $client;
	}
}
