class Bullet {
  constructor (bulletData) {
    this.type = 'bullet'
    this.size = {height: 6, width: 6}
    this.color = bulletData.color
    this.tankSize = bulletData.tankSize
    this.speed = bulletData.options.maxBulletSpeed || 10
    this.radians = bulletData.radians

    // start out in front of tank
    this.position = {
      x: (bulletData.position.x) + (Math.cos(this.radians) * bulletData.tankSize.width),
      y: (bulletData.position.y) + (Math.sin(this.radians) * bulletData.tankSize.height)
    }
    // this.position = {
    // 	x: bulletData.position.x + (round(Math.cos(this.radians), 4) >= 0) ? bulletData.tankSize.x / 2 : -(bulletData.tankRadius),
    // 	y: bulletData.position.y + (round(Math.sin(this.radians), 4) >= 0) ? bulletData.tankRadius : -(bulletData.tankRadius)
    // }; console.log(this.position);
    this.positionStep = {x: this.position.x, y: this.position.y}
    this.dead = false
  }

  calculate () {
    // reset postitionStep
    this.positionStep.x = this.position.x
    this.positionStep.y = this.position.y

    this.positionStep.x = (Math.cos(this.radians) * this.speed + this.position.x)
    this.positionStep.y = (Math.sin(this.radians) * this.speed + this.position.y)
  }

  moveX () {
    this.position.x = this.positionStep.x
  }

  moveY () {
    this.position.y = this.positionStep.y
  }

  die () {
    this.dead = true
  }

  isFriendly (otherBody) {
    return this.color === otherBody.color
  }
}

module.exports = Bullet
