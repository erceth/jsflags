window.onload = function() {

    var canvas = document.getElementById("canvas");
    var screen = canvas.getContext("2d");
    var socket = io();

    var dimensions = {};

    var connected = false;

    var tankImg = {
    	red:   new Image(15,15),
    	blue:  new Image(15,15),
    	green: new Image(15,15),
    	purple:new Image(15,15)
    };
    tankImg.red.src = "img/red_tank.png";
    tankImg.blue.src = "img/blue_tank.png";
    tankImg.green.src = "img/green_tank.png";
    tankImg.purple.src = "img/purple_tank.png";

    socket.on("init", function(initData) {
    	if (connected) {
    		return;
    	}
    	connected = true;
    	
        dimensions = initData.dimensions;
        screen.canvas.width = dimensions.width;
        screen.canvas.height = dimensions.height;

        var buttonWrapper = $("#button-wrapper");
        buttonWrapper.empty();

        for (var i = 0; i < initData.availableConnections.length; i++) {
        	var button = $("<span class='player-button' data-connection-namespace='" + initData.availableConnections[i].namespace + "' style='background-color:" + initData.availableConnections[i].playerColor + " '>Player Number " + initData.availableConnections[i].playerNumber + "</span>").click(function() {
        		var playerNumber = $(this).data("connection-namespace");
        		//TODO: connect to namespace
        		//TODO: add manual controls
        	});
        	buttonWrapper.append(button);

        }
        buttonWrapper.append("<span class='player-button' style='background-color:#666'>Observer</span>").click(function() {
        	$("#selectionBoard").fadeOut(3500);
        });
    });


    socket.on('refresh', function(gameState) {
        screen.clearRect(0, 0, dimensions.width, dimensions.height);

        for (var i = 0; i < gameState.bodies.length; i++) {
            //TODO: handle different kind of bodies
            var o = gameState.bodies[i];
            if (o.type === "tank") {
            	var t = tankImg[o.color];
	            t.height = o.size.height;
	            t.width = o.size.width;// console.log(o);
				//screen.drawImage(t, o.position.x, o.position.y, t.height, t.width);            
	            drawRotatedImage(t, o.position.x, o.position.y, o.radians, screen);
            } else {
            	var color = (o.color) ? o.color : "black";
	            screen.fillStyle = color;
	            screen.fillRect(o.position.x, o.position.y, o.size.height, o.size.width);
            }
        }

    });


};

function drawRotatedImage(img, x, y, radians, context) {
	// save the current co-ordinate system 
	// before we screw with it
	context.save(); 
 
	// move to the middle of where we want to draw our image
	context.translate(x + img.width/2, y + img.height/2);
 
	// rotate around that point
	context.rotate(radians);
 
	// draw it up and to the left by half the width
	// and height of the image 
	context.fillRect(0, 0, 1, 1); //puts a wee dot on the origin
	context.drawImage(img, -img.width/2, -img.width/2, img.height, img.width);

	// and restore the co-ords to how they were when we began
	context.restore(); 
}



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