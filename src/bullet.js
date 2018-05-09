let GameObject = require('./game-object')

class Bullet extends GameObject {
  constructor (bulletData) {
    // start out in front of tank
    let x = bulletData.x + Math.cos(bulletData.angle) * bulletData.tankSize.width
    let y = bulletData.y + Math.sin(bulletData.angle) * bulletData.tankSize.height
    super(6, 6, x, y, bulletData.options.maxBulletSpeed || 10, bulletData.angle)
    this.type = 'bullet'
    // this.size = {height: 6, width: 6}
    this.color = bulletData.color
    this.tankSize = bulletData.tankSize
    this.speed = bulletData.options.maxBulletSpeed || 10
    this.radians = bulletData.radians
  }
}

module.exports = Bullet
