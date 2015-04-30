var mongoose = require('mongoose');

function connect(connectionString, callback) {
    mongoose.connect(connectionString);
    mongoose.connection.on('error', function(err) {
        console.log('MongoDB returned error.', err);
        process.exit(1);
    });

    mongoose.connection.once('open', function() {
        console.log('MongoDB connection successful.');
        callback();
    });
};

module.exports = {
    connect: connect
};
