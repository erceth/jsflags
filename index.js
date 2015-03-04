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

var gameState = [{
    name: "block",
    position: {
        x: 30,
        y: 30
    },
    size: {
        height: 40,
        width: 40
    }
}];

setInterval(update, 1000 / 60);

function update() {
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