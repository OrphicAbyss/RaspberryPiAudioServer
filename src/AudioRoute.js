"use strict";

const BasicHTTPServer = require("http-server-basic");

class AudioRoute extends BasicHTTPServer.JSONRoute {
    constructor (route) {
        super(route);
    }

    respond (request, response, data) {
        console.log("Request received");
        if (false) {
            this.respondJSON(response, 200, output);
        } else {
            this.respondString(response, 500, "Unknown command: " + data);
        }
    }
}

modele.exports = AudioRoute;
