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

var map = {
	name: "squares",
	dimensions: {width: 900, height: 900}
};

var options = {
	numOfTanks: 1,
	maxTankSpeed: 1,
	friendlyFire: false
};

var gameState = {
	map: map,
	tanks: []
}

var Game = function() {

	//load and create map object
	//create bounderies
	//create grass
	//create players
	  //player creates their tanks
	  //place tanks randomly
	//set player home back location




};

Game.prototype = {
	//loop through bodies
	  //remove bodies coliding with bullets

};


var Player


var Tank = function() {
	this.size = {height: 15, width: 15};
	this.position = {x: 100, y: 100};
	this.positionStep = {x: 0, y: 0};
	this.angle = 90; //0 to 359
	this.speed = .1; //-1 to 1
	this.angelVel = -1; //-1 to 1
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

		console.log(this.angle, radians);		

		this.positionStep.x = Math.cos(radians) + this.position.x;
		this.positionStep.y = Math.sin(radians) + this.position.y;
		
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
for (var i = 0; i < options.numOfTanks; i++) {
	gameState.tanks.push(new Tank);
}

function updateTanks() {
	for(var i = 0; i < gameState.tanks.length; i++) {
		gameState.tanks[i].update();
	}
}


setInterval(update, 1000 / 30);  //denom is fps

function update() {
	updateTanks();
    io.emit("refresh", gameState);
}

io.on("connection", function(socket) {
    console.log("a user connected");
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    socket.on("keyboard", function(position) {
        gameState[0].position.x = gameState[0].position.x + position;
    });
});


function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

var map = JSON.parse(fs.readFileSync('maps/squares.json', 'utf8'))
	console.log(map);