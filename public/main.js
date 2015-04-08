/*** GAME SCREEN ***/

var TEXT_SPACING = 15;

function GameScreen() {
	var self = this;
	this.canvas = document.getElementById("canvas");
	this.screen = this.canvas.getContext("2d");
	this.backgroundCanvas = document.getElementById("background");
    this.backgroundScreen = this.backgroundCanvas.getContext("2d");
	this.socket = io();
	this.dimensions = io();
	this.scoreboard = {};
	this.connected = false;
	this.initData = null;

	this.tankImg = {
		red: null,
		blue: null,
		green: null,
		purple: null
	};
    this.flagImg = {
    	red: null,
		blue: null,
		green: null,
		purple: null
    };
    this.wallImg = {};
    this.backgroundImg = {};

    this.loadImages();
    this.init();
    var timesTocheck = 5;
    wait(5, 500, this.areImagesLoadedYet, this, function() {
    	self.fillBackground();
    	self.listen();
    });
    
};

GameScreen.prototype = {
	init: function() {
		var self = this;
		this.socket.on("init", function(initData) {
			if (self.connected) {
				return;
			}
			self.connected = true;
			self.initData = initData;
			self.dimensions = self.initData.dimensions;
			self.scoreboard = self.initData.scoreboard;
			self.canvas.width = self.dimensions.width;
			self.canvas.height = self.dimensions.height;

			self.backgroundCanvas.width = self.dimensions.width;
	        self.backgroundCanvas.height = self.dimensions.height;
		});
	},
	fillBackground: function() {
		//fill grass
		this.backgroundScreen.rect(0, 0, this.dimensions.width, this.dimensions.height);
	    var backgroundPattern = this.backgroundScreen.createPattern(this.backgroundImg.img, "repeat");
	    this.backgroundScreen.fillStyle = backgroundPattern;
	    this.backgroundScreen.fill();

	    //fill scoreboard
        this.backgroundScreen.fillStyle = "black";
	    this.backgroundScreen.fillRect(this.scoreboard.position.x, this.scoreboard.position.y, this.scoreboard.size.width, this.scoreboard.size.height);

	    //fill bases
	    var b, img;
	    for (var i = 0, max = this.initData.players.length; i < max; i++) {
	    	b = this.initData.players[i].base;
	    	img = this.baseImg[this.initData.players[i].playerColor].img;
	    	this.backgroundScreen.drawImage(img, b.position.x - (b.size.width / 2), b.position.y - (b.size.height / 2), b.size.height, b.size.width);
	    }
	},
	areImagesLoadedYet: function() {
		var result = 
		this.tankImg.red.loaded && this.tankImg.blue.loaded && this.tankImg.blue.loaded && this.tankImg.green.loaded && this.tankImg.purple.loaded &&
		this.baseImg.red.loaded && this.baseImg.blue.loaded && this.baseImg.blue.loaded && this.baseImg.green.loaded && this.baseImg.purple.loaded &&
		this.flagImg.red.loaded && this.flagImg.blue.loaded && this.flagImg.blue.loaded && this.flagImg.green.loaded && this.flagImg.purple.loaded &&
		this.wallImg.loaded && this.backgroundImg.loaded;

		return result;
	},
	loadImages: function() {
		var self = this;
		//load tanks
		this.tankImg = {
			red: {img: new Image(15,15), loaded: false}, //TODO: set size from server
	    	blue: {img: new Image(15,15), loaded: false},
	    	green: {img: new Image(15,15), loaded: false},
	    	purple: {img: new Image(15,15), loaded: false}
		};
		this.tankImg.red.img.src = "img/red_tank.png";
		this.tankImg.blue.img.src = "img/blue_tank.png";
		this.tankImg.green.img.src = "img/green_tank.png";
		this.tankImg.purple.img.src = "img/purple_tank.png";
		this.tankImg.red.img.onload = function() { self.tankImg.red.loaded = true; };
		this.tankImg.blue.img.onload = function() { self.tankImg.blue.loaded = true; };
		this.tankImg.green.img.onload = function() { self.tankImg.green.loaded = true; };
		this.tankImg.purple.img.onload = function() { self.tankImg.purple.loaded = true; };

		//load bases
		this.baseImg = {
			red: {img: new Image(100,100), loaded: false}, //TODO: set size from server
	    	blue: {img: new Image(100,100), loaded: false},
	    	green: {img: new Image(100,100), loaded: false},
	    	purple: {img: new Image(100,100), loaded: false}
		};
		this.baseImg.red.img.src = "img/red_basetop.png";
		this.baseImg.blue.img.src = "img/blue_basetop.png";
		this.baseImg.green.img.src = "img/green_basetop.png";
		this.baseImg.purple.img.src = "img/purple_basetop.png";
		this.baseImg.red.img.onload = function() { self.baseImg.red.loaded = true; };
		this.baseImg.blue.img.onload = function() { self.baseImg.blue.loaded = true; };
		this.baseImg.green.img.onload = function() { self.baseImg.green.loaded = true; };
		this.baseImg.purple.img.onload = function() { self.baseImg.purple.loaded = true; };


		//load flags
		this.flagImg = {
			red: {img: new Image(20,20), loaded: false}, //TODO: set size from server
	    	blue: {img: new Image(20,20), loaded: false},
	    	green: {img: new Image(20,20), loaded: false},
	    	purple: {img: new Image(20,20), loaded: false}
		};
		this.flagImg.red.img.src = "img/red_flag.png";
		this.flagImg.blue.img.src = "img/blue_flag.png";
		this.flagImg.green.img.src = "img/green_flag.png";
		this.flagImg.purple.img.src = "img/purple_flag.png";
		this.flagImg.red.img.onload = function() { self.flagImg.red.loaded = true; };
		this.flagImg.blue.img.onload = function() { self.flagImg.blue.loaded = true; };
		this.flagImg.green.img.onload = function() { self.flagImg.green.loaded = true; };
		this.flagImg.purple.img.onload = function() { 
			self.flagImg.purple.loaded = true; 
		};

		//load wall
		this.wallImg = {
			img: new Image(100, 100), loaded: false
		};
		this.wallImg.img.src = "img/wall.png";
		this.wallImg.img.onload = function() {
			self.wallImg.loaded = true; 
		};

		//load background
		this.backgroundImg = {
			img: new Image(100, 100), loaded: false
		};
		this.backgroundImg.img.src = "img/grass.png";
		this.backgroundImg.img.onload = function() {
			self.backgroundImg.loaded = true; 
		};
	},
	listen: function() {
		var self = this;

		this.socket.on('refresh', function (gameState) {
			self.gameState = gameState;
			self.screen.clearRect(0, 0, self.dimensions.width, self.dimensions.height);

			var i;

			//update score
			if (self.gameState.flags.length > 0) {
	        	var score;
	        	i = self.gameState.flags.length;
	        	self.screen.fillStyle = 'white';
	        	self.screen.font = "15px sans-serif";
	        	while((i-=1) >= 0) {
	        		score = self.gameState.score[self.gameState.flags[i].color];
	        		self.screen.fillText(score.color, self.scoreboard.position.x + TEXT_SPACING, self.scoreboard.position.y + TEXT_SPACING * (i + 1));
	        		self.screen.fillText(score.score, self.scoreboard.position.x + (self.scoreboard.size.width / 2), self.scoreboard.position.y + TEXT_SPACING * (i + 1));
	        	}
	        }

	        //loop tanks
	        var i = self.gameState.tanks.length, o, color;
	        while((i-=1) >= 0) {
	        	o = self.gameState.tanks[i];
	        	if (o.dead) {continue;}
	        	var t = self.tankImg[o.color].img;
	        	t.height = o.size.height;
	            t.width = o.size.width;
	        	drawRotatedImage(t, o.position.x, o.position.y, o.radians, self.screen);
	        }

	        if (self.gameState.boundaries.length > 0) {
	        	i = self.gameState.boundaries.length;
	        	while ((i-=1) >= 0) {
	        		o = self.gameState.boundaries[i];
	        		color = (o.color) ? o.color : "black";
	        		self.screen.fillStyle = color;
	        		self.screen.fillRect(o.position.x, o.position.y, o.size.height, o.size.width);
	        	}
	        }
	        if (self.gameState.bullets.length > 0) {
	        	i = self.gameState.bullets.length;
	        	while ((i-=1) >= 0) {
	        		o = self.gameState.bullets[i];
	        		color = (o.color) ? o.color : "black";
	        		self.screen.fillStyle = color;
	        		self.screen.fillRect(o.position.x, o.position.y, o.size.height, o.size.width);
	        	}
	        }
	        if (self.gameState.flags.length > 0) {
	        	i = self.gameState.flags.length;
	        	while ((i-=1) >= 0) {
	        		o = self.gameState.flags[i];
	        		var f = self.flagImg[o.color].img;
	        		f.height = o.size.height;
		            f.width = o.size.width;
		            self.screen.drawImage(f, o.position.x - (o.size.width / 2), o.position.y - (o.size.height / 2), o.size.height, o.size.width);
	        	}
	        }
		});

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
	}
};




