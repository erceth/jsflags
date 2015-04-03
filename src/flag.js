var globals = require('../index');
var options = globals.options;

var Flag = function(color, position) {
	this.type = "flag";
	this.originalPosition = position;
	this.position = this.originalPosition;
	this.size = {height: 20, width: 20};
	this.color = color;
	this.tankToFollow = null;
};

Flag.prototype = {

	update: function() {
		if (this.tankToFollow && !this.tankToFollow.dead) {
			this.position = {
				x: this.tankToFollow.position.x,
				y: this.tankToFollow.position.y
			};
		}
		if (this.tankToFollow && this.tankToFollow.dead) {
			this.tankToFollow = null;
			this.slowDeath();

		}
		//if (this.color === "blue") {console.log(this.position);}
		
	},
	die: function() {
		this.position = {
			x: this.originalPosition.x,
			y: this.originalPosition.y
		}
		this.tankToFollow = null;
	},
	slowDeath: function() {
		var self = this;
		setTimeout(function() {
			if (!self.tankToFollow) {
				self.die();
			}
		}, options.flagRepawnWait);
	},
	followThisTank: function(tank) {
		if (!this.tankToFollow) {
			this.tankToFollow = tank;
		}
		
	}

	// update: function() {
	// 	if (!!this.tankToFollow && !this.tankToFollow.dead) {
	// 		this.position = this.tankToFollow.position;
	// 	}
	// 	if (this.tankToFollow && this.tankToFollow.dead) {
	// 		this.tankToFollow = null;
	// 	}
	// },
	// hasTank: function() {
	// 	return !!this.tankToFollow && !this.tankToFollow.dead;
	// },
	// die: function() {
	// 	this.tankToFollow = null;
	// 	this.position = this.originalPosition;
	// },
	// followThisTank: function(tank) {
	// 	this.tankToFollow = tank;
	// },
	// stopFollowing: function() {
	// 	this.tankToFollow = null;
	// }
}


module.exports = Flag;
