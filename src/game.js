

var Player = require('./player');
var Boundary = require('./boundary');
var Connection = require('./connection');
var globals = require('../index');

var app = globals.app;
var fs = globals.fs;
var vm = globals.vm;
var http = globals.http;
var io = globals.io;


var Game = function(map, options) {
	http.listen(options.port, function() {
	    console.log('listening on *:8001');
	});

	//variables
	this.Players = [];
	this.gameState = {
		bodies:[],
		bullets:[]
	};
	this.connections = [];
	this.map = JSON.parse(fs.readFileSync(map, 'utf8')); //get map


	//create players
	for (var i = 0; i < this.map.bases.length; i++) {
		this.Players.push(new Player({ base: this.map.bases[i], options: options, game: this}));
	}

	var self = this;

	//add things to gameState
	this.gameState.dimensions = this.map.dimensions;



	this.createBodies();

	//loop
	setInterval(function () {
		self.update();
		io.emit("refresh", self.gameState);
	}, 1000 / 60);  //denom is fps

	self.update();
	

	self.createConnections();

	self.initConnection();

	
};


Game.prototype = {
	update: function() {
		var b1 = {}, b2 = {}, i = 0, j = 0;
		for (i = 0; i < this.gameState.bodies.length; i++) {
			var okToMoveX = true, okToMoveY = true; //reset
			b1 = this.gameState.bodies[i];
			b1.calculate();
			for (var j = 0; j < this.gameState.bodies.length; j++) {
				b2 = this.gameState.bodies[j];
				if (b1 === b2) {continue;}
				if (b1.type === "tank" && b2.type === "tank" || b2.type === "boundary") { 

					// if(b1.type === "tank" && b1.color === "red" && b1.tankNumber === 1 && b2.type === "tank" && b2.color === "red" && b2.tankNumber === 0) {console.log(b1.positionStep.x, b2.position.x + b2.size.width );}
					var b1Right = b1.positionStep.x - (-b1.size.width); //stupid javascript
					var b1Left = b1.positionStep.x;
					
					var b2Right = b2.position.x - (-b2.size.width);
					var b2Left = b2.position.x;

					var b1Top = b1.positionStep.y;
					var b1Bottom = b1.positionStep.y - (-b1.size.height);

					var b2Top = b2.position.y;
					var b2Bottom = b2.position.y - (-b2.size.height);

					if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) { 
						if (this.color === "purple" && this.tankNumber === 1) {console.log(b1Right, b2Left, b1Left, b2Right, b1Top, b2Bottom, b1Bottom, b2Top);}
						okToMoveX = false;
						okToMoveY = false;
					}

					if (b1Right > this.gameState.dimensions.width || b1Left < 0) {
						okToMoveX = false;
					}

					if (b1Bottom > this.gameState.dimensions.height || b1Top < 0) {
						okToMoveY = false;
					}


				}
				//flag

			}

			if (okToMoveX) {
				b1.moveX();
			}
			if (okToMoveY) {
				b1.moveY();
			}
		}



		/*
		loop body
		get calculated move
		loop all bodies again
		checkagainst diff types
			set states in objects
		}
		move
		}
		filter any dead bullets
		*/

	},
	createBodies: function() {
		for (var i = 0; i < this.Players.length; i++) {
			for (var j = 0; j < this.Players[i].tanks.length; j++) {
				this.gameState.bodies.push(this.Players[i].tanks[j]);
			}
		}
		for (var k = 0; k < this.map.boundaries.length; k++) {
			this.gameState.bodies.push(new Boundary(this.map.boundaries[k]));
		}
		//create flags
	},
	createConnections: function () {
		for (var j = 0; j < this.Players.length; j++) {
			this.connections.push(new Connection(this.Players[j]));
		}

	},
	availableConnections: function() {
		var availableConnections = [];
		for (var i = 0; i < this.connections.length; i++) {
			if (this.connections[i].isAvailable()) {
				availableConnections.push({namespace: this.connections[i].getNamespace(), playerColor: this.connections[i].getPlayerColor(), playerNumber: this.connections[i].getPlayerNumber()});
			}
		}
		return availableConnections;
	},
	initConnection: function() {
		var self = this;
		//connect on default namespace
		io.on("connection", function(socket) {
		    //send map info and available players
		    io.emit("init", { //TODO: set this on interval to refresh which players are taken
		    	name: self.map.name,
		    	dimensions: self.map.dimensions,
		    	availableConnections: self.availableConnections()
		    });

		    //DELETE?
		 //    //listen for which player is selected
		 //    socket.on("playerSelected", function(playerNamespace) {
			// 	console.log(playerNamespace);
			// });

			// console.log(playerNamespace + "selected");
		});
	},
	addBullet: function(bullet) {
		this.gameState.bullets.push(bullet);
	}

};


module.exports = Game;
