const config = require('./config');
const express = require('express');
const app = express();
const api = require('./api');
const tcpPort = 8080;
const frame = Buffer.alloc(0);
const frameType = "image/JPEG";


const start = () => new Promise((resolve, reject) => {
    
    api.setup(app);
    app.listen(config.tcpPort, resolve);

    console.log("listening on port %i", tcpPort);
});

start();
