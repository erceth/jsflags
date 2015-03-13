var app = require('express')();
var fs = require('fs');
var vm = require('vm');
var http = require('http').Server(app);
var io = require('socket.io')(http);

module.exports.app = app;
module.exports.fs = fs;
module.exports.vm = vm;
module.exports.http = http;
module.exports.io = io;

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
app.get('/main.js', function(req, res) {
    res.sendFile(__dirname + "/public/main.js");
});
app.get('/styles.css', function(req, res) {
    res.sendFile(__dirname + "/public/styles.css");
});

var options = {
	numOfTanks: 4,
	maxTankSpeed: 1,
	friendlyFire: false,
	port: 8001
};


//create new game
var Game = require('./src/game');
new Game("maps/squares.json", options);





