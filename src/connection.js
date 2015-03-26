var globals = require('../index');
var io = globals.io;


var Connection = function(player, game) {
	this.connection = io.of("player" + player.playerNumber);
	this.player = player;
	this.available = true;
	this.num = 0;
	this.game = game;
	this.dynamicState = {
		tanks: [] //tank pool
	};

	var self = this;
	this.dynamicStateCoolDown = false;


	this.connection.on("connect", function(socket) {
		self.num++;
		if (!self.isAvailable()) { //only allow one person per connection
			console.log("connection already being used");
			socket.disconnect("connection already being used"); //TODO: not sure if this works //set socket.connect = false ?
			return;
		}
		console.log("someone connected");
		self.available = false;
		socket.on("disconnect", function() {
			console.log("goodbye y'all");
			self.available = true;
		});
		socket.emit("connected", {});

		socket.on("move", function(orders) {
			self.moveTanks(orders);
		});
		socket.on("fire", function(orders) {
			self.fireTanks(orders);
		});

		

		socket.on("getDynamicState", function() { //TODO: limit dynamicState rate
			// if (self.dynamicStateCoolDown) { return; }
			// self.dynamicStateCoolDown = true;
			// setTimeout(function() {
			// 	self.dynamicStateCoolDown = false;
			// }, 500);

			// var b;
			// for (var i = 0, max = self.game.gameState.tanks.length; i < max; i++) {
			// 	b = self.game.gameState.tanks[i];
			// 	if (self.dynamicState.tanks[i]) { //if already object there, reuse it.
			// 		self.dynamicState.tanks[i].type = b.type;
			// 		self.dynamicState.tanks[i].position = b.position;
			// 		self.dynamicState.tanks[i].color = b.color;
			// 		self.dynamicState.tanks[i].dead = b.dead;
			// 		self.dynamicState.tanks[i].tankNumber = b.tankNumber;
			// 		self.dynamicState.tanks[i].angle = b.angle;
			// 	} else {
			// 		self.dynamicState.tanks[i] = { //otherwise create it.
			// 			type: b.type,
			// 			position: b.position,
			// 			color: b.color,
			// 			dead: b.dead,
			// 			tankNumber: b.tankNumber,
			// 			angle: b.angle	
			// 		};
			// 	}
			// }
			socket.emit("returnDynamicState", self.dynamicState);
			//socket.emit("returnDynamicState", {});
		});
			
		

		socket.on("getStaticData", function() { //add  && b.type !== "boundary"
			var staticPlayerData = [];
			var p = false;
			for(var i = 0; i < self.game.Players.length; i++) {
				p = self.game.Players[i];
				staticPlayerData.push({
					playerColor: p.playerColor,
					base: p.base,
					numberOfTanks: p.tanks.length
				});
			}

			socket.emit("returnStaticData", {staticPlayerData: staticPlayerData});
		});
		
	});
};

Connection.prototype = {
	isAvailable: function() {
		return !!this.available;
	},
	setNotAvailable: function() {
		this.available = false;
	},
	setIsAvailable: function() {
		this.available = true;
	},
	getNamespace: function() {
		return this.connection.name;
	},
	getPlayerColor: function() {
		return this.player.getPlayerColor();
	},
	getPlayerNumber: function() {
		return this.player.getPlayerNumber();
	},
	moveTanks: function(orders) {
		this.player.moveTanks(orders);
	},
	fireTanks: function(orders) {
		this.player.fireTanks(orders);	
	}
};

module.exports = Connection;
