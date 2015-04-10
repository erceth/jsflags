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

app.get('/img/red_tank.png', function(req, res) {
    res.sendFile(__dirname + "/img/red_tank.png");
});
app.get('/img/blue_tank.png', function(req, res) {
    res.sendFile(__dirname + "/img/blue_tank.png");
});
app.get('/img/green_tank.png', function(req, res) {
    res.sendFile(__dirname + "/img/green_tank.png");
});
app.get('/img/purple_tank.png', function(req, res) {
    res.sendFile(__dirname + "/img/purple_tank.png");
});

app.get('/img/red_basetop.png', function(req, res) {
    res.sendFile(__dirname + "/img/red_basetop.png");
});
app.get('/img/blue_basetop.png', function(req, res) {
    res.sendFile(__dirname + "/img/blue_basetop.png");
});
app.get('/img/green_basetop.png', function(req, res) {
    res.sendFile(__dirname + "/img/green_basetop.png");
});
app.get('/img/purple_basetop.png', function(req, res) {
    res.sendFile(__dirname + "/img/purple_basetop.png");
});

app.get('/img/red_flag.png', function(req, res) {
    res.sendFile(__dirname + "/img/red_flag.png");
});
app.get('/img/blue_flag.png', function(req, res) {
    res.sendFile(__dirname + "/img/blue_flag.png");
});
app.get('/img/green_flag.png', function(req, res) {
    res.sendFile(__dirname + "/img/green_flag.png");
});
app.get('/img/purple_flag.png', function(req, res) {
    res.sendFile(__dirname + "/img/purple_flag.png");
});

app.get('/img/grass.png', function(req, res) {
    res.sendFile(__dirname + "/img/grass(100x100).png");
});

app.get('/img/wall.png', function(req, res) {
    res.sendFile(__dirname + "/img/wall.png");
});


//TODO allow these to be set by commandline args
var options = {
	numOfTanks: 4,
	maxTankSpeed: 1,
	friendlyFireSafe: true,
	port: 8003,
	maxBulletSpeed: 5,
	respawnTime: 10000,
	flagRepawnWait: 10000,
	pointsForCarry: 1,
	pointsForCapture: 100,
	resetOnJoin: true,
	maxFireFrequency: 5000
};

module.exports.options = options;


//create new game
var Game = require('./src/game');
//var map = "maps/squares.json";
var map = "maps/plain_field.json"
//var map = "maps/one_vs_one.json"
var g = new Game(map);

module.exports.Game = g;





