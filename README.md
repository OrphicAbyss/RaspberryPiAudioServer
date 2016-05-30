# Raspberry Pi Audio Server
Node.js based webserver for controlling playback of audio on a Raspberry Pi

## Background
This software was built to run on a Raspberry Pi placed inside a speaker to allow for playback of things like podcasts.

# Features
* Basic audio file playback: Play, Pause, Stop, Skip Forward, Skip Back, Seek
* Audio playback exposed via websockets
* Basic audio library
    * Uploading of files
    * Downloading of files when given URL's
    * Searching of file list
    * Basic metadata reading
* Simple web user interface

# Installation
1) Update the software on the Raspberry Pi
    1) `sudo apt-get update`
    1) `sudo apt-get upgrade`
    1) `sudo apt-get install -y build-essential libasound2-dev`
1) Install the latest node.js from: https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
    1) `curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`
    1) `sudo apt-get install -y nodejs`
1) Clone this git repository
1) Run `npm install`
1) Create startup script for this server

# Plan
1) Build out audio playback features
1) Build simple web server which exposes audio playback features
1) Build file uploading
1) Build downloading of files from links
1) Read in metadata of audio files
1) Build basic library features
1) Add search to library
1) Enhance interface
1) Future features considered
    1) Access Spotify or other streaming services
    1) More advanced library like playlists