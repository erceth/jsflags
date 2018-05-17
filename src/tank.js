var globals = require('../index')
var options = globals.options
var Bullet = require('./bullet')
let GameObject = require('./game-object')

class Tank extends GameObject {
  constructor (base, color, tankNumber) {
    super(20, 20, base.position.x, base.position.y)

    this.type = 'tank'
    this.color = color

    this.tankNumber = tankNumber
    this.base = {
      position: base.position,
      size: base.size
    }

    this.ghost = true // can go through other tanks
    this.hasFlag = false
    this.reloading = false
    this.respawnTimeoutSet = null
  }

  moveTanks (order) {
    if (this.dead) { return }
    this.angleVel = order.angleVel

    // keep speed within max speed
    if (order.speed > options.maxTankSpeed) {
      order.speed = options.maxTankSpeed
    }
    if (order.speed < -options.maxTankSpeed) {
      order.speed = -options.maxTankSpeed
    }

    this.speed = order.speed
  }

  fireTanks () {
    if (this.dead) { return }
    if (this.reloading) { return }
    let newBullet = new Bullet({
      // TODO: move id generator to service
      color: this.color,
      angle: this.angle,
      radians: this.radians,
      options: options,
      position: {
        x: this.position.x,
        y: this.position.y
      },
      tankSize: this.size
    })
    this.reloading = true
    setTimeout(() => {
      this.reloading = false
    }, options.maxFireFrequency)
    this.addBulletToGame(newBullet)
    // return newBullet
  }

  die (respawnTime) {
    super.die()
    this.ghost = true
    // this.position.x = 1
    // this.position.y = 1
    this.hasFlag = false
    this.angleVel = 0
    this.speed = 0
    if (this.respawnTimeoutSet) { // prevents multiple timeouts
      return
    }
    if (!respawnTime) {
      respawnTime = options.respawnTime
    }
    setTimeout(() => {
      this.dead = false
      this.setPosition(this.base.position.x, this.base.position.y)
      this.respawnTimeoutSet = false
    }, respawnTime)
    this.respawnTimeoutSet = true
  }

  noLongerGhost () {
    this.ghost = false
  }

  carryFlag (flag) {
    this.hasFlag = flag.color
  }

  dropFlag () {
    this.hasFlag = false
  }
}

module.exports = Tank
