
var Player = require('./player')
var Boundary = require('./boundary')
var Flag = require('./flag')
var globals = require('../index')
var Tank = require('./tank') // TODO: let player handle everything to do with Tanks

var app = globals.app
var fs = globals.fs
var vm = globals.vm
var http = globals.http
var io = globals.io
var options = globals.options

var self // For debugging, TODO: remove

class Game {
  constructor (map) {
    http.listen(options.port, () => { // TODO: move to index.js
      console.log('listening on *:' + options.port)
    })
    self = this // For debugging, TODO: remove
    this.players = []
    this.gameState = {
      tanks: [],
      boundaries: [],
      bullets: [],
      flags: [],
      score: {}
    }
    this.map = JSON.parse(fs.readFileSync(map, 'utf8')) // get map

    // create players
    for (let i = 0; i < this.map.bases.length; i++) {
      this.players.push(new Player(this.map.bases[i], this.map.dimensions, this.resetGame))
    }

    // create tanks
    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this.players[i].tanks.length; j++) {
        this.gameState.tanks.push(this.players[i].tanks[j])
        // TODO: add bullet function
      }

      this.gameState.flags.push(new Flag(this.players[i].playerColor, this.players[i].base.position))
      this.gameState.score[this.players[i].playerColor] = {color: this.players[i].playerColor, score: 0}
    }

    // create boundaries
    for (let k = 0; k < this.map.boundaries.length; k++) {
      this.gameState.boundaries.push(new Boundary(this.map.boundaries[k]))
    }

    // connections on default namespace
    io.on('connection', (socket) => {
      var modifiedPlayers = []
      for (var i = 0; i < this.players.length; i++) {
        var modifiedPlayer = {
          playerColor: this.players[i].playerColor,
          playerNumber: this.players[i].playerNumber,
          namespace: this.players[i].namespace,
          base: this.players[i].base
        }

        modifiedPlayers.push(modifiedPlayer)
      }

      io.emit('init', {dimensions: this.map.dimensions, players: modifiedPlayers, scoreboard: this.map.scoreboard, tanks: this.gameState.tanks})
    })

    // emit game state
    setInterval(() => {
      this.update()
      io.emit('refresh', this.gameState)
    }, 1000 / 60) // denom is fps

    // update game score
    setInterval(() => {
      for (var i = 0, max = this.gameState.flags.length; i < max; i++) {
        if (this.gameState.flags[i].tankToFollow) {
          this.gameState.score[this.gameState.flags[i].tankToFollow.color].score += options.pointsForCarry
        }
      }
    }, 1000 / 1)

    // a part of tank prototype
    // TODO: move this to it's own class
    Tank.prototype.addBulletToGame = (bullet) => {
      this.gameState.bullets.push(bullet)
    }
  }
  
  // TODO: refactor to not use self
  resetGame () {
    if (self.gameState.score.red) { self.gameState.score.red.score = 0 } // TODO: simple loop?
    if (self.gameState.score.blue) { self.gameState.score.blue.score = 0 }
    if (self.gameState.score.green) { self.gameState.score.green.score = 0 }
    if (self.gameState.score.purple) { self.gameState.score.purple.score = 0 }
    for (var i = 0; i < self.gameState.tanks.length; i++) {
      self.gameState.tanks[i].die(5000)
    }
    for (var j = 0; j < self.gameState.flags.length; j++) {
      self.gameState.flags[j].die()
    }
  }

  update () {
    // TANKS
    let b1, b2, i = this.gameState.tanks.length, j, k, b1Right, b1Left, b1Top, b1Bottom, b2Right, b2Left, b2Top, b2Bottom
    // outterLoop: // eslint-disable-line no-labels
    while ((i -= 1) >= 0) {
      let okToMoveX = true, okToMoveY = true, okToMoveXBoundary = true, okToMoveYBoundary = true
      b1 = this.gameState.tanks[i]
      let move = b1.calculateMove()
      let b1Sides = b1.calculateSides(move.stepX, move.stepY) // calculate new sides of body if it moved
      
      // other tanks
      j = this.gameState.tanks.length
      while ((j -= 1) >= 0) {
        b2 = this.gameState.tanks[j]
        if (b1.id === b2.id) { continue } // ignore self
        if (b2.ghost) { continue } // drive through ghost tanks

        let b2Sides = b2.calculateSides(b2.position.x, b2.position.y) // get sides of other body

        if (!(b1Sides.right < b2Sides.left || b1Sides.left > b2Sides.right || b1Sides.top > b2Sides.bottom || b1Sides.bottom < b2Sides.top)) {
          okToMoveX = false
          okToMoveY = false
        }
      }

      // map edge
      if (b1Sides.right > this.map.dimensions.width || b1Sides.left < 0) {
        okToMoveXBoundary = false
      }
      if (b1Sides.bottom > this.map.dimensions.height || b1Sides.top < 0) {
        okToMoveYBoundary = false
      }

      // boundaries
      j = this.gameState.boundaries.length
      while ((j -= 1) >= 0) {
        b2 = this.gameState.boundaries[j]
        let b2Sides = b2.calculateSides(b2.position.x, b2.position.y)

        if (!(b1Sides.right < b2Sides.left || b1Sides.left > b2Sides.right || b1Sides.top > b2Sides.bottom || b1Sides.bottom < b2Sides.top)) {
          okToMoveXBoundary = false
          okToMoveYBoundary = false
        }
      }
      if (b1Sides.right > this.map.dimensions.width || b1Sides.left < 0) {
        okToMoveXBoundary = false
      }
      if (b1Sides.bottom > this.map.dimensions.height || b1Sides.top < 0) {
        okToMoveYBoundary = false
      }

      // finally move!
      if ((okToMoveX || b1.ghost) && okToMoveXBoundary) {
        b1.moveX(move.stepX)
      }
      if ((okToMoveY || b1.ghost) && okToMoveYBoundary) {
        b1.moveY(move.stepY)
      }
      if (!b1.dead && b1.ghost && okToMoveX && okToMoveY) {
        b1.noLongerGhost()
      }

      // check if tank intersect with flag
      k = this.gameState.flags.length
      while ((k -= 1) >= 0) {
        let b2 = this.gameState.flags[k]
        if ((b1.color === b2.color) || b2.tankToFollow) { continue }
        let b2Sides = b2.calculateSides(b2.position.x, b2.position.y)
        if (!(b1Sides.right < b2Sides.left || b1Sides.left > b2Sides.right || b1Sides.top > b2Sides.bottom || b1Sides.bottom < b2Sides.top)) {
          b2.tankToFollow = b1
        }
      }
    }

    // BULLETS
    if (this.gameState.bullets.length > 0) {
      i = this.gameState.bullets.length
      while ((i -= 1) >= 0) { // extract this duplicate code to template function
        b1 = this.gameState.bullets[i]
        let move = b1.calculateMove()
        let b1Sides = b1.calculateSides(move.stepX, move.stepY) // calculate new sides of body if it moved

        j = this.gameState.tanks.length
        while ((j -= 1) >= 0) {
          b2 = this.gameState.tanks[j]
          if (b2.dead) { continue }

          let b2Sides = b2.calculateSides(b2.position.x, b2.position.y) // get sides of other body

          if (!(b1Sides.right < b2Sides.left || b1Sides.left > b2Sides.right || b1Sides.top > b2Sides.bottom || b1Sides.bottom < b2Sides.top)) {
            b1.die()
            b2.die()
            break //outterLoop // eslint-disable-line no-labels
          }
        }
        k = this.gameState.boundaries.length
        while ((k -= 1) >= 0) {
          b2 = this.gameState.boundaries[k]
          let b2Sides = b2.calculateSides(b2.position.x, b2.position.y)

          if (!(b1Sides.right < b2Sides.left || b1Sides.left > b2Sides.right || b1Sides.top > b2Sides.bottom || b1Sides.bottom < b2Sides.top)) {
            b1.die()
            b2.die()
            break
          }
        }
        if (b1Sides.right < 0 || b1Sides.left > this.map.dimensions.width || b1Sides.bottom < 0 || b1Sides.top > this.map.dimensions.height) {
          b1.die()
        }
        b1.moveX(move.stepX)
        b1.moveY(move.stepY)
      }

      // filter out dead bullets
      this.gameState.bullets = this.gameState.bullets.filter((bullet) => {
        return !bullet.dead
      })
    }

    // FLAGS
    i = this.gameState.flags.length
    while ((i -= 1) >= 0) {
      if (!this.gameState.flags[i].tankToFollow) { continue }
      let flag = this.gameState.flags[i]
      let tank = flag.tankToFollow
      if (tank && !tank.dead) {
        flag.setPosition(tank.position.x, tank.position.y)
      }
      if (tank && tank.dead) {
        flag.slowDeath()
        continue
      }
      let flagSides = b1.calculateSides(flag.position.x, flag.position.y)
      // does flag intersect with base
      let j = this.players.length
      while ((j -= 1) >= 0) {
        if (flag.tankToFollow.color !== this.players[j].playerColor) { continue }
        let base = this.players[j].base

        let baseRight = base.position.x + base.size.width / 2
        let baseLeft = base.position.x - base.size.width / 2

        let baseTop = base.position.y - base.size.height / 2
        let baseBottom = base.position.y + base.size.height / 2

        if (!(flagSides.right < baseLeft || flagSides.left > baseRight || flagSides.top > baseBottom || flagSides.bottom < baseTop)) {
          this.gameState.score[tank.color].score += options.pointsForCapture
          flag.die()
        }
      }
    }
  }
}

module.exports = Game
