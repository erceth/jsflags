var globals = require('../index')
var options = globals.options

class Flag {
  constructor (color, position) {
    this.type = 'flag'
    this.originalPosition = position
    this.position = this.originalPosition
    this.size = {height: 19, width: 19}
    this.color = color
    this.tankToFollow = null
  }

  update () {
    if (this.tankToFollow && !this.tankToFollow.dead) {
      this.position = {
        x: this.tankToFollow.position.x,
        y: this.tankToFollow.position.y
      }
    }
    if (this.tankToFollow && this.tankToFollow.dead) {
      this.tankToFollow = null
      this.slowDeath()
    }
  }

  die () {
    this.position = {
      x: this.originalPosition.x,
      y: this.originalPosition.y
    }
    if (this.tankToFollow) {
      this.tankToFollow.dropFlag()
    }
    this.tankToFollow = null
  }

  slowDeath () {
    var self = this
    setTimeout(() => {
      if (!self.tankToFollow) {
        self.die()
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
