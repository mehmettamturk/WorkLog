var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// view engine setup
app.get('/', function(req, res) {
    res.render('index.html', { title: '' });
});


/* Database Configuration */

/* User */
var userSchema = new mongoose.Schema({
    rfidKey: { type: String, required: true },
    username: { type: String, required: true }
});

var User = mongoose.model('User', userSchema);

/* History */
var historySchema = new mongoose.Schema({
    rfidKey: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String }
});

var History = mongoose.model('History', historySchema);

/* ---------------- */

app.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.send(users);
    });
});

app.get('/users/in', function(req, res) {
    History.aggregate([
        { $group: {
            _id: "$rfidKey",
            count: { $sum: 1 }
        } },
        { $sort: { "date": -1 }}
    ], function(err, result) {
        var atWork = [];
        result.forEach(function(r) {
            if (r.count % 2 == 1)
                atWork.push({
                    rfidKey: r._id
                });
        });

        User.find({$or: atWork}, function(err, users) {
            res.send(users);
        })

    });
});

app.get('/history', function(req, res) {
    History.find({}).sort('-date').exec(function(err, histories) {
        res.send(histories);
    });
});

function hasUser(rfidKey, callback) {
    User.findOne({rfidKey: rfidKey}, function(err, user) {
        if (!user)
            return callback(false);

        callback(true, user);
    });
}

app.get('/checkId/:rfidKey', function(req, res) {
    var rfidKey = req.params.rfidKey;

    hasUser(rfidKey, function(isUser, user) {
        if (isUser) {
            History.find({rfidKey: rfidKey}).exec(function(err, histories) {
                var status = histories.length % 2 == 0 ? 'in' : 'out';

                var history = new History({
                    rfidKey: rfidKey,
                    date: new Date(),
                    status: status
                });

                history.save(function(err, savedHistory) {
                    res.send(true);
                });
            });
        }
        else
            res.send('No user');
    });
});

app.post('/newUser', function(req, res) {
    hasUser(req.body.rfidKey, function(isUser) {
        if (isUser)
            return res.send('Already registered.');
        else {
            var newUser = new User(req.body);
            newUser.save(function (err, user) {
                if (!err) return res.send(false);

                res.send(true);
            });
        }
    });
});

module.exports = app;
