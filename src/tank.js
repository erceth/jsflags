var Bullet = require("./bullet");

var Tank = function(playerData, tankNumber, options, game) {
	this.type = "tank"
	this.playerNumber = playerData.playerNumber;
	this.color = playerData.color;
	this.size = {height: 15, width: 15};
	this.tankNumber = tankNumber;
	this.options = options;
	this.homeBase = {
		x: playerData.position.x,
		y: playerData.position.y,
		height: playerData.size.height,
		width: playerData.size.width
	}
	this.setHomePosition();
	this.setStartingAngle();
	this.setStartingSpeed();
	this.positionStep = {x: 0, y: 0};
	this.radians;
	this.dead = false;
	//add game's addBullet function to oneself
	this.addBulletToGame = function(bullet) {
		game.addBullet(bullet); 
	};
};

Tank.prototype = {
	setHomePosition: function() {
		this.position = {
			x: this.homeBase.x - (this.homeBase.width / 2) + (this.size.width * this.tankNumber), 
			y: this.homeBase.y - 1  // TODO: make rows - (playerData.size.height/ 2) + (this.size.height* )
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
		if (this.speed > this.options.maxTankSpeed) {
			this.speed = this.options.maxTankSpeed;
		}
		if (this.speed < -this.options.maxTankSpeed) {
			this.speed = -this.options.maxTankSpeed;
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
			options: this.options, 
			position: this.position,
			tankSize: this.size
		}));
	},
	die: function() {
		this.dead = true;
		this.setHomePosition();
		this.setStartingSpeed();
		this.setStartingAngle();
		var self = this;
		setTimeout(function() {
			self.dead = false;
		}, this.options.respawnTime);

		//set position to home
		//set speed and angleVel to 0
	}
};



function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

module.exports = Tank;
