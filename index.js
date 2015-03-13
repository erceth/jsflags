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


// var gameState = {
// 	map: map,
// 	tanks: []
// }



var Game = require('./game');















var Bullet = function(bulletData) {

};

Bullet.prototype = {
	update: function() {

	},
	die: function() {

	}

};

var Flag = function(flagData) {

};

Flag.prototype = {
	update: function() {

	},
	die: function() { //reset
		
	}

};




//create tanks
// for (var i = 0; i < options.numOfTanks; i++) {
// 	gameState.tanks.push(new Tank);
// }

// function updateTanks() {
// 	for(var i = 0; i < gameState.tanks.length; i++) {
// 		gameState.tanks[i].update();
// 	}
// }


//

var options = {
	numOfTanks: 4,
	maxTankSpeed: 1,
	friendlyFire: false,
	port: 8001
};


new Game("maps/squares.json", options);

// function update() {
// 	updateTanks();
    
// }

// io.on("connection", function(socket) {
//     console.log("a user connected");
//     io.emit("init", );

//     socket.on('disconnect', function() {
//         console.log('user disconnected');
//     });
//     socket.on("keyboard", function(position) {
//         gameState[0].position.x = gameState[0].position.x + position;
//     });
// });




