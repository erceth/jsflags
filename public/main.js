window.onload = function() {

    var canvas = document.getElementById("canvas");
    var screen = canvas.getContext("2d");
    var socket = io();

    var dimensions = {};

    socket.on("init", function(initInfo) {
        dimensions = initInfo.dimensions;
        screen.canvas.width = dimensions.width;
        screen.canvas.height = dimensions.height;

        var buttonWrapper = $("#button-wrapper");

        for (var i = 0; i < initInfo.availablePlayers.length; i++) {
        	var button = $("<span class='player-button' data-player-number='" + initInfo.availablePlayers[i].playerNumber + "' style='background-color:" + initInfo.availablePlayers[i].playerColor + " '>Player Number " + initInfo.availablePlayers[i].playerNumber + "</span>").click(function() {
        		var playerNumber = $(this).data("player-number");
        		socket.emit("playerSelected", playerNumber);
        	});
        	buttonWrapper.append(button);

        	// button.click(function() {
        	// 	var index = i;
        	// 	console.log(initInfo.availablePlayers[index]);
        	// });
        }
        //TODO: add observer
    });


    socket.on('refresh', function(gameState) {
        screen.clearRect(0, 0, dimensions.width, dimensions.height);

        for (var i = 0; i < gameState.bodies.length; i++) {
            //TODO: handle different kind of bodies
            var o = gameState.bodies[i];
            var color = (o.color) ? o.color : "black";
            screen.fillStyle = color;
            screen.fillRect(o.position.x, o.position.y, o.size.height, o.size.width);
        }

    });


};



// setInterval(controls, 1000 / 60);

//     function controls() {
//         if (keyboard.isDown(keyboard.KEYS.LEFT)) {
//             socket.emit("keyboard", -1);
//         }
//         if (keyboard.isDown(keyboard.KEYS.RIGHT)) {
//             socket.emit("keyboard", 1);
//         }

//     }



//var Keyboarder = function() {
    //     var keyState = {};
    //     window.onkeydown = function(e) {
    //         keyState[e.keyCode] = true;
    //     };

    //     window.onkeyup = function(e) {
    //         keyState[e.keyCode] = false;
    //     };

    //     this.isDown = function(keyCode) {
    //         return keyState[keyCode] === true;
    //     };

    //     this.KEYS = {
    //         LEFT: 37,
    //         RIGHT: 39,
    //         SPACE: 32
    //     };
    // };

    // var keyboard = new Keyboarder();

// $('form').submit(function() {
//         socket.emit('chat message', $('#m').val());
//         $('#m').val('');
//         return false;
//     });