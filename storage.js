const mongodb = require('mongodb');
const config = require('./config');
const MongoClient = mongodb.MongoClient;

const operationFailed = function(db, error) {
    return {
        db: db,
        error: error
    };
};

const operationSucceeded = function(db, data) {
    return {
        db: db,
        data: data
    };
};

const connectToMongo = function() {
    const mongoConnection = config.mongodbConnection;

    return new Promise(function(resolve, reject) {
        MongoClient.connect(mongoConnection, function(err, db) {
            if (err) {
                return reject(operationFailed(null, err));
            }

            return resolve(operationSucceeded(db));
        });
    });
};

const connection = connectToMongo()
    .then(function(result) {
        return ensureUniqueIndex(result.db, 'bots', 'botId');
    })
    .then(function(result) {
        return storage(result.db);
    });

const ensureUniqueIndex = function(db, collectionName, field) {
    return new Promise(function(resolve, reject) {
        db.collection(collectionName).createIndex(field, {
            unique: true
        }, function(err) {
            if (err) {
                return reject(operationFailed(db, err));
            }

            return resolve(operationSucceeded(db));
        });
    });
};

const ensureNonUniqueIndex = function(db, collectionName, field) {
    return new Promise(function(resolve, reject) {
        db.collection(collectionName).createIndex(field, {
            unique: false
        }, function(err) {
            if (err) {
                return reject(operationFailed(db, err));
            }

            return resolve(operationSucceeded(db));
        });
    });
};

const insertOrUpdate = function(db, collectionName, query, updated) {

    const paramers = {
        w: 1,
        upsert: true
    };

    return new Promise(function(resolve, reject) {
        db.collection(collectionName).update(query, updated, paramers, function(err) {
            if (err) {
                return reject(operationFailed(db, err));
            }

            return resolve(operationSucceeded(db, updated));
        });
    });
};

const insert = function(db, collectionName, inserted) {

    const paramers = {
        w: 1
    };

    return new Promise(function(resolve, reject) {
        db.collection(collectionName).insertOne(inserted, paramers, function(err) {
            if (err) {
                return reject(operationFailed(db, err));
            }

            return resolve(operationSucceeded(db, inserted));
        });
    });
};

const findOne = function(db, collectionName, query) {
    return new Promise(function(resolve, reject) {
        db.collection(collectionName).findOne(query, function(err, found) {
            if (err) {
                return reject(operationFailed(db, err));
            }

            return resolve(operationSucceeded(db, found));
        });
    });
};

const find = function(db, collectionName, query) {
    const options = {
        'limit': 30,
        'sort': [['dataChanged','desc']]
    };
    return new Promise(function(resolve, reject) {
            db.collection(collectionName).find(query, options, function(err, found) {
                if (err) {
                    return reject(operationFailed(db, err));
                }

                return resolve(operationSucceeded(db, found));
            });
        })
        .then(function(result) {
            return new Promise(function(resolve, reject) {
                result.data.toArray(function(err, array) {
                    if (err) {
                        return reject(operationFailed(result.db, err));
                    }

                    return resolve(operationSucceeded(result.db, array));
                });
            });
        });
};

const bots = function(db) {
    return {
        insertOrUpdate: function(bot) {
            const query = {
                'botId': bot.botId
            };

            return insertOrUpdate(db, 'bots', query, bot)
                .then(function(result) {
                    return Promise.resolve(result.data);
                })
                .catch(function(result) {
                    return Promise.reject(result.error);
                });
        },

        find: function() {            
            const query = {
                'disabled': { $ne: true }
            };

            return find(db, 'bots', query)
                .then(function(result) {
                    return Promise.resolve(result.data);
                })
                .catch(function(result) {
                    return Promise.reject(result.error);
                });
        },

        findOne: function(botId) {
            const query = {
                'botId': botId
            };

            return findOne(db, 'bots', query)
                .then(function(result) {
                    return Promise.resolve(result.data);
                })
                .catch(function(result) {
                    return Promise.reject(result.error);
                });
        }
    };
};

const storage = function(db) {
    return {
        bots: bots(db)
    };
};

const connect = function() {
    return connection;
};

module.exports = {
    connect: connect
};
