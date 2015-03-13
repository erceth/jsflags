var Tank = require('./tank');

var Player = function(playerData, options, game) {
	this.playerNumber = playerData.base.playerNumber;
	this.playerColor = playerData.base.color;
	this.tanks = [];
	this.game = game;

	for (var i = 0; i < playerData.options.numOfTanks; i++) {
		this.tanks.push(new Tank(playerData.base, i, playerData.options, this.game));
	}


};

Player.prototype = {
	getPlayerColor: function() {
		return this.playerColor;
	},
	getPlayerNumber: function() {
		return this.playerNumber;
	},
	giveOrders: function(orders) {
		for (var i = 0; i < orders.tankNumbers.length; i++) {
			var tankNumber = parseInt(orders.tankNumbers[i], 10);
			if (tankNumber || tankNumber === 0 && tankNumber < this.tanks.length && tankNumber >= 0) {
				this.tanks[tankNumber].giveOrders({speed: orders.speed, angleVel: orders.angleVel});
			}
		}
	}
};

module.exports = Player;
