import * as http from "http";

import setup from "./setup.mjs";
import preview from "./preview.mjs";

class Server {
	storage = {};

	constructor() {
		http.createServer(this.request.bind(this))
			.listen(5000, () => {
				console.log("Server running at http://localhost:5000/");
			});
	}

	request(request, response) {
		let question = "", answer;

		request.on("data", (data) => {
			question += data;
		});

		request.on("end", () => {
			let data, async = false;

			try {
				data = JSON.parse(question);
			} catch(err) {
				if (request.url === "/setup") request.url = "/handshake";
				if (request.url === "/preview") request.url = "/handshake";
			}

			switch (request.url) {
				case "/handshake":
					answer = {
						statusCode: 200,
						contentType: "application/json", 
						data: `{"success":true}`,
					};
					break;
				case "/setup":
					setup(data);

					answer = {
						statusCode: 200,
						contentType: "application/json", 
						data: `{"success":true}`,
					};
					break;
				case "/preview":
					async = true;

					preview(data).then((base64) => {
						const answer = {
							statusCode: 200,
							contentType: "image/png",
							contentEncodeng: "base64",
							data: base64,
						};

						this.responce(response, answer);
					});

					break;
				default:
					answer = {
						statusCode: 404,
						contentType: "application/json", 
						data: `{"success":false}`,
					};
					break;
			}
	
			if (!async) this.responce(response, answer);
		});
	}

	responce(response, options) {
		let { statusCode, contentType, data } = options;

		if (!statusCode) statusCode = 500;
		if (!contentType) contentType = "text/html"
	
		response.writeHead(statusCode, {
			"Connection": "keep-alive",
			"Content-Type": contentType,
			"Cache-Control": "no-cache",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "*"
		});
	
		if (data) response.write(data);

		response.end();
	}
}

new Server();
