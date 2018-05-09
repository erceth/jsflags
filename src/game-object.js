class GameObject {
  constructor (width, height, x, y, speed = 0, angle = Math.random() * 360) {
    this.id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.speed = speed
    this.angle = angle
    this.dead = false
    this.angleVelocity = 0
  }
  calculateMove () {
    this.angle += this.angleVelocity // turns the object
    if (this.angle < 0) {
      this.angle = (this.angle + 360) % 360 // prevent angle overflow and keep it positive
    } else {
      this.angle = this.angle % 360 // prevent angle overflow
    }
    let radians = this.angle * Math.PI / 180
    radians = this.round(radians, 4)

    return {
      stepX: (Math.cos(radians) * this.speed + this.x),
      stepY: (Math.sin(radians) * this.speed + this.y)
    }
  }

  // TODO: memoize?
  calculateSides (x, y) {
    return {
      right: x + this.width / 2,
      left: x - this.width / 2,
      top: y - this.height / 2,
      bottom: y - this.height / 2
    }
  }

  moveX (stepX) {
    this.x = stepX
  }

  moveY (stepY) {
    this.y = stepY
  }

  die () {
    this.dead = true
  }

  setPosition (x, y) {
    this.x = x
    this.y = y
  }

  static round (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
  }
}

module.export = GameObject
