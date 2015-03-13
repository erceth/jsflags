var PhysicalObject = require('./physical-object');
var globals = require('../index');

var Bullet = function(bulletData) {
	this.type = "bullet";
	this.position = bulletData.position;
	this.size = bulletData.size;
};

//inherits from Physical Object
Bullet.prototype = globals.createObject(PhysicalObject);

Bullet.prototype.update = function() {
		//nothing to update
};
Bullet.prototype.die = function() {
		//destroy boundary
};


module.exports = Bullet;
