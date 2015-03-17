var Tank = function(playerData, tankNumber, options, game) {
	this.type = "tank"
	this.playerNumber = playerData.playerNumber;
	this.color = playerData.color;
	this.size = {height: 15, width: 15};
	this.tankNumber = tankNumber;
	this.options = options;
	this.position = {
		x: playerData.position.x - (playerData.size.width / 2) + (this.size.width * this.tankNumber), 
		y: playerData.position.y - 1  // TODO: make rows - (playerData.size.height/ 2) + (this.size.height* )
	};
	this.positionStep = {x: 0, y: 0};
	this.angle = 100; //0 to 359
	this.speed = 0; //-1 to 1
	this.angleVel = 0; //-1 to 1
	this.alive = true;
	this.game = game;
};

Tank.prototype = {
	calculate: function() {
		//reset postitionStep
		this.positionStep.x = this.position.x;
		this.positionStep.y = this.position.y;

		this.angle += this.angleVel;
		this.angle = this.angle % 360;  //prevent angle overflow

		//keep speed within max speed
		if (this.speed > this.options.maxTankSpeed) {
			this.speed = this.options.maxTankSpeed;
		}
		if (this.speed < -this.options.maxTankSpeed) {
			this.speed = -this.options.maxTankSpeed;
		}

		var radians = this.angle * (Math.PI/180);
		radians = round(radians, 4);

		this.positionStep.x = (Math.cos(radians) * this.speed + this.position.x);
		this.positionStep.y = (Math.sin(radians) * this.speed + this.position.y);
	},
	moveX: function() {
		this.position.x = this.positionStep.x;
	},
	moveY: function() {
		this.position.y = this.positionStep.y;
	},
	giveOrders: function(order) {
		this.angleVel = order.angleVel;
		this.speed = order.speed;
	},
	die: function() {
		//set alive to false
		//set position to home
		//set speed and angleVel to 0
	}
};



function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

module.exports = Tank;
