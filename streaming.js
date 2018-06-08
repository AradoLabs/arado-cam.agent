const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("./config");
const script = require("./script");
const connect = require("./storage").connect();
const fs = require("fs");
const bots = new Map();
const maxNumberOfLatestFrames = 20;


function writeForever(response) {
    response.write("a");

    setTimeout(() => {
        writeForever(response);
    }, 10);
}

const getStream = (request, response) => {
    const path = "sample.mp4";

    fs.stat(path, (err, stats) => {
        // const fileSize = stats.size;
        const fileSize = 1048576;
        const range = request.headers.range;

        if (range) {
            const rangeRegex = /bytes=(\d*)-(\d*)/g;
            const rangeMatch = rangeRegex.exec(range);
            const start = parseInt(rangeMatch[1]);
            const end = parseInt(rangeMatch[2]) || start + fileSize - 1;
            const chunksize = end - start + 1;
            const fileStream = fs.createReadStream(path, { start, end });
            const head = {
                "Content-Range": `bytes ${start}-${end}/*`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4"
            };

            response.writeHead(206, head);
            fileStream.pipe(response);
        }
        else {
            const head = {
                "Content-Type": "video/mp4"
            };
            response.writeHead(200, head);
            fs.createReadStream(path).pipe(response);
        }

    });
};

const getStreamNOIR = (request, response) => {
    return findFrame(request.botId, cameraFrames)
        .then(frame => {
            response.setHeader("content-type", "application/octet-stream");
            response.writeHead(200);
            writeForever(response);
            // response.end();
        });
};

module.exports = {
    getStream: getStream,
    getStreamNOIR: getStreamNOIR
};
