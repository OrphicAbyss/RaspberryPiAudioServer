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
        const url = request.url;
        console.log("Request received:", url);
        const endURL = url.replace(this.route, "").split("?")[0];
        console.log("Sub url:", endURL);
        request.endURL = endURL;
        console.log("Headers", request.headers);
        const contentLength = request.headers["content-length"];
        const contentType = request.headers["content-type"];

        if (endURL === "/upload") {
            const data = Buffer.alloc(Number(contentLength));
            let i = 0;

            request.on("data", (chunk) => {
                chunk.copy(data, i);
                i += chunk.length;
            });

            request.on("end", () => {
                try {
                    let fileData = null;
                    // extract data boundary
                    const boundStr = "boundary=";
                    const index = contentType.indexOf(boundStr) + boundStr.length;
                    const marker = "--" + contentType.substring(index);
                    console.log("Marker:", marker);
                    i = 0;
                    while (i !== -1) {
                        const found = data.indexOf(marker, i);
                        if (found !== -1) {
                            const newLineStr = "\r\n";
                            const newLine = data.indexOf(newLineStr, i);
                            console.log("Marker positions:", i, newLine, found);
                            if (newLine < found) {
                                console.log("Length:", newLine - i);
                                if (newLine - i < 200) {
                                    const details = data.toString("utf8", i, newLine).split(";");
                                    const filename = details.map((value) => {
                                        return value.trim().split("=");
                                    }).filter((value) => {
                                        return value.length > 1 && value[0] === "filename";
                                    }).map((value) => {
                                        return value[1].replace("\"", "").replace("\"", "");
                                    })[0];
                                    console.log("Filename", filename);
                                    request.filename = filename;

                                    let start = newLine + newLineStr.length;
                                    const secondLine = data.indexOf(newLineStr, start);
                                    console.log("Second line length", secondLine - start);
                                    console.log("Data", data.toString("utf8", start, secondLine));

                                    start = secondLine + newLineStr.length;
                                    const thirdLine = data.indexOf(newLineStr, start);
                                    console.log("Third line length", thirdLine - start);
                                    console.log("Data", data.toString("utf8", start, thirdLine));

                                    start = thirdLine + newLineStr.length;
                                    fileData = data.slice(start, found);
                                }
                            }

                            i = found + marker.length + 2;
                        } else {
                            i = -1;
                        }
                    }

                    console.log("Passing file data to respond function", fileData);
                    this.respond(request, response, fileData);
                } catch (e) {
                    console.log("Error with request", e);
                    this.respondString(response, 500, e);
                }
            });
        } else {
            let data = "";

            request.on("data", (packet) => {
                data += packet;
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
    }

    respond (request, response, data) {
        const endURL = request.endURL;
        let responseString = "Ok";
        let ok = false;

        switch (endURL) {
            case "/upload":
                this.audioControl.loadData(data);
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
                break;
            case "/progress":
                responseString = this.audioControl.progress.toString();
                ok = true;
                break;
            case "/duration":
                responseString = this.audioControl.duration.toString();
                ok = true;
                break;
            case "/status":
                responseString = JSON.stringify({
                    progress: this.audioControl.progress,
                    duration: this.audioControl.duration
                });
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
