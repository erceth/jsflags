/* global io, Image base64Images, $ */
/** * GAME SCREEN ***/

var TEXT_SPACING = 15

function GameScreen (manualControls) {
  var self = this
  this.canvas = document.getElementById('canvas')
  this.screen = this.canvas.getContext('2d')
  this.backgroundCanvas = document.getElementById('background')
  this.backgroundScreen = this.backgroundCanvas.getContext('2d')
  this.socket = io()
  this.dimensions = {}
  this.scoreboard = {}
  this.connected = false
  this.initData = null
  this.manualControls = manualControls

  this.tankImg = {
    red: null,
    blue: null,
    green: null,
    purple: null
  }
  this.flagImg = {
    red: null,
    blue: null,
    green: null,
    purple: null
  }
  this.wallImg = {}
  this.backgroundImg = {}
  this.baseImg = {}

  this.loadImages()
  this.socket.on('init', function (initData) {
    self.init(initData, function () {
      self.fillBackground()
      self.socket.on('refresh', self.refresh.bind(self))
    })
  })
};

GameScreen.prototype = {
  init: function (initData, callback) {
    if (this.connected) {
      return
    }
    this.connected = true
    this.initData = initData
    this.dimensions = this.initData.dimensions
    this.scoreboard = this.initData.scoreboard
    this.canvas.width = this.dimensions.width
    this.canvas.height = this.dimensions.height

    this.backgroundCanvas.width = this.dimensions.width
    this.backgroundCanvas.height = this.dimensions.height

    for (var i = 0; i < this.initData.players.length; i++) {
      this.baseImg[this.initData.players[i].playerColor].img.width = this.initData.players[i].base.size.width
      this.baseImg[this.initData.players[i].playerColor].img.height = this.initData.players[i].base.size.height
    }
    callback()
  },
  fillBackground: function () {
    // fill grass
    this.backgroundScreen.rect(0, 0, this.dimensions.width, this.dimensions.height)
    var backgroundPattern = this.backgroundScreen.createPattern(this.backgroundImg.img, 'repeat')
    this.backgroundScreen.fillStyle = backgroundPattern
    this.backgroundScreen.fill()

    // fill scoreboard
    this.backgroundScreen.fillStyle = 'black'
    this.backgroundScreen.fillRect(this.scoreboard.position.x - this.scoreboard.size.width / 2, this.scoreboard.position.y - this.scoreboard.size.height / 2, this.scoreboard.size.width, this.scoreboard.size.height)

    // fill bases
    var b, img
    for (var i = 0, max = this.initData.players.length; i < max; i++) {
      b = this.initData.players[i].base
      img = this.baseImg[this.initData.players[i].playerColor].img
      this.backgroundScreen.drawImage(img, b.position.x - (b.size.width / 2), b.position.y - (b.size.height / 2), b.size.height, b.size.width)
    }
  },
  loadImages: function () {
    var self = this
    // load tanks
    this.tankImg = {
      red: {
        img: new Image(15, 15)
      }, // TODO: set size from server
      blue: {
        img: new Image(15, 15)
      },
      green: {
        img: new Image(15, 15)
      },
      purple: {
        img: new Image(15, 15)
      }
    }
    this.tankImg.red.img.src = base64Images.red_tank
    this.tankImg.blue.img.src = base64Images.blue_tank
    this.tankImg.green.img.src = base64Images.green_tank
    this.tankImg.purple.img.src = base64Images.purple_tank

    // load bases
    this.baseImg = {
      red: {
        img: new Image(100, 100)
      },
      blue: {
        img: new Image(100, 100)
      },
      green: {
        img: new Image(100, 100)
      },
      purple: {
        img: new Image(100, 100)
      }
    }
    this.baseImg.red.img.src = base64Images.red_basetop
    this.baseImg.blue.img.src = base64Images.blue_basetop
    this.baseImg.green.img.src = base64Images.green_basetop
    this.baseImg.purple.img.src = base64Images.purple_basetop

    // load flags
    this.flagImg = {
      red: {
        img: new Image(20, 20)
      }, // TODO: set size from server
      blue: {
        img: new Image(20, 20)
      },
      green: {
        img: new Image(20, 20)
      },
      purple: {
        img: new Image(20, 20)
      }
    }
    this.flagImg.red.img.src = base64Images.red_flag
    this.flagImg.blue.img.src = base64Images.blue_flag
    this.flagImg.green.img.src = base64Images.green_flag
    this.flagImg.purple.img.src = base64Images.purple_flag
    this.flagImg.red.img.onload = function () {
      self.flagImg.red.loaded = true
    }
    this.flagImg.blue.img.onload = function () {
      self.flagImg.blue.loaded = true
    }
    this.flagImg.green.img.onload = function () {
      self.flagImg.green.loaded = true
    }
    this.flagImg.purple.img.onload = function () {
      self.flagImg.purple.loaded = true
    }

    // load wall
    this.wallImg = {
      img: new Image(100, 100)
    }
    this.wallImg.img.src = base64Images.wall
    this.wallImg.img.onload = function () {
      self.wallImg.loaded = true
    }

    // load background
    this.backgroundImg = {
      img: new Image(100, 100)
    }
    this.backgroundImg.img.src = base64Images.grass
    this.backgroundImg.img.onload = function () {
      self.backgroundImg.loaded = true
    }
  },
  refresh: function (gameState) {
    this.gameState = gameState
    this.screen.clearRect(0, 0, this.dimensions.width, this.dimensions.height)

    var i

    // update score
    if (this.gameState.flags.length > 0) {
      var score
      i = this.gameState.flags.length
      this.screen.fillStyle = 'white'
      this.screen.font = '15px sans-serif'
      while ((i -= 1) >= 0) {
        score = this.gameState.score[this.gameState.flags[i].color]
        this.screen.fillText(score.color, (this.scoreboard.position.x - this.scoreboard.size.width / 2) + TEXT_SPACING, this.scoreboard.position.y - this.scoreboard.size.height / 2 + TEXT_SPACING * (i + 1))
        this.screen.fillText(score.score, this.scoreboard.position.x, this.scoreboard.position.y - (this.scoreboard.size.height / 2) + TEXT_SPACING * (i + 1))
      }
    }

    // loop tanks
    i = this.gameState.tanks.length
    var o, color
    while ((i -= 1) >= 0) {
      o = this.gameState.tanks[i]
      if (o.dead) {
        continue
      }
      var t = this.tankImg[o.color].img
      t.height = o.size.height
      t.width = o.size.width
      drawRotatedImage(t, o.position.x, o.position.y, o.radians, this.screen, o.tankNumber + 1)
    }

    if (this.gameState.boundaries.length > 0) {
      i = this.gameState.boundaries.length
      while ((i -= 1) >= 0) {
        o = this.gameState.boundaries[i]
        color = (o.color) ? o.color : 'black'
        this.screen.fillStyle = color
        this.screen.fillRect(o.position.x - o.size.width / 2, o.position.y - o.size.height / 2, o.size.height, o.size.width)
      }
    }
    if (this.gameState.bullets.length > 0) {
      i = this.gameState.bullets.length
      while ((i -= 1) >= 0) {
        o = this.gameState.bullets[i]
        color = (o.color) ? o.color : 'black'
        this.screen.fillStyle = color
        this.screen.fillRect(o.position.x - o.size.width / 2, o.position.y - o.size.height / 2, o.size.height, o.size.width)
      }
    }
    if (this.gameState.flags.length > 0) {
      i = this.gameState.flags.length
      while ((i -= 1) >= 0) {
        o = this.gameState.flags[i]
        var f = this.flagImg[o.color].img
        f.height = o.size.height
        f.width = o.size.width
        this.screen.drawImage(f, o.position.x - o.size.width / 2, o.position.y - o.size.height / 2, o.size.height, o.size.width)
      }
    }
    // show which tanks are selected
    if (this.manualControls.connected) {
      var selectedTanks = this.manualControls.getSelectedTanks(), tank // get selected tanks from ManualControl
      if (selectedTanks) {
        i = selectedTanks.length
        while ((i -= 1) >= 0) {
          tank = selectedTanks[i]
          this.screen.beginPath()
          this.screen.arc(tank.position.x, tank.position.y, tank.size.width * 0.66, 0, 2 * Math.PI)
          this.screen.stroke()
        }
      }
    }

    function drawRotatedImage (img, x, y, radians, context, text) {
      // save the current co-ordinate system
      // before we screw with it
      context.save()

      // move to the middle of where we want to draw our image
      context.translate(x, y)

      // context.fillText(round(object.angle,2), -25, -25); //print angle next to tank

      if (text) {
        context.fillText(text, -5, 20) // print angle next to tank
      }

      // rotate around that point
      context.rotate(radians)

      // draw it up and to the left by half the width
      // and height of the image

      context.drawImage(img, -img.width / 2, -img.height / 2, img.height, img.width)
      // context.fillRect(0, 0, 1, 1); //puts a wee dot on the origin

      // and restore the co-ords to how they were when we began
      context.restore()
    }
  }
  // A GameScreen functions lives in Manual Controls
}

