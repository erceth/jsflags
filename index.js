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
};

var gameState = {
	map: map,
	tanks: []
}

var Tank = function() {
	this.size = {height: 15, width: 15};
	this.position = {x: 200, y: 200};
	this.positionStep = {x: 0, y: 0};
	this.angle = 90; //0 to 359
	this.speed = .1; //0 to 1
	this.angelVel = 1; //-1 to 1
};

Tank.prototype = {
	update: function() {
		this.angle += this.angelVel;
		//radians = degrees * (pi/180)
		var radians = this.angle * (Math.PI/180);
		this.positionStep.x += Math.cos(radians);
		this.positionStep.y += Math.sin(radians);

		console.log(this.positionStep.x, this.positionStep.y);
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


setInterval(update, 1000 / 60);

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


var map = JSON.parse(fs.readFileSync('maps/squares.json', 'utf8'))
	console.log(map);