const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("./config");
const script = require("./script");
const connect = require("./storage").connect();

const bots = new Map();
const maxNumberOfLatestFrames = 20;

const createBot = (botId) => {
    return {
        botId: botId,
        leftCameraFrames: [],
        rightCameraFrames: [],
        irCameraFrames: []
    };
};

const getBot = (botId) => {
    return connect.then(storage => storage.bots.findOne(botId));
};

const findFrame = (botId, cameraFrames) => {
    return connect.then(storage => getBot(botId))
        .then(bot => {
            if (bot && bot[cameraFrames] && bot[cameraFrames].length) {
                const frames = bot[cameraFrames];
                const frame = frames[frames.length - 1];

                return frame.buffer;
            }

            return null;
        });
};

const saveFrame = (request, response, cameraFrames) => {
    const frameBytes = [];

    request.on("data", (chunk) => {
        frameBytes.push(chunk);
    });

    request.on("end", () => {
        return connect.then(storage => {
            storage.bots.findOne(request.botId)
            .then(bot => {
                if (!bot) {
                    return createBot(request.botId);
                }

                return bot;
            })
            .then(bot => {
                const frame = Buffer.concat(frameBytes);
                const sliceBeginIndex = Math.max(bot[cameraFrames].length - maxNumberOfLatestFrames + 1, 0);

                bot[cameraFrames].push(frame);
                bot[cameraFrames] = bot[cameraFrames].slice(sliceBeginIndex);

                return storage.bots.insertOrUpdate(bot);
            })
            .then(() => {
                response.writeHead(201);
                response.end("saved");
            });
        });
    });
};

const getFrame = (request, response, cameraFrames) => {

    return findFrame(request.botId, cameraFrames)
        .then(frame => {
            response.setHeader("content-type", "image/JPEG");
            response.writeHead(200);
            response.end(frame, "binary");
        });
};

function writeForever(response) {
    response.write("a");

    setTimeout(() => {
        writeForever(response);
    }, 10);
}

const getStream = (request, response) => {
    response.setHeader("content-type", "application/octet-stream");
    response.writeHead(200);
    writeForever(response);   
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

const saveLeftFrame = (request, response) => saveFrame(request, response, "leftCameraFrames");
const saveRightFrame = (request, response) => saveFrame(request, response, "rightCameraFrames");
const getLeftFrame = (request, response) => getFrame(request, response, "leftCameraFrames");
const getRightFrame = (request, response) => getFrame(request, response, "rightCameraFrames");

const getContours = (request, response) => script.applyScript(request, response, "scripts/contours.py");
const getHumans = (request, response) => script.applyScript(request, response, "scripts/humans.py");
const getForeground = (request, response) => script.applyScript(request, response, "scripts/foreground.py");
const getDepthMap = (request, response) => script.applyScript(request, response, "scripts/depth.py");

module.exports = {
    saveLeftFrame: saveLeftFrame,
    saveRightFrame: saveRightFrame,
    getStream: getStream,
    getStreamNOIR: getStreamNOIR,
    getLeftFrame: getLeftFrame,
    getRightFrame: getRightFrame,
    getContours: getContours,
    getHumans: getHumans,
    getForeground: getForeground,
    getDepthMap: getDepthMap
};