/** * VIEWING ***/

window.onload = function () {
  var manualControls = new ManualControls()
  var gameScreen = new GameScreen(manualControls)
}

function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

/** * MANUAL CONTROLS  ***/
function ManualControls () {
  var self = this
  this.myTanks = []
  this.socket = io()
  this.connected = null
  this.initData = null
  this.playerSocket = null

  this.init(function () {
    self.createBodies()
    self.createControls()
    self.refresh()

    // send back commands
    setInterval(function () { // TODO: only do this when needed?
      self.calculateGoalsAndSendBackCommands()
    }, 200)
  })
};

ManualControls.prototype = {
  init: function (callback) {
    var self = this
    this.socket.on('init', function (initData) {
      if (self.connected) {
        return
      }
      self.initData = initData

      var buttonWrapper = $('#button-wrapper')
      buttonWrapper.empty()
      for (var i = 0; i < self.initData.players.length; i++) {
        var button = $("<span data-player-index='" + i + "' class='player-button' style='background-color:" + self.initData.players[i].playerColor + " '>Player Number " + self.initData.players[i].playerNumber + '</span>').click(function () {
          var playerIndex = $(this).data('player-index')
          self.playerSocket = io('/' + self.initData.players[playerIndex].namespace)
          self.color = self.initData.players[playerIndex].playerColor
          $(this).off() // prevents multiple clicks
          callback()
        })
        buttonWrapper.append(button)
      }

      // add observer button
      buttonWrapper.append("<span class='player-button' style='background-color:#666'>Observer</span>")

      // fade out on selection
      buttonWrapper.click(function () {
        $('#selectionBoard').fadeOut(3500)
        self.connected = true
      })
    })
  },
  getSelectedTanks: function () {
    if (this.myTanks) {
      return this.myTanks.filter(function (t) {
        return t.selected
      })
    }
    return false
  },
  createBodies: function () {
    var self = this
    var myTanks = this.initData.tanks.filter(function (t) {
      return t.color === self.color
    })
    for (var i = 0; i < myTanks.length; i++) {
      this.myTanks.push(new Tank(i, this.color, myTanks[i].size))
    }
  },
  createControls: function () {
    var self = this
    $('#canvas').click(function (e) {
      // click is a destination
      for (var j = 0; j < self.myTanks.length; j++) {
        if (self.myTanks[j].selected) {
          self.myTanks[j].setTarget(e.pageX, e.pageY)
        }
      }
    })

    var keyboardSelectMultiple = true
    // 49=1, 50=2, 51=3, 52=4 81=q, 87=w, 69=e, 82=r 32=space
    $(document).keydown(function (evt) {
      if (evt.which === 32) {
        for (var i = 0; i < self.myTanks.length; i++) {
          if (self.myTanks[i].selected) {
            self.playerSocket.emit('fire', {
              tankNumbers: [i]
            })
          }
        }
        return
      }

      if (keyboardSelectMultiple) {
        keyboardSelectMultiple = false
        for (i = 0; i < self.myTanks.length; i++) {
          self.myTanks[i].selected = false
        }
        setTimeout(function () {
          keyboardSelectMultiple = true
        }, 500)
      }
      if (evt.which === 49 || evt.which === 81) {
        self.myTanks[0].selected = true
      }
      if (evt.which === 50 || evt.which === 87) {
        self.myTanks[1].selected = true
      }
      if (evt.which === 51 || evt.which === 69) {
        self.myTanks[2].selected = true
      }
      if (evt.which === 52 || evt.which === 82) {
        self.myTanks[3].selected = true
      }
    })
  },
  refresh: function () {
    var self = this
    var myTanksNewPosition
    this.socket.on('refresh', function (gameState) {
      myTanksNewPosition = gameState.tanks.filter(function (t) {
        return self.myTanks[0].color === t.color
      })

      // update my tanks
      for (var i = 0; i < self.myTanks.length; i++) {
        for (var j = 0; j < myTanksNewPosition.length; j++) {
          if (self.myTanks[i].tankNumber === myTanksNewPosition[j].tankNumber) { // change to j for all tanks
            self.myTanks[i].position = myTanksNewPosition[j].position
            self.myTanks[i].angle = myTanksNewPosition[j].angle
          }
        }
      }
    })
  },
  calculateGoalsAndSendBackCommands: function () {
    var orders = {}
    var i = this.myTanks.length
    while ((i -= 1) >= 0) {
      this.myTanks[i].calculateGoal()
      orders.tankNumbers = [this.myTanks[i].tankNumber]
      orders.speed = this.myTanks[i].speed
      orders.angleVel = this.myTanks[i].angleVel
      this.playerSocket.emit('move', orders)
    }
  }
}

