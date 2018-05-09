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

    this.ghost = true // true if just spawned and hasn't moved yet
    this.hasFlag = false
    this.reloading = false
  }

  moveTanks (order) {
    if (this.dead) { return }
    this.ghost = false
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
      options: options,
      x: this.x,
      y: this.y,
      tankSize: this.size
    })
    this.reloading = true
    setTimeout(() => {
      this.reloading = false
    }, options.maxFireFrequency)
    return newBullet
  }

  die (respawnTime) {
    super()
    this.ghost = true
    this.x = 0
    this.y = 0
    this.hasFlag = false
    if (!respawnTime) {
      respawnTime = options.respawnTime
    }
    setTimeout(() => {
      this.dead = false
      this.setPosition(this.base.position.x, this.base.position.y)
      this.angleVel = 0
      this.speed = 0
    }, respawnTime)
  }

  carryFlag (flag) {
    this.hasFlag = flag.color
  }

  dropFlag () {
    this.hasFlag = false
  }
}

module.exports = Tank
