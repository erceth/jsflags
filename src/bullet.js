var Bullet = function(bulletData) {
	this.type = "bullet";
	this.position = bulletData.position;
	this.size = bulletData.size;
};

Bullet.prototype.update = function() {
		//nothing to update
};
Bullet.prototype.die = function() {
		//destroy boundary
};


module.exports = Bullet;
