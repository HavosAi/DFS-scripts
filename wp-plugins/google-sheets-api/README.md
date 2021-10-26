#### Google Sheets API WP Plugin
The plugin provides an endpoint to interact with Google Sheets API

##### Installation
Install and activate the plugin 
https://wordpress.org/support/article/managing-plugins/

##### Configuration
Go to the General Settings -> Google Sheets API tab. Paste the API key and spreadsheet id.

##### Enpoints
The plugin creates a GET /wp-json/google-sheets-api/get-data endpoint. The tab can be switched by providing the integer 'tab' parameter to the request reflection the number of the tab -1 (the 0 tab parameter reflects to 1st tab). 
