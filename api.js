const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('./config');
const authorization = require('./authorization');
const vision = require('./vision');
const streaming = require('./streaming');

const setup = (app) => {

    const tokenRoutes = express.Router();
    const visionRoutes = express.Router();
    const publicRoutes = express.Router();

    tokenRoutes.get('/', function (request, response) {
        return authorization.getToken(request, response);
    });
    
    publicRoutes.get('/stream', function (request, response) {
        return streaming.getStream(request, response);
    });
    
    publicRoutes.get('/stream-noir', function (request, response) {
        return streaming.getStreamNOIR(request, response);
    });

    visionRoutes.use(function (request, response, next) {
        return authorization.authorize(request, response, next);
    });

    visionRoutes.get('/camera-left', function (request, response) {
        return vision.getLeftFrame(request, response);
    });

    visionRoutes.get('/camera-right', function (request, response) {
        return vision.getRightFrame(request, response);
    });

    visionRoutes.get('/contours', function (request, response) {
        return vision.getContours(request, response);
    });

    visionRoutes.get('/humans', function (request, response) {
        return vision.getHumans(request, response);
    });

    visionRoutes.get('/foreground', function (request, response) {
        return vision.getForeground(request, response);
    });
    
    visionRoutes.get('/depth', function (request, response) {
        return vision.getDepthMap(request, response);
    });

    visionRoutes.post('/camera-left', function (request, response) {
        return vision.saveLeftFrame(request, response);
    });

    visionRoutes.post('/camera-right', function (request, response) {
        return vision.saveRightFrame(request, response);
    });

    app.use('/token', tokenRoutes);
    app.use('/vision', visionRoutes);
    app.use('/public', publicRoutes);
};

module.exports = {
    setup: setup
};
