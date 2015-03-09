var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
app.get('/main.js', function(req, res) {
    res.sendFile(__dirname + "/public/main.js");
});


http.listen(8001, function() {
    console.log('listening on *:8001');
});

// var gameState = {
// 	map: map,
// 	tanks: []
// }

var Game = function(map) {
	this.Players = [];
	this.map = JSON.parse(fs.readFileSync(map, 'utf8'));
	this.gameState = {
		bodies:[]
	};

	for (var i = 0; i < this.map.bases.length; i++) {
		this.Players.push(new Player(this.map.bases[i]));
	}

	//add things to gameState
	this.gameState.dimensions = this.map.dimensions;
	this.createBodies();
	//TODO: add bounderies

	//loop
	setInterval(update, 1000 / 2);  //denom is fps
	var self = this;
	function update() {
		self.update();
		io.emit("refresh", self.gameState);
	}

	io.on("connection", function(socket) {
	    console.log("a user connected");
	    var init = {
	    	name: self.map.name,
	    	dimensions: self.map.dimensions
	    };
	    io.emit("init", init);
	});
};

Game.prototype = {
	update: function() {
		for (var i = 0; i < this.Players.length; i++) {
			for (var j = 0; j < this.Players[i].tanks.length; j++) {
				this.Players[i].tanks[j].update();
			}
		}
	},
	createBodies: function() {
		for (var i = 0; i < this.Players.length; i++) {
			for (var j = 0; j < this.Players[i].tanks.length; j++) {
				this.gameState.bodies.push(this.Players[i].tanks[j]);
			}
		}
		for (var k = 0; k < this.map.bounderies.length; k++) {
			this.gameState.bodies.push(this.map.bounderies[k]);
		}

	}

	//loop through bodies
	  //remove bodies coliding with bullets

};


var Player = function(playerData) {
	this.playerNumber = playerData.playerNumber;
	this.playerColor = playerData.color;
	this.tanks = [];

	for (var i = 0; i < options.numOfTanks; i++) {
		this.tanks.push(new Tank(playerData, i));
	}


};

Player.prototype = {

};


var Tank = function(playerData, tankNumber) {
	this.type = "tank"
	this.playerNumber = playerData.playerNumber;
	this.color = playerData.color;
	this.size = {height: 15, width: 15};
	this.tankNumber = tankNumber;
	this.position = {
		x: playerData.position.x - (playerData.size.width / 2) + (this.size.width * this.tankNumber), 
		y: playerData.position.y - 1 // TODO: make rows - (playerData.size.height/ 2) + (this.size.height* )
	};
	this.positionStep = {x: 0, y: 0};
	this.angle = 90; //0 to 359
	this.speed = 0; //-1 to 1
	this.angelVel = 0; //-1 to 1
	this.alive = true;
};

Tank.prototype = {
	update: function() {
		this.angle += this.angelVel;
		this.angle = this.angle % 360;  //prevent angle overflow

		//keep speed within max speed
		if (this.speed > options.maxTankSpeed) {
			this.speed = options.maxTankSpeed;
		}
		if (this.speed < -options.maxTankSpeed) {
			this.speed = -options.maxTankSpeed;
		}

		var radians = this.angle * (Math.PI/180);
		radians = round(radians, 4);

		this.positionStep.x = Math.cos(radians) + this.position.x;
		this.positionStep.y = Math.sin(radians) + this.position.y;

		console.log(radians, Math.sin(radians), this.position.y);
		



		//prevent falling
		if (this.positionStep.x > 0 && this.positionStep.x < 900) {
			this.position.x = this.positionStep.x;
		}
		if (this.positionStep.y > 0 && this.positionStep.y < 900) {
			this.position.y = this.positionStep.y;
		}

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
	friendlyFire: false
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


function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

