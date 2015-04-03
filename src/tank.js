var globals = require('../index');
var options = globals.options;
var Bullet = require("./bullet");

var Tank = function(base, color, tankNumber) {
	this.type = "tank"
	this.color = color;
	this.size = {height: 15, width: 15};
	this.tankNumber = tankNumber;
	this.base = {
		position: base.position,
		size: base.size
	};
	this.positionStep = {x: 0, y: 0};
	this.radians;
	this.dead = false;
	this.hasFlag = false;

	this.setHomePosition();
	this.setStartingAngle();
	this.setStartingSpeed();
	
	//add game's addBullet function to oneself
	
};

Tank.prototype = {
	setHomePosition: function() {
		this.position = {
			x: this.base.position.x - (this.base.size.width / 2) + (this.size.width * this.tankNumber), 
			y: this.base.position.y - 1  // TODO: make rows - (playerData.size.height/ 2) + (this.size.height* )
		};
	},
	setStartingAngle: function() {
		this.angle = 0; //0 to 359
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
		this.angle = this.angle % 360;  //prevent angle overflow and keep it positive

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
	},
	moveY: function() {
		this.position.y = this.positionStep.y;
	},
	moveTanks: function(order) {
		if (this.dead) { return; }
		this.angleVel = order.angleVel;
		this.speed = order.speed;
	},
	fireTanks: function(order) {
		if (this.dead) { return; }
		this.addBulletToGame(new Bullet({
			color: this.color, 
			radians: this.radians, 
			options: options, 
			position: this.position,
			tankSize: this.size
		}));
	},
	die: function() {
		this.dead = true;
		this.position.x = 0;
		this.position.y = 0;
		this.hasFlag = false;
		var self = this;
		setTimeout(function() {
			self.dead = false;
			self.setHomePosition();
			self.setStartingSpeed();
			self.setStartingAngle();
		}, options.respawnTime);
	},
	carryFlag: function(flag) {
		this.hasFlag = flag.color;
	}
	//one prototype lives in game.js
};



function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

module.exports = Tank;
