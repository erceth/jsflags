class Boundary {
  constructor (boundaryData) {
    this.type = 'boundary'
    this.position = boundaryData.position
    this.positionStep = this.position
    this.size = boundaryData.size
  }

  calculate () {

  }

  moveX () {

  }

  moveY () {

  }
  // needed
  die () {
  }
}

module.exports = Boundary
