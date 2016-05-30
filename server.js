"use script";

const BasicHTTPServer = require("http-server-basic");

const AudioRoute = require("./src/AudioRoute");

const fileRoute = new BasicHTTPServer.StaticFileServer("/", "./public/", "index.html");
const audioRoute = new AudioRoute("/control");

const httpServer = new BasicHTTPServer({port: 8080});
httpServer.registerDefaultHandler(fileRoute);
httpServer.registerHandler(audioRoute);
httpServer.start();
console.log("Starting server on 8080");
