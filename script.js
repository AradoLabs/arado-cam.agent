
const runScript = (filename, botId) => {
    const spawn = require('child_process').spawn;
    const child = spawn('python', ['-u', filename, botId]);

    const stdoutBytes = [];
    const stderrBytes = [];

    return new Promise((resolve, reject) => {

        child.stdout.on('data', (chunk) => {
            stdoutBytes.push(chunk);
        });

        child.stderr.on('data', (chunk) => {
            stderrBytes.push(chunk);
        });

        child.on('close', (code) => {
            if (code) {
                return reject(filename + ' failed: ' + Buffer.concat(stderrBytes));
            }

            return resolve(Buffer.concat(stdoutBytes));
        });

        child.on('error', (err) => {
            return reject(filename + ' failed: ' + err.message);
        });
    });
};

const applyScript = (request, response, filename) => {

    return runScript(filename, request.botId)
        .then(result => {
            response.setHeader('content-type', "image/JPEG");
            response.writeHead(200);
            response.end(result, "binary");
        })
        .catch(error => {
            response.writeHead(500);
            response.end(error);
        });
};

module.exports = {
    applyScript: applyScript
};
