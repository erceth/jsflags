
var Flag = function(flagData) {
	this.type = "flag";
	this.position = flagData.position;
	this.size = flagData.size;
};

Flag.prototype.update = function() {
		//nothing to update
};
Flag.prototype.die = function() {
		//reset location
};


module.exports = Flag;
