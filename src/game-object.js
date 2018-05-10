class GameObject {
  constructor (width, height, x, y, speed = 0, angle = Math.random() * 360) {
    this.id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    this.size = {
      width,
      height
    }
    this.position = {
      x,
      y
    }
    this.speed = speed
    this.angle = angle
    this.dead = false
    this.angleVel = 0
  }

  static round (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
  }

  // calculate angle, update angle, calculate x, y position using angle, return x, y
  calculateMove () {
    // always allowed to turn
    this.angle += this.angleVel // turns the object
    if (this.angle < 0) {
      this.angle = (this.angle + 360) % 360 // prevent angle overflow and keep it positive
    } else {
      this.angle = this.angle % 360 // prevent angle overflow
    }
    this.radians = this.angle * Math.PI / 180
    this.radians = GameObject.round(this.radians, 4)

    return {
      stepX: (Math.cos(this.radians) * this.speed + this.position.x),
      stepY: (Math.sin(this.radians) * this.speed + this.position.y)
    }
  }

  // TODO: memoize?
  calculateSides (x, y) {
    return {
      right: x + this.size.width / 2,
      left: x - this.size.width / 2,
      top: y - this.size.height / 2,
      bottom: y - this.size.height / 2
    }
  }

  moveX (stepX) {
    this.position.x = stepX
  }

  moveY (stepY) {
    this.position.y = stepY
  }

  die () {
    this.dead = true
  }

  setPosition (x, y) {
    this.position.x = x
    this.position.y = y
  }
}

module.exports = GameObject
