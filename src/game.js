var process = require("child_process");

var Connection = require('./connection');
var Player = require('./player');
var Boundary = require('./boundary');
var globals = require('../index');

var app = globals.app;
var fs = globals.fs;
var vm = globals.vm;
var http = globals.http;
var io = globals.io;


var Game = function(map, options) {
	this.options = options
	http.listen(this.options.port, function() {
	    console.log('listening on *:8001');
	});

	//variables
	this.Players = [];
	this.gameState = {
		tanks:[],
		boundaries:[],
		bullets:[]
	};
	this.connections = [];
	this.map = JSON.parse(fs.readFileSync(map, 'utf8')); //get map


	//create players
	for (var i = 0; i < this.map.bases.length; i++) {
		this.Players.push(new Player({ base: this.map.bases[i], options: this.options, game: this}));
	}

	var self = this;

	//add things to gameState
	this.gameState.dimensions = this.map.dimensions;



	this.createBodies();


	function startTheLoop() {
		return setInterval(function () {
			self.update();
			io.emit("refresh", self.gameState);
		}, 1000 / 60);  //denom is fps
	}

	//this may be unnecesary
	var intervalId = startTheLoop();
	// setInterval(function() {
	// 	if (process.memoryUsage().heapUsed > 30000000) {
	// 		console.log("heap used: " + process.memoryUsage().heapUsed + ". pausing");
	// 		clearInterval(intervalId);
	// 		setTimeout(function() {
	// 			intervalId = startTheLoop();
	// 		}, 1000);
	// 	}
	// }, 3000);

	// setInterval(function () {
	//   heapdump.writeSnapshot()
	// }, 1000 * 20);


	self.createConnections();

	self.initConnection();

	
};


Game.prototype = {
	update: function() {
		//loops tanks
		var b1, b2, i = this.gameState.tanks.length;
		while((i-=1) >= 0) {
			var okToMoveX = true, okToMoveY = true;
			b1 = this.gameState.tanks[i];
			b1.calculate();
			j = i;
			while((j-=1) >= 0) {
				if (i===j) {continue;}
				b2 = this.gameState.tanks[j];
				var b1Right = b1.positionStep.x + b1.size.width;
				var b1Left = b1.positionStep.x;
				
				var b1Top = b1.positionStep.y;
				var b1Bottom = b1.positionStep.y + b1.size.height;

				var b2Right = b2.position.x + b2.size.width;
				var b2Left = b2.position.x;

				var b2Top = b2.position.y;
				var b2Bottom = b2.position.y + b2.size.height;

				if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) { 
					okToMoveX = false;
					okToMoveY = false;
					break;
				}
				if (b1Right > this.gameState.dimensions.width || b1Left < 0) {
					okToMoveX = false;
				}
				if (b1Bottom > this.gameState.dimensions.height || b1Top < 0) {
					okToMoveY = false;
				}
			}
			j=this.gameState.boundaries.length;
			while((j-=1) >= 0) {
				b2 = this.gameState.boundaries[j];
				
				b2Right = b2.position.x + b2.size.width;
				b2Left = b2.position.x;

				b2Top = b2.position.y;
				b2Bottom = b2.position.y + b2.size.height;

				if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) { 
					okToMoveX = false;
					okToMoveY = false;
					break;
				}
			}
			if (okToMoveX) {
				b1.moveX();
			}
			if (okToMoveY) {
				b1.moveY();
			}
		}

		if(this.gameState.bullets.length > 0) {
			i = this.gameState.bullets.length;
			while((i-=1) >= 0) {
				b1 = this.gameState.bullets[i];
				b1.calculate();
				j = this.gameState.tanks.length;
				while((j-=1) >= 0) {
					b2 = this.gameState.tanks[j];
					b1Right = b1.positionStep.x + b1.size.width;
					b1Left = b1.positionStep.x;
					
					b1Top = b1.positionStep.y;
					b1Bottom = b1.positionStep.y + b1.size.height;

					b2Right = b2.position.x + b2.size.width;
					b2Left = b2.position.x;

					b2Top = b2.position.y;
					b2Bottom = b2.position.y + b2.size.height;

					if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) { 
						b1.die();
						b2.die();
						break;
					}
				}
				b1.moveX();
				b1.moveY();
			}
			//filter out dead bullets
			this.gameState.bullets = this.gameState.bullets.filter(function(bullet) {
				return !bullet.dead;
			});
		}
		



		// var b1, b2, i = this.gameState.bodies.length-1, j;
		// while(i-=1) { 
		// 	var okToMoveX = true, okToMoveY = true; //reset
		// 	b1 = this.gameState.bodies[i];
		// 	b1.calculate();
		// 	j = i;
		// 	while(j-=1) {
		// 		b2 = this.gameState.bodies[j];
		// 		if (b1 === b2) {continue;}
		// 		var b1Right = b1.positionStep.x + b1.size.width;
		// 		var b1Left = b1.positionStep.x;
				
		// 		var b2Right = b2.position.x + b2.size.width;
		// 		var b2Left = b2.position.x;

		// 		var b1Top = b1.positionStep.y;
		// 		var b1Bottom = b1.positionStep.y + b1.size.height;

		// 		var b2Top = b2.position.y;
		// 		var b2Bottom = b2.position.y + b2.size.height;
		// 		if (b1.type === "tank" && (b2.type === "tank" || b2.type === "boundary")) {

		// 			// if(b1.type === "tank" && b1.color === "red" && b1.tankNumber === 1 && b2.type === "tank" && b2.color === "red" && b2.tankNumber === 0) {console.log(b1.positionStep.x, b2.position.x + b2.size.width );}
					

		// 			if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) { 
		// 				okToMoveX = false;
		// 				okToMoveY = false;
		// 			}

		// 			if (b1Right > this.gameState.dimensions.width || b1Left < 0) {
		// 				okToMoveX = false;
		// 			}

		// 			if (b1Bottom > this.gameState.dimensions.height || b1Top < 0) {
		// 				okToMoveY = false;
		// 			}

		// 		}
		// 		if (b1.type === "bullet" && b2.type === "tank") {
		// 			if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) { 
		// 				if (b1.isFriendly(b2) && this.options.friendlyFireSafe) {
		// 					b1.die();
		// 				} else {
		// 					b1.die();
		// 					b2.die();
		// 				}
		// 			}
		// 		}


		// 		if (b1.type === "bullet") {

		// 			//if bullet left arena
		// 			if (b1Right > this.gameState.dimensions.width || b1Left < 0) {
		// 				b1.die();
		// 			}
		// 			if (b1Bottom > this.gameState.dimensions.height || b1Top < 0) {
		// 				b1.die();
		// 			}
		// 		}
		// 		//flag

		// 	}

		// 	if (okToMoveX) {
		// 		b1.moveX();
		// 	}
		// 	if (okToMoveY) {
		// 		b1.moveY();
		// 	}
		// }

		// //filter out dead bullets
		// this.gameState.bodies = this.gameState.bodies.filter(function(body) {
		// 	return (body.type !== "bullet") || !body.dead;
		// });




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
				this.gameState.tanks.push(this.Players[i].tanks[j]);
			}
		}
		for (var k = 0; k < this.map.boundaries.length; k++) {
			this.gameState.boundaries.push(new Boundary(this.map.boundaries[k]));
		}
		//create flags
	},
	createConnections: function () {
		for (var j = 0; j < this.Players.length; j++) {
			this.connections.push(new Connection(this.Players[j], this));
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
