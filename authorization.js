const jwt = require('jsonwebtoken');
const config = require('./config');

const parseToken = (request) => {
    const empty = '';
    const header = request.headers['authorization'];
    if (!header) {
        return empty;
    }

    const splitted = header.split(" ");

    if (splitted.length !== 2) {
        return empty;
    }

    return splitted[1];
};

const authorize = function (request, response, next) {
    const unauthorized = {
        success: false,
        message: 'unauthorized'
    };

    const token = parseToken(request);

    if (!token) {
        return response.status(401).send(unauthorized);
    }

    return jwt.verify(token, config.jwtSecret, function (error, decoded) {
        if (error) {
            return response.status(401).send(unauthorized);
        }
        else {
            request.botId = decoded.botId;
            next();
        }
    });
};

const getToken = (request, response) => {
    const botId = request.headers['bot-id'];
    const botKey = request.headers['bot-key'];

    const bot = config.bots.find(x => x.botId === botId && x.botKey === botKey);

    if (!bot) {
        return response.status(401).send({
            success: false,
            message: 'forbidden'
        });
    }

    const token = jwt.sign(
        {
            botId: botId,
            botKey: botKey
        },
        config.jwtSecret,
        {
            expiresIn: '7 days'
        }
    );

    response.writeHead(200);
    response.end(token);
};

module.exports = {
    authorize: authorize,
    getToken: getToken
};
