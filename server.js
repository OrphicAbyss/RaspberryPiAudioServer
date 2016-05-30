"use script";

const BasicHTTPServer = require("http-server-basic");

const fileRoute = new BasicHTTPServer.StaticFileServer("/", "./public/", "index.html");

const httpServer = new BasicHTTPServer({port: 8080});
httpServer.registerDefaultHandler(fileRoute);
httpServer.registerHandler(new BasicHTTPServer.NullRoute("/control"));
httpServer.start();
console.log("Starting server on 8080");

// var Speaker = require('audio-speaker');
// var Generator = require('audio-generator');
//
// Generator(function (time) {
//     //panned unisson effect
//     var τ = Math.PI * 2;
//     return [Math.sin(τ * time * 441), Math.sin(τ * time * 439)];
// })
//     .pipe(Speaker({
//         //PCM input format defaults, optional.
//         channels: 2,
//         sampleRate: 44100,
//         byteOrder: 'LE',
//         bitDepth: 16,
//         signed: true,
//         float: false,
//         interleaved: true,
//
//         //whether to use scriptProcessor (1) or bufferSource (0) to output sound, browser-only
//         mode: 0
//     }));