var Tank = function (tankNumber, color, size) {
  this.tankNumber = tankNumber
  this.color = color
  this.position = {
    x: 0,
    y: 0
  }
  this.size = size
  this.speed = 0
  this.angleVel = 0
  this.selected = false

  this.target = {
    x: 100,
    y: 100
  }
  this.hasATarget = false
}

Tank.prototype = {
  getTarget: function () {
    return this.target
  },
  hasTarget: function () {
    return this.hasATarget
  },
  setTarget: function (x, y) {
    this.target.x = x
    this.target.y = y
    this.hasATarget = true
  },
  missionAccomplished: function () {
    this.hasATarget = false
  },
  calculateGoal: function () {
    if (this.hasATarget) {
      var distance
      var angle
      var degrees
      var relativeX
      var relativeY

      distance = round(Math.sqrt(Math.pow((this.target.x - this.position.x), 2) + Math.pow((this.target.y - this.position.y), 2)), 4)
      relativeX = this.target.x - this.position.x // relative
      relativeY = this.target.y - this.position.y
      angle = round(Math.atan2(-(relativeY), relativeX), 4)
      degrees = round(angle * (180 / Math.PI), 4) // convert from radians to degrees
      degrees = -(degrees) // tank degrees ascends clockwise. atan2 ascends counter clockwise.

      // convert from -180/180 to 0/360
      if (degrees < 0) {
        degrees = (degrees + 360) % 360
      }

      var angleDifference = this.angle - degrees

      if (angleDifference > 0) {
        if (angleDifference < 180) {
          this.angleVel = -1
        } else {
          this.angleVel = 1
        }
      } else {
        if (angleDifference > -180) {
          this.angleVel = 1
        } else {
          this.angleVel = -1
        }
      }

      // update tank position
      // set angle and speed

      // var angleDiff = 0;
      // if (degrees > this.angle) { // +
      // 	this.angleVel = 1;
      // } else { // -
      // 	this.angleVel = -1;
      // }

      // set speed
      if (distance >= 10) {
        this.speed = 1
      } else {
        this.speed = 0
        this.angleVel = 0
        this.missionAccomplished()
      }
    }
  }

}