/*** VIEWING ***/
	

window.onload = function() {
	var gameScreen = new GameScreen();
	var manualControls = new ManualControls();
}


//handy waiting function
function wait (timesToCheck, timeToWait, isItTimeYetFn, scope, callback) {
	var self = this;
	timesToCheck -=1;
	if (timesToCheck <= 0) {
		console.log("time expired");
		return;
	}
	setTimeout(function() {
		if (isItTimeYetFn.call(scope)) {
			callback();
		} else {
			self.wait(timesToCheck, timeToWait, isItTimeYetFn, scope, callback);
		}
	}, timeToWait);
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}



/*** MANUAL CONTROLS  ***/
function ManualControls() {
	var self = this;
	this.myTanks = [];
	this.socket = io();
	this.connected = null;
	this.initData = null;
	this.playerSocket = null;

	this.init(function() {
		self.createBodies();
		self.refresh();

		//send back commands
		setInterval(function() {
			self.calculateGoalsAndSendBackCommands();
		}, 500);
		self.listenForUserInput();
	});

};

ManualControls.prototype = {
	init: function(callback) {
		var self = this;
		this.socket.on("init", function(initData) {
			if (self.connected) {
				return;
			}
			self.connected = true;
			self.initData = initData;

			var buttonWrapper = $("#button-wrapper");
		    buttonWrapper.empty();
		    for (var i = 0; i < self.initData.players.length; i++) {
		        var button = $("<span data-player-index='" + i + "' class='player-button' style='background-color:" + self.initData.players[i].playerColor + " '>Player Number " + self.initData.players[i].playerNumber + "</span>").click(function() {
		            var playerIndex = $(this).data("player-index");
		            self.playerSocket = io("/" + self.initData.players[playerIndex].namespace);
		            self.color = self.initData.players[playerIndex].playerColor;
		            $(this).off();  //prevents multiple clicks
		            callback();
		        });
		        buttonWrapper.append(button);

		    }

		    //add observer button
		    buttonWrapper.append("<span class='player-button' style='background-color:#666'>Observer</span>");

		    //fade out on selection
		    buttonWrapper.click(function() {
		        $("#selectionBoard").fadeOut(3500);
		    });

		    



		});
	},
	createBodies: function() {
		for (var i = 0; i < this.initData.numOfTanks; i++) {
			this.myTanks.push(new Tank(i, this.color));
		}
	},
	refresh: function() {
		var self = this;
		var myTanksNewPosition;
		this.socket.on("refresh", function(gameState) {
			myTanksNewPosition = gameState.tanks.filter(function(t) {
				return self.myTanks[0].color === t.color;
			});

			//update my tanks
			for (var i = 0; i < self.myTanks.length; i++) {
				for (var j = 0; j < myTanksNewPosition.length; j++) {
					if (self.myTanks[i].tankNumber === myTanksNewPosition[j].tankNumber) { //change to j for all tanks
						self.myTanks[i].position = myTanksNewPosition[j].position;
						self.myTanks[i].angle = myTanksNewPosition[j].angle;
					}
				}
			}

		});

	},
	calculateGoalsAndSendBackCommands: function() {
		var orders = {};
		var i = this.myTanks.length, speed, angleVel; 
		while((i-=1) >=0) {
			this.myTanks[i].calculateGoal();
			orders.tankNumbers = [this.myTanks[i].tankNumber];
			orders.speed = this.myTanks[i].speed;
			orders.angleVel = this.myTanks[i].angleVel;
			this.playerSocket.emit("move", orders);
			if(this.myTanks[i].tankNumber === 0){console.log(orders)};
		}
	},
	listenForUserInput: function() {
		var self = this;
		$("#canvas").click(function(e) { //only works if canvas starts in top left corner
	    	for (var i = 0; i < self.myTanks.length; i++) {
	    		self.myTanks[i].setTarget(e.pageX, e.pageY);
	    	}
		    console.log(e.pageX, e.pageY);
		});
	}
};


