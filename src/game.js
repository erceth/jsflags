

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
		bodies:[]
	};
	this.connections = [];
	this.map = JSON.parse(fs.readFileSync(map, 'utf8')); //get map


	//create players
	for (var i = 0; i < this.map.bases.length; i++) {
		this.Players.push(new Player({ base: this.map.bases[i], options: options}));
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
	

	self.createConnections();

	self.initConnection();

	



	
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
	}

};


module.exports = Game;