// var canvasElement = $("#canvas");
// var myTanks = [];
// var manualControls = {};

// function manualControl(initData) {
// 	var port = "8003";
// 	var url = 'http://localhost:' + port;

//     var buttonWrapper = $("#button-wrapper");
//     buttonWrapper.empty();
//     for (var i = 0; i < initData.players.length; i++) {
//         var button = $("<span data-player-index='" + i + "' class='player-button' style='background-color:" + initData.players[i].playerColor + " '>Player Number " + initData.players[i].playerNumber + "</span>").click(function () {
//             var playerIndex = $(this).data("player-index");
//             manualControls.socket = io(url + "/" + initData.players[playerIndex].namespace);
//             for (var i = 0; i < initData.numOfTanks; i++) {
// 				myTanks.push(new Tank(i, initData.players[playerIndex].playerColor));
// 			}
// 			setInterval(function () {
// 				sendBackCommands();
// 			}, 500);

//         });
//         buttonWrapper.append(button);

//     }
//     buttonWrapper.append("<span class='player-button' style='background-color:#666'>Observer</span>").click(function () {
//         $("#selectionBoard").fadeOut(3500);
//     });

//     $("#canvas").click(function (e) { //only works if canvas starts in top left corner
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

// var Tank = function (tankNumber, color) {
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
// 	getTarget: function () {
// 		return this.target;
// 	},
// 	hasTarget: function () {
// 		return this.hasATarget;
// 	},
// 	setTarget: function (x, y) {
// 		this.target.x = x;
// 		this.target.y = y;
// 	},
// 	missionAccomplished: function () {
// 		this.hasATarget = false;
// 	}
// };
