var Boundary = function(boundaryData) {
	this.type = "boundary";
	this.position = boundaryData.position;
	this.size = boundaryData.size;
};

Boundary.prototype = {
	update: function() {
		//nothing to update
	},
	die: function() {
		//destroy boundary
	}

};

module.exports = Boundary;
