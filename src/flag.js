var PhysicalObject = require('./physical-object');
var globals = require('../index');

var Flag = function(flagData) {
	this.type = "flag";
	this.position = flagData.position;
	this.size = flagData.size;
};

//inherits from Physical Object
Flag.prototype = globals.createObject(PhysicalObject);

Flag.prototype.update = function() {
		//nothing to update
};
Flag.prototype.die = function() {
		//reset location
};


module.exports = Flag;
