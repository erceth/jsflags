let GameObject = require('./game-object')

class Bullet extends GameObject {
  constructor (bulletData) {
    // start out in front of tank
    let x = (bulletData.position.x) + (Math.cos(bulletData.radians) * bulletData.tankSize.width)
    let y = (bulletData.position.y) + (Math.sin(bulletData.radians) * bulletData.tankSize.height)
    let speed = bulletData.options.maxBulletSpeed || 10
    super(6, 6, x, y, speed, bulletData.angle)
    this.type = 'bullet'
    this.color = bulletData.color
  }
}

module.exports = Bullet
