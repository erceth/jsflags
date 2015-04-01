var globals = require('../index');
var options = globals.options;

var Flag = function(color, position) {
	this.type = "flag";
	this.originalPosition = position;
	this.position = this.originalPosition;
	this.size = {height: 20, width: 20};
	this.color = color;
	this.tankToFollow;
};

Flag.prototype = {
	hasTank: function() {
		return !!this.tankToFollow;
	},
	update: function() {
		if (this.tankToFollow && !this.tankToFollow.dead) {
			this.position.x = this.tankToFollow.position.x;
			this.position.y = this.tankToFollow.position.y;
		}
		else if (this.tankToFollow && this.tankToFollow.dead) {
			self.die();
		}
	},
	die: function() {
		this.tankToFollow = null;
		this.position.x = this.originalPosition.x;
		this.position.y = this.originalPosition.y;
	},
	followThisTank: function(tank) {
		this.tankToFollow = tank;
	}
}


module.exports = Flag;