var Tank = function(tankNumber, color) {
	this.tankNumber = tankNumber;
	this.color = color;
	this.position = {x: 0, y: 0};
	this.angle;
	this.speed = 0;
	this.angleVel = 0;
	
	this.target = {x: 100, y: 100};
	this.hasATarget = false;

};

Tank.prototype = {
	getTarget: function() {
		return this.target;
	},
	hasTarget: function() {
		return this.hasATarget;
	},
	setTarget: function(x, y) {
		this.target.x = x;
		this.target.y = y;
	},
	missionAccomplished: function() {
		this.hasATarget = false;
	},
	calculateGoal: function() {

		var distance;
		var angle;
		var degrees;
		var relativeX;
		var relativeY;


		distance = round(Math.sqrt(Math.pow(( this.target.x - this.position.x ), 2) + Math.pow(( this.target.y - this.position.y ), 2)), 4);
		relativeX = this.target.x - this.position.x; //relative
		relativeY = this.target.y - this.position.y;
		angle = round(Math.atan2(-(relativeY), relativeX), 4);
		degrees = round(angle * (180 / Math.PI), 4);  //convert from radians to degrees
		degrees = degrees % 360; //(-360 to 360)prevent overflow
		degrees = -(degrees); // tank degrees ascends clockwise. atan2 ascends counter clockwise.


		//update tank position
		//set angle and speed

		var angleDiff = 0;
		if (degrees > this.angle) { // +
			this.angleVel = 1;
		} else { // -
			this.angleVel = -1;
		} 

		//set speed
		if (distance >= 50) {
			this.speed = 1;
		} else {
			this.speed = 0;
			this.angleVel = 0;
			this.missionAccomplished();
		}

	}

};






