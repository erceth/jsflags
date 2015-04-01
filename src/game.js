

var Player = require('./player');
var Boundary = require('./boundary');
var Flag = require('./flag');
var globals = require('../index');
var Tank = require('./tank');

var app = globals.app;
var fs = globals.fs;
var vm = globals.vm;
var http = globals.http;
var io = globals.io;
var options = globals.options;

var Game = function(map) {
	http.listen(options.port, function() {
	    console.log('listening on *:8001');
	});

	//variables
	this.Players = [];
	this.gameState = {
		tanks:[],
		boundaries:[],
		bullets:[],
		flags: []
	};
	this.map = JSON.parse(fs.readFileSync(map, 'utf8')); //get map

	//create players
	for (var i = 0; i < this.map.bases.length; i++) {
		this.Players.push(new Player(this.map.bases[i]));
	}

	var self = this;


	this.createBodies();

	//connections on default namespace
	io.on("connection", function(socket) {
		var modifiedPlayers = [];
		for (var i = 0; i < self.Players.length; i++) {
			modifiedPlayers.push({
				playerColor: self.Players[i].playerColor,
				playerNumber: self.Players[i].playerNumber,
				namespace: self.Players[i].namespace,
				base: self.Players[i].base
			});

		}
		io.emit("init", {dimensions: self.map.dimensions, players: modifiedPlayers, numOfTanks: options.numOfTanks });
	});

	setInterval(function () {
		self.update();
		io.emit("refresh", self.gameState);
	}, 1000 / 60);  //denom is fps


	//a part of tank prototype
	Tank.prototype.addBulletToGame = function(bullet) {
		self.gameState.bullets.push(bullet);
	};
	
};


Game.prototype = {
	update: function() {
		//TANKS
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
				if (b1Right > this.map.dimensions.width || b1Left < 0) {
					okToMoveX = false;
				}
				if (b1Bottom > this.map.dimensions.height || b1Top < 0) {
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
		//BULLETS
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
				k=this.gameState.boundaries.length;
				while((k-=1) >= 0) {
					b2 = this.gameState.boundaries[k];
					
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
				if (b1Right < 0 || b1Left > this.map.dimensions.width || b1Bottom < 0 || b1Top > this.map.dimensions.height) {
					b1.die();
				}
				b1.moveX();
				b1.moveY();
			}

			//filter out dead bullets
			this.gameState.bullets = this.gameState.bullets.filter(function(bullet) {
				return !bullet.dead;
			});
		}
		var tank, flag;
		i = this.gameState.flags.length;
		while ((i-=1) >= 0) {
			flag = this.gameState.flags[i];
			j = this.gameState.tanks.length;
			while ((j-=1) >= 0) {
				tank = this.gameState.tanks[j];
				if (tank.dead) {continue;}
				var flagRight = flag.position.x + flag.size.width;
				var flagLeft = flag.position.x;
				
				var flagTop = flag.position.y;
				var flagBottom = flag.position.y + flag.size.height;

				var tankRight = tank.position.x + tank.size.width;
				var tankLeft = tank.position.x;

				var tankTop = tank.position.y;
				var tankBottom = tank.position.y + tank.size.height;
				if (! (flagRight < tankLeft || flagLeft > tankRight || flagTop > tankBottom || flagBottom < tankTop) ) { 
					if (tank.color !== flag.color) {
						flag.followThisTank(tank);
					} else {
						flag.die();
					}
					break;
				}
			}
			flag.update();

			// flag = this.gameState.flags[i];
			// flag.update();
			// if (flag.hasTank()) {
			// 	continue;
			// }
			// j = this.gameState.tanks.length;
			// while ((j-=1) >= 0) {
			// 	tank = this.gameState.tanks[j];
			// 	b1Right = flag.position.x + flag.size.width;
			// 	b1Left = flag.position.x;
				
			// 	b1Top = flag.position.y;
			// 	b1Bottom = flag.position.y + flag.size.height;

			// 	b2Right = tank.position.x + tank.size.width;
			// 	b2Left = tank.position.x;

			// 	b2Top = tank.position.y;
			// 	b2Bottom = tank.position.y + tank.size.height;

			// 	//console.log(b1Right, b1Left, b1Top, b1Bottom, b2Right, b2Left, b2Top, b2Bottom);

			// 	if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) { 
			// 		if (flag.color === tank.color) {
			// 			flag.die();
			// 		} else {
			// 			flag.followThisTank(tank);
			// 		}
			// 	}
			// }

		}


		//FLAGS
		// i = this.gameState.flags.length;
		// while((i-=1) >= 0) {
		// 	b1 = this.gameState.flags[i];
		// 	b1.update();
		// 	if (b1.hasTank()) {continue;}
		// 	j = this.gameState.tanks.length;
		// 	while((j-=1) >= 0) {
		// 		b1Right = b1.position.x + b1.size.width;
		// 		b1Left = b1.position.x;

		// 		b1Top = b1.position.y;
		// 		b1Bottom = b1.position.y + b1.size.height;


		// 		b2 = this.gameState.tanks[j];
		// 		b2Right = b2.positionStep.x + b2.size.width;
		// 		b2Left = b2.positionStep.x;
				
		// 		b2Top = b2.positionStep.y;
		// 		b2Bottom = b2.positionStep.y + b2.size.height;

		// 		if (! (b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top) ) {
		// 			if (b1.color !== b2.color ) {
		// 				b1.followThisTank(b2);
		// 			} else if (b1.color === b2.color) { console.log("reset");
		// 				b1.die(); //reset the flag
		// 			}
		// 		}
		// 	}
		// }
	},
	createBodies: function() {
		for (var i = 0; i < this.Players.length; i++) {
			for (var j = 0; j < this.Players[i].tanks.length; j++) {
				this.gameState.tanks.push(this.Players[i].tanks[j]);
				//TODO: add bullet function
			}

			this.gameState.flags.push(new Flag(this.Players[i].playerColor, this.Players[i].base.position ));
		}
		for (var k = 0; k < this.map.boundaries.length; k++) {
			this.gameState.boundaries.push(new Boundary(this.map.boundaries[k]));
		}
	}

};


module.exports = Game;
