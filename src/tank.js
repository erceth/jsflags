var globals = require('../index');
var options = globals.options;
var Bullet = require("./bullet");

var Tank = function(base, color, tankNumber, dimensions) {
	this.type = "tank"
	this.color = color;
	this.size = {height: 20, width: 20};
	this.tankNumber = tankNumber;
	this.base = {
		position: base.position,
		size: base.size
	};
	this.positionStep = {x: 0, y: 0};
	this.radians;
	this.dead = false;
	this.ghost = true; //true if just respawned and hasn't moved yet
	this.hasFlag = false;
	this.dimensions = dimensions;
	this.reloading = false;

	this.setHomePosition();
	this.setStartingAngle();
	this.setStartingSpeed();
	
	//add game's addBullet function to oneself
	
};

Tank.prototype = {
	setHomePosition: function() {
		var xDiff = this.dimensions.width/2 - this.base.position.x;
		var yDiff = this.dimensions.height/2 - this.base.position.y;
		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			this.position = {
				x: this.base.position.x,
				y: this.base.position.y + this.size.height / 2 - (this.base.size.height / 2) + (this.size.height * this.tankNumber)
				
			};
		} else {
			this.position = {
				x: this.base.position.x + this.size.width / 2 - (this.base.size.width / 2) + (this.size.width * this.tankNumber),
				y: this.base.position.y
				
			};
		}
	},
	setStartingAngle: function() {
		this.angle = Math.random() * 360; 
		this.angleVel = 0; //-1 to 1
	},
	setStartingSpeed: function() {
		this.speed = 0; //-1 to 1
	},
	calculate: function() {
		//reset postitionStep
		this.positionStep.x = this.position.x;
		this.positionStep.y = this.position.y;

		this.angle += this.angleVel;
		if (this.angle < 0) {
			this.angle = (this.angle + 360) % 360; //prevent angle overflow and keep it positive	
		} else {
			this.angle = this.angle % 360;  //prevent angle overflow
		}

		//keep speed within max speed
		if (this.speed > options.maxTankSpeed) {
			this.speed = options.maxTankSpeed;
		}
		if (this.speed < -options.maxTankSpeed) {
			this.speed = -options.maxTankSpeed;
		}

		this.radians = this.angle * (Math.PI/180);
		this.radians = round(this.radians, 4);

		this.positionStep.x = (Math.cos(this.radians) * this.speed + this.position.x);
		this.positionStep.y = (Math.sin(this.radians) * this.speed + this.position.y);
		//if (this.color = "red" && this.tankNumber === 0) {console.log(this.angle, this.radians, Math.cos(this.radians), Math.sin(this.radians) );}
	},
	moveX: function() {
		this.position.x = this.positionStep.x;
		this.ghost = false;
	},
	moveY: function() {
		this.position.y = this.positionStep.y;
		this.ghost = false;
	},
	moveTanks: function(order) {
		if (this.dead) { return; }
		this.angleVel = order.angleVel;
		this.speed = order.speed;
	},
	fireTanks: function(order) {
		if (this.dead) { return; }
		if (this.reloading) { return; }
		this.addBulletToGame(new Bullet({
			color: this.color, 
			radians: this.radians, 
			options: options, 
			position: this.position,
			tankSize: this.size
		}));
		this.reloading = true;
		var self = this;
		setTimeout(function() {
			self.reloading = false;
		}, options.maxFireFrequency);
	},
	die: function(respawnTime) {
		this.dead = true;
		this.ghost = true;
		this.position.x = 0;
		this.position.y = 0;
		this.hasFlag = false;
		var self = this;
		if (!respawnTime) {
			respawnTime = options.respawnTime;
		}
		setTimeout(function() {
			self.dead = false;
			self.setHomePosition();
			self.setStartingSpeed();
			self.setStartingAngle();
		}, respawnTime);
	},
	carryFlag: function(flag) {
		this.hasFlag = flag.color;
	},
	dropFlag: function() {
		this.hasFlag = false;
	}
	//one prototype lives in game.js
};



function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

module.exports = Tank;
