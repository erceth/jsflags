var Tank = require('./tank');

var Player = function(playerData) {
	this.playerNumber = playerData.base.playerNumber;
	this.playerColor = playerData.base.color;
	this.tanks = [];
	this.base = playerData.base;

	for (var i = 0; i < playerData.options.numOfTanks; i++) {
		this.tanks.push(new Tank(playerData.base, i, playerData.options, playerData.game));
	}

};

Player.prototype = {
	getPlayerColor: function() {
		return this.playerColor;
	},
	getPlayerNumber: function() {
		return this.playerNumber;
	},
	moveTanks: function(orders) {
		for (var i = 0; i < orders.tankNumbers.length; i++) {
			var tankNumber = parseInt(orders.tankNumbers[i], 10);
			if (tankNumber || tankNumber === 0 && tankNumber < this.tanks.length && tankNumber >= 0) {
				this.tanks[tankNumber].moveTanks({speed: orders.speed, angleVel: orders.angleVel});
			}
		}
	},
	fireTanks: function(orders) {
		for (var i = 0; i < orders.tankNumbers.length; i++) {
			var tankNumber = parseInt(orders.tankNumbers[i], 10);
			if (tankNumber || tankNumber === 0 && tankNumber < this.tanks.length && tankNumber >= 0) {
				this.tanks[tankNumber].fireTanks({speed: orders.speed, angleVel: orders.angleVel});
			}
		}
	}
};

module.exports = Player;
