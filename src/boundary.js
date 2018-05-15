let GameObject = require('./game-object')

class Boundary extends GameObject {
  constructor (boundaryData) {
    super(boundaryData.size.width, boundaryData.size.height, boundaryData.position.x, boundaryData.position.y)
    this.type = 'boundary'
  }
}

module.exports = Boundary
