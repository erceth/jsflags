var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var vm = require('vm');

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
app.get('/main.js', function(req, res) {
    res.sendFile(__dirname + "/public/main.js");
});
app.get('/styles.css', function(req, res) {
    res.sendFile(__dirname + "/public/styles.css");
});

vm.runInThisContext(fs.readFileSync(__dirname + "/test.js")); //include

// var gameState = {
// 	map: map,
// 	tanks: []
// }

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
		this.Players.push(new Player(this.map.bases[i]));
	}

	//add things to gameState
	this.gameState.dimensions = this.map.dimensions;
	this.createBodies();
	//TODO: add bounderies

	//loop
	setInterval(update, 1000 / 60);  //denom is fps
	var self = this;
	function update() { //TODO: push update function into prototype object
		self.update();
		io.emit("refresh", self.gameState);
	}

	self.createConnections();

	self.initConnection();

	//loop through bodies
	  //remove bodies coliding with bullets



	
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
			this.gameState.bodies.push(new Boundery(this.map.bounderies[k]));
		}
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


var Player = function(playerData) {
	this.playerNumber = playerData.playerNumber;
	this.playerColor = playerData.color;
	this.tanks = [];

	for (var i = 0; i < options.numOfTanks; i++) {
		this.tanks.push(new Tank(playerData, i));
	}


};

Player.prototype = {
	getPlayerColor: function() {
		return this.playerColor;
	},
	getPlayerNumber: function() {
		return this.playerNumber;
	},
	giveOrders: function(orders) {
		for (var i = 0; i < orders.tankNumbers.length; i++) {
			var tankNumber = parseInt(orders.tankNumbers[i], 10);
			if (tankNumber || tankNumber === 0 && tankNumber < this.tanks.length && tankNumber >= 0) {
				this.tanks[tankNumber].giveOrders({speed: orders.speed, angleVel: orders.angleVel});
			}
		}
	}
};


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
		this.player.giveOrders(orders);
	}
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
	this.angleVel = 0; //-1 to 1
	this.alive = true;
};

Tank.prototype = {
	update: function() {
		this.angle += this.angleVel;
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

		this.positionStep.x = (Math.cos(radians) * this.speed + this.position.x);
		this.positionStep.y = (Math.sin(radians) * this.speed + this.position.y);

		//prevent falling
		if (this.positionStep.x > 0 && this.positionStep.x + this.size.width < 900) { //TODO: import map.size
			this.position.x = this.positionStep.x;
		}
		if (this.positionStep.y > 0 && this.positionStep.y + this.size.height < 900) {
			this.position.y = this.positionStep.y;
		}
	},
	giveOrders: function(order) {
		this.angleVel = order.angleVel;
		this.speed = order.speed;
	},
	die: function() {
		//set alive to false
		//set position to home
		//set speed and angleVel to 0
	}
};


var Boundery = function(bounderyData) {
	this.type = "boundery";
	this.position = bounderyData.position;
	this.size = bounderyData.side;
};

Boundery.prototype = {
	update: function() {
		//nothing to update
	},
	die: function() {
		//destroy boundry
	}

};

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


function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

