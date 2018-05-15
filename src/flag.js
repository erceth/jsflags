var globals = require('../index')
var options = globals.options
let GameObject = require('./game-object')

class Flag extends GameObject {
  constructor (color, position) {
    super(19, 19, position.x, position.y)
    this.type = 'flag'
    this.originalPositionX = position.x
    this.originalPositionY = position.y
    this.position = {
      x: this.originalPositionX,
      y: this.originalPositionY
    }
    this.color = color
    this.tankToFollow = null
  }

  die () {
    super.setPosition(this.originalPositionX, this.originalPositionY)
    this.tankToFollow = null
  }

  slowDeath () {
    this.tankToFollow = null
    setTimeout(() => {
      if (!this.tankToFollow) {
        this.die()
      }
    }, options.flagRepawnWait)
  }

  followThisTank (tank) {
    if (!this.tankToFollow) {
      this.tankToFollow = tank
    }
  }
}

module.exports = Flag
