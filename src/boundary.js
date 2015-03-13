var PhysicalObject = require('./physical-object');
var globals = require('../index');

var Boundary = function(boundaryData) {
	this.type = "boundary";
	this.position = boundaryData.position;
	this.size = boundaryData.size;
};

//inherits from Physical Object
Boundary.prototype = globals.createObject(PhysicalObject);

Boundary.prototype.update = function() {
		//nothing to update
};
Boundary.prototype.die = function() {
		//destroy boundary
};


module.exports = Boundary;
