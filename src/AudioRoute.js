"use strict";

const BasicHTTPServer = require("http-server-basic");

const AudioControl = require("./AudioControl");

class AudioRoute extends BasicHTTPServer.BaseRoute {
    constructor (route) {
        super(route);

        this.route = route;
        this.audioControl = new AudioControl();
    }

    handleRequest (request, response) {
        let data = "";

        request.on("data", (packet) => {
            data += packet;
        });

        request.on("finish", () => {
        });

        request.on("end", () => {
            try {
                this.respond(request, response, data);
            } catch (e) {
                console.log("Error with request", e);
                this.respondString(response, 500, e);
            }
        });
    }

    respond (request, response, data) {
        const url = request.url;

        console.log("Request received:", url);
        const endURL = url.replace(this.route, "");
        console.log("Sub url:", endURL);

        let responseString = "Ok";
        let ok = false;

        switch (endURL) {
            case "/upload":
                this.audioControl.loadData(Buffer.from(data));
                ok = true;
                break;
            case "/load":
                this.audioControl.load(data);
                ok = true;
                break;
            case "/play":
                this.audioControl.play();
                ok = true;
                break;
            case "/pause":
                this.audioControl.pause();
                ok = true;
                break;
            case "/stop":
                this.audioControl.stop();
                ok = true;
                break;
            case "/seek":
                const position = parseFloat(data);
                this.audioControl.seek(position);
                ok = true;
            case "/progress":
                responseString = this.audioControl.progress.toString();
                ok = true;
                break;
            case "/duration":
                responseString = this.audioControl.duration.toString();
                ok = true;
                break;
            default:
                console.log("Unknown endpoint:", endURL);
                break;
        }

        if (ok) {
            this.respondString(response, 200, responseString);
        } else {
            this.respondString(response, 500, "Unknown command: ", endURL);
        }
    }

    respondString (response, status, data) {
        response.statusCode = status;
        response.write(data + "\n");
        response.end();
    }
}

module.exports = AudioRoute;
