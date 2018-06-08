module.exports = {
    tcpPort: process.env.ARADOCAM_TCP_PORT || 8080,   
    jwtSecret: process.env.ARADOCAM_TOKEN_SECRET || 'test-token-secret',
    mongodbConnection: process.env.ARADOCAM_MONGODB_CONNECTION || 'mongodb://localhost:27017/arado-cam',
    bots: [
        {
            botId: process.env.ARADOCAM_BOT_ID || 'test-bot-id',
            botKey: process.env.ARADOCAM_BOT_KEY || 'test-bot-key'
        }
    ]
};