// var canvasElement = $("#canvas");
// var myTanks = [];
// var manualControls = {};

// function manualControl(initData) {
// 	var port = "8003";
// 	var url = 'http://localhost:' + port;
	

//     var buttonWrapper = $("#button-wrapper");
//     buttonWrapper.empty();
//     for (var i = 0; i < initData.players.length; i++) {
//         var button = $("<span data-player-index='" + i + "' class='player-button' style='background-color:" + initData.players[i].playerColor + " '>Player Number " + initData.players[i].playerNumber + "</span>").click(function() {
//             var playerIndex = $(this).data("player-index");
//             manualControls.socket = io(url + "/" + initData.players[playerIndex].namespace);
//             for (var i = 0; i < initData.numOfTanks; i++) {
// 				myTanks.push(new Tank(i, initData.players[playerIndex].playerColor));
// 			}
// 			setInterval(function() {
// 				sendBackCommands();
// 			}, 500);

//         });
//         buttonWrapper.append(button);

//     }
//     buttonWrapper.append("<span class='player-button' style='background-color:#666'>Observer</span>").click(function() {
//         $("#selectionBoard").fadeOut(3500);
//     });

//     $("#canvas").click(function(e) { //only works if canvas starts in top left corner
//     	for (var i = 0; i < myTanks.length; i++) {
//     		myTanks[i].setTarget(e.pageX, e.pageY);
//     	}
//     	console.log(e.pageX, e.pageY);
//     });

    



