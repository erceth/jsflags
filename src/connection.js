var globals = require('../index');
var io = globals.io;

var Connection = function(player) {
	this.connection = io.of("player" + player.playerNumber);
	this.player = player;
	this.available = true;
	this.num = 0;
	var self = this;


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
