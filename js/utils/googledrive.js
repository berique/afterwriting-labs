/* global define, gapi, google, $, FileReader, btoa */
define(function () {
	var client_id = '540351787353-3jf0j12ccl0tmv2nbkcdncu0tuegjkos.apps.googleusercontent.com',
		dev_key = 'AIzaSyAakDfF6BAzFrLZ-ZWCht2lpYx7i9ITZrY',
		scope = ['https://www.googleapis.com/auth/drive'],
		module = {};

	gapi.load('auth');
	gapi.load('picker');

	module.open = function (content_callback) {
		module.current_content_callback = content_callback;
		gapi.auth.init(function () {
			authorize(true, open_picker.bind(this));
		});
	};

	module.save = function (blob, filename) {
		gapi.auth.init(function () {
			authorize(true, save_file.bind(this, blob, filename));
		});
	};

	function save_file(blob, filename, result) {
		if (result && !result.error) {
			upload(blob, filename);
		} else {
			authorize(false, save_file.bind(this, blob, filename));
		}
	}

	function open_picker(result) {
		if (result && !result.error) {
			module.oauth_token = result.access_token;
			new google.picker.PickerBuilder()
				.addView(google.picker.ViewId.DOCUMENTS)
				.setOAuthToken(module.oauth_token)
				.setDeveloperKey(dev_key)
				.setCallback(picker_ready)
				.build()
				.setVisible(true);
		} else {
			authorize(false, open_picker);
		}
	}

	function authorize(immediate, callback) {
		gapi.auth.authorize({
			client_id: client_id,
			scope: scope,
			immediate: immediate,
		}, callback);
	}

	function picker_ready(data) {
		if (data.action == google.picker.Action.PICKED) {
			var doc = data[google.picker.Response.DOCUMENTS][0];
			gapi.client.load('drive', 'v2', load_file_info.bind(this, doc.id));
		}
	}

	function load_file_info(id) {
		gapi.client.drive.files.get({
			fileId: id
		}).execute(function (response) {

			if (!response.error) {
				download(response.exportLinks['text/plain'], function (content) {
					module.current_content_callback(content, response.alternateLink);
				});
			}
		});
	}

	function download(url, callback) {
		$.ajax({
			url: url,
			type: 'GET',
			beforeSend: function (xhr) {
				return xhr.setRequestHeader('Authorization', 'Bearer ' + module.oauth_token);
			},
			success: callback
		});
	}

	function upload(blob, filename) {
		var boundary = '-------314159265358979323846';
		var delimiter = "\r\n--" + boundary + "\r\n";
		var close_delim = "\r\n--" + boundary + "--";
		var reader = new FileReader();
		reader.readAsBinaryString(blob);
		reader.onload = function () {
			var contentType = blob.type || 'application/octet-stream';
			var metadata = {
				'title': filename,
				'mimeType': contentType
			};

			var base64Data = btoa(reader.result);
			var multipartRequestBody =
				delimiter +
				'Content-Type: application/json\r\n\r\n' +
				JSON.stringify(metadata) +
				delimiter +
				'Content-Type: ' + contentType + '\r\n' +
				'Content-Transfer-Encoding: base64\r\n' +
				'\r\n' +
				base64Data +
				close_delim;

			var request = gapi.client.request({
				'path': '/upload/drive/v2/files',
				'method': 'POST',
				'params': {
					'uploadType': 'multipart'
				},
				'headers': {
					'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
				},
				'body': multipartRequestBody
			});

			request.execute();
		};
	}

	return module;

});