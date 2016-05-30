"use strict";

const AV = require("av"),
    mp3 = require("mp3");

class AudioControl {
    /**
     * This class abstracts the audio control for this project.
     */
    constructor () {
        this.current = null;
        this.metadata = null;
    }

    /**
     * Load a file ready for playback. The play method must be called after.
     * 
     * @param {string} filename Filename of the audio file to play
     */
    load (filename) {
        if (this.current) {
            // stop playing if we already have a player created
            console.log("Stopping old file");
            this.current.stop();

            this.current = null;
            this.metadata = null;
        }

        console.log("Playing file:", filename);
        this.current = AV.Player.fromFile(filename);
        this.current.on("metadata", (metadata) => {
            this.metadata = metadata;
            console.log(Object.keys(metadata));
        });
        this.current.on("duration", (duration) => {
            this.duration = duration / 1000;
            console.log("Duration:", duration / 1000);
        });
        this.current.on("progress", (progress) => {
            this.progress = progress / 1000;
            console.log(progress / 1000);
            // TODO: add hook here to send value back to frontend
        });
        this.current.on("error", (error) => {
            console.error(error);
        });
        this.current.on("end", () => {
            console.log("End of file");
        });
    }

    /**
     * Load from data string ready for playback. The play method must be called after.
     *
     * @param {string} data Audio data to play
     */
    loadData (data) {
        if (this.current) {
            // stop playing if we already have a player created
            console.log("Stopping old file");
            this.current.stop();

            this.current = null;
            this.metadata = null;
        }

        this.current = AV.Player.fromBuffer(data);
        this.current.on("metadata", (metadata) => {
            this.metadata = metadata;
            console.log(Object.keys(metadata));
        });
        this.current.on("duration", (duration) => {
            this.duration = duration / 1000;
            console.log("Duration:", duration / 1000);
        });
        this.current.on("progress", (progress) => {
            this.progress = progress / 1000;
            console.log(progress / 1000);
            // TODO: add hook here to send value back to frontend
        });
        this.current.on("error", (error) => {
            console.error(error);
        });
        this.current.on("end", () => {
            console.log("End of file");
        });
    }

    /**
     * Start or resume playback of the current file
     */
    play () {
        if (this.current) {
            this.current.play();
        }
    }

    /**
     * Stop playback of the current file
     */
    stop () {
        if (this.current) {
            this.current.stop();
        }
    }

    /**
     * Pause playback of the current file
     */
    pause () {
        if (this.current) {
            this.current.pause();
        }
    }

    /**
     * Seek to a position in the current file.
     *
     * @param {number} time Time in seconds
     */
    seek (time) {
        if (this.current) {
            this.current.seek(time * 1000);
        }
    }
}

module.exports = AudioControl;

//const fs = require("fs");
//console.log(fs.existsSync("../fplus_200a.mp3"));
// const controller = new AudioControl();
// controller.load("../fplus_200a.mp3");
// controller.play();
// setTimeout(() => {
//     controller.seek(60 * 20);
// }, 250);
// AV.Player.fromFile("../fplus_200a.mp3");
