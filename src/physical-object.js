var PhysicalObject = function() {

};

PhysicalObject.prototype = {
	setPosition: function(position) {
		this.position.x = position.x;
		this.position.y = position.y;
	},
	setSize: function(size) {
		this.size.height = size.height;
		this.size.width = size.width;
	},
	getPosition: function() {
		return this.position;
	},
	getSize: function() {
		return this.size;
	},
	update: function() {
		//should be taken care of by inherited objects
	},
	die: function() {
		//should be taken care of by inherited objects
	}
};

PhysicalObject = new PhysicalObject(); //singleton
module.exports = PhysicalObject;



/*

EXAMPLE OF WHAT'S GOING ON HERE

var PhysicalObject = function() {
    this.position = {
        x: 5
    }
};

PhysicalObject.prototype = {
    update: function() {
        this.position.x = this.position.x + 1;
    },
    getPosition: function() {
        return this.position;
    }
};

PhysicalObject = new PhysicalObject();  //singleton

var Tank = function() {
    this.color = "red";
};

Tank.prototype = object(po);

Tank.prototype.shoot = function() {
        console.log("I am shooting.");  
};

Tank.prototype.getColor = function() {
        console.log(this.color);
};



function object(o) { function F() {}
F.prototype = o;
return new F(); }



var t = new Tank();

console.log(t);
console.log(t.getPosition().x);
console.log(t.getColor());



*/