// }

// function sendBackCommands() {
// 	//add up all calculations
// 	var speed, angleVel, orders;
// 	for (var i = 0; i < myTanks.length; i++) {
// 		speed = myTanks[i].goal.speed * 1;
// 		angleVel = myTanks[i].goal.angleVel * 1;
// 		orders = {
// 			tankNumbers: [myTanks[i].tankNumber],
// 			speed: speed,
// 			angleVel: angleVel
// 		}
// 		manualControls.socket.emit("move", orders);
// 	}
// }



// function updateMyTanks (myTanksNewPosition) {
// 	for (var i = 0; i < myTanks.length; i++) {
// 		for (var j = 0; j < myTanksNewPosition.length; j++) {
// 			if (myTanks[i].tankNumber === myTanksNewPosition[j].tankNumber) { //change to j for all tanks
// 				myTanks[i].position = myTanksNewPosition[j].position;
// 				myTanks[i].angle = myTanksNewPosition[j].angle;
// 			}
// 		}
// 	}
// }


// function calculateGoal() {
// 	var distance = 0;
// 	var angle = 0;
// 	var degrees = 0;
// 	var relativeX = 0;
// 	var relativeY = 0;


// 	for (var i = 0; i < myTanks.length; i++) {
// 		if (myTanks[i].hasTarget()) {
// 			goal = myTanks[i].getTarget();
// 		} else {
// 			continue;
// 		}

// 		//console.log(goal);
// 		distance = round(Math.sqrt(Math.pow(( goal.x - myTanks[i].position.x ), 2) + Math.pow(( goal.y - myTanks[i].position.y ), 2)), 4);
// 		relativeX = goal.x - myTanks[i].position.x; //relative
// 		relativeY = goal.y - myTanks[i].position.y;
// 		angle = round(Math.atan2(-(relativeY), relativeX), 4);
// 		//angle = Math.atan( ( goal.y - myTanks[i].position.y ) / ( goal.x - myTanks[i].position.x ) );
// 		degrees = round(angle * (180 / Math.PI), 4);  //convert from radians to degrees
// 		degrees = degrees % 360; //(-360 to 360)prevent overflow
// 		//console.log( goal.y, myTanks[i].position.y, goal.x, myTanks[i].position.x );
// 		//console.log("distance: " + distance, "angle: " + angle, "degrees: " + degrees);
// 		//console.log(degrees, myTanks[i].angle);
// 		degrees = -(degrees); // tank degrees ascends clockwise. atan2 ascends counter clockwise.
// 		//console.log(Math.abs(myTanks[i].angle), Math.abs(degrees));
// 		//turn in the direction whichever is closer

// 		var angleDiff = 0;
// 		if (degrees > myTanks[i].angle) { // +
// 			myTanks[i].goal.angleVel = 1;
// 		} else { // -
// 			myTanks[i].goal.angleVel = -1;	
// 		} 


// 		//set speed
// 		if (distance >= 20) {
// 			myTanks[i].goal.speed = 1;
// 		} else {
// 			//myTanks[i].goal.speed = 0;
// 			myTanks[i].missionAccomplished();
// 		}
// 	}

// }

// var Tank = function(tankNumber, color) {
// 	this.tankNumber = tankNumber;
// 	this.tankColor = color;
// 	this.position = {x: 0, y: 0};
// 	this.angle;
// 	this.goal = {
// 		speed: 0,
// 		angleVel: 0
// 	};
// 	this.avoidObstacle = {
// 		speed: 0,
// 		angleVel: 0
// 	};
// 	this.target = {x: 100, y: 100};
// 	this.hasATarget = false;
// };

// Tank.prototype = {
// 	getTarget: function() {
// 		return this.target;
// 	},
// 	hasTarget: function() {
// 		return this.hasATarget;
// 	},
// 	setTarget: function(x, y) {
// 		this.target.x = x;
// 		this.target.y = y;
// 	},
// 	missionAccomplished: function() {
// 		this.hasATarget = false;
// 	}
// };