var Boundary = function(boundaryData) {
	this.type = "boundary";
	this.position = boundaryData.position;
	this.positionStep = this.position;
	this.size = boundaryData.size;
};

Boundary.prototype = {
	calculate: function() {
		//nothing to update
	},
	moveX: function() {

	},
	moveY: function() {

	},
	die: function() {
		//destroy boundary ?
	}
}



module.exports = Boundary;
