var globals = require('../index')
var options = globals.options
let GameObject = require('./game-object')

class Flag extends GameObject {
  constructor (color, position) {
    super(19, 19, position.x, position.y)
    this.type = 'flag'
    this.originalPosition = position
    this.color = color
    this.tankToFollow = null
    this.slowDeathTimeout = null
  }

  die () {
    super()
    this.setPosition(this.originalPosition.x, this.originalPosition.y)
    this.tankToFollow = null
  }

  slowDeath () {
    this.slowDeathTimeout = setTimeout(() => {
      if (!this.tankToFollow) {
        this.die()
        this.slowDeathTimeout = null
      }
    }, options.flagRepawnWait)
  }

  followThisTank (tank) {
    if (!this.tankToFollow) {
      if (this.slowDeathTimeout) {
        clearTimeout(this.slowDeathTimeout)
      }
      this.tankToFollow = tank
    }
  }
}

module.exports = Flag
