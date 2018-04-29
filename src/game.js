
var Player = require('./player')
var Boundary = require('./boundary')
var Flag = require('./flag')
var globals = require('../index')
var Tank = require('./tank')

var app = globals.app
var fs = globals.fs
var vm = globals.vm
var http = globals.http
var io = globals.io
var options = globals.options

class Game {
  constructor (map) {
    http.listen(options.port, () => { // TODO: move to index.js
      console.log('listening on *:' + options.port)
    })

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
      this.players.push(new Player(this.map.bases[i], this.map.dimensions))
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
    Tank.prototype.addBulletToGame = (bullet) => {
      this.gameState.bullets.push(bullet)
    }

    Player.prototype.resetGame = () => {
      if (this.gameState.score.red) { this.gameState.score.red.score = 0 } // TODO: simple loop?
      if (this.gameState.score.blue) { this.gameState.score.blue.score = 0 }
      if (this.gameState.score.green) { this.gameState.score.green.score = 0 }
      if (this.gameState.score.purple) { this.gameState.score.purple.score = 0 }
      for (var i = 0; i < this.gameState.tanks.length; i++) {
        this.gameState.tanks[i].die(5000)
      }
      for (var j = 0; j < this.gameState.flags.length; j++) {
        this.gameState.flags[j].die()
      }
    }
  }

  update () {
    // TANKS
    let b1, b2, i = this.gameState.tanks.length, j, k, b1Right, b1Left, b1Top, b1Bottom, b2Right, b2Left, b2Top, b2Bottom
    while ((i -= 1) >= 0) {
      let okToMoveX = true, okToMoveY = true
      b1 = this.gameState.tanks[i]
      b1.calculate()
      j = this.gameState.tanks.length
      while ((j -= 1) >= 0) {
        if (i === j) { continue }
        b1Right = b1.positionStep.x + b1.size.width / 2
        b1Left = b1.positionStep.x - b1.size.width / 2

        b1Top = b1.positionStep.y - b1.size.height / 2
        b1Bottom = b1.positionStep.y + b1.size.height / 2

        b2 = this.gameState.tanks[j]
        if (b2.ghost) { continue } // drive through ghost tanks

        b2Right = b2.position.x + b2.size.width / 2
        b2Left = b2.position.x - b2.size.width / 2

        b2Top = b2.position.y - b2.size.height / 2
        b2Bottom = b2.position.y + b2.size.height / 2

        if (!(b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top)) {
          okToMoveX = false
          okToMoveY = false
          break
        }
        if (b1Right > this.map.dimensions.width || b1Left < 0) {
          okToMoveX = false
        }
        if (b1Bottom > this.map.dimensions.height || b1Top < 0) {
          okToMoveY = false
        }
      }
      j = this.gameState.boundaries.length
      while ((j -= 1) >= 0) {
        b2 = this.gameState.boundaries[j]

        b2Right = b2.position.x + b2.size.width / 2
        b2Left = b2.position.x - b2.size.width / 2

        b2Top = b2.position.y - b2.size.height / 2
        b2Bottom = b2.position.y + b2.size.height / 2
        if (!(b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top)) {
          okToMoveX = false
          okToMoveY = false
          break
        }
      }
      if (okToMoveX) {
        b1.moveX()
      }
      if (okToMoveY) {
        b1.moveY()
      }
    }
    // BULLETS
    if (this.gameState.bullets.length > 0) {
      i = this.gameState.bullets.length
      while ((i -= 1) >= 0) { // extract this duplicate code to template function
        b1 = this.gameState.bullets[i]
        b1.calculate()
        j = this.gameState.tanks.length
        while ((j -= 1) >= 0) {
          b2 = this.gameState.tanks[j]

          b1Right = b1.position.x + b1.size.width / 2
          b1Left = b1.position.x - b1.size.width / 2

          b1Top = b1.position.y - b1.size.height / 2
          b1Bottom = b1.position.y + b1.size.height / 2

          b2Right = b2.position.x + b2.size.width / 2
          b2Left = b2.position.x - b2.size.width / 2

          b2Top = b2.position.y - b2.size.height / 2
          b2Bottom = b2.position.y + b2.size.height / 2

          if (!(b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top)) {
            b1.die()
            b2.die()
            break
          }
        }
        k = this.gameState.boundaries.length
        while ((k -= 1) >= 0) {
          b2 = this.gameState.boundaries[k]

          b2Right = b2.position.x + b2.size.width / 2
          b2Left = b2.position.x - b2.size.width / 2

          b2Top = b2.position.y - b2.size.height / 2
          b2Bottom = b2.position.y + b2.size.height / 2

          if (!(b1Right < b2Left || b1Left > b2Right || b1Top > b2Bottom || b1Bottom < b2Top)) {
            b1.die()
            b2.die()
            break
          }
        }
        if (b1Right < 0 || b1Left > this.map.dimensions.width || b1Bottom < 0 || b1Top > this.map.dimensions.height) {
          b1.die()
        }
        b1.moveX()
        b1.moveY()
      }

      // filter out dead bullets
      this.gameState.bullets = this.gameState.bullets.filter((bullet) => {
        return !bullet.dead
      })
    }
    let tank, flag, flagRight, flagLeft, flagTop, flagBottom, tankRight, tankLeft, tankTop, tankBottom
    i = this.gameState.flags.length
    while ((i -= 1) >= 0) {
      flag = this.gameState.flags[i]
      j = this.gameState.tanks.length
      while ((j -= 1) >= 0) {
        tank = this.gameState.tanks[j]
        if (tank.dead) { continue }
        flagRight = flag.position.x + flag.size.width / 2
        flagLeft = flag.position.x - flag.size.width / 2

        flagTop = flag.position.y - flag.size.height / 2
        flagBottom = flag.position.y + flag.size.height / 2

        tankRight = tank.position.x + tank.size.width / 2
        tankLeft = tank.position.x - tank.size.width / 2

        tankTop = tank.position.y - tank.size.height / 2
        tankBottom = tank.position.y + tank.size.height / 2
        if (!(flagRight < tankLeft || flagLeft > tankRight || flagTop > tankBottom || flagBottom < tankTop)) {
          if (tank.color !== flag.color) {
            flag.followThisTank(tank)
            tank.carryFlag(flag)
          } else {
            // flag.die();  //same color as flag, reset
          }
          // break;
        }
      }
      flag.update()
    }

    // check if flag is returned to base
    let base
    i = this.gameState.flags.length
    while ((i -= 1) >= 0) {
      flag = this.gameState.flags[i]
      j = this.players.length
      while ((j -= 1) >= 0) {
        base = this.players[j].base
        if (!flag.tankToFollow) { continue }
        if (!(flag.tankToFollow.color === this.players[j].playerColor)) { continue } // tank returns to it's base
        flagRight = flag.position.x + flag.size.width / 2
        flagLeft = flag.position.x - flag.size.width / 2

        flagTop = flag.position.y - flag.size.height / 2
        flagBottom = flag.position.y + flag.size.height / 2

        let baseRight = base.position.x + base.size.width / 2
        let baseLeft = base.position.x - base.size.width / 2

        let baseTop = base.position.y - base.size.height / 2
        let baseBottom = base.position.y + base.size.height / 2

        if (!(flagRight < baseLeft || flagLeft > baseRight || flagTop > baseBottom || flagBottom < baseTop)) {
          this.gameState.score[flag.tankToFollow.color].score += options.pointsForCapture
          flag.die()
        }
      }
    }
  }
}

module.exports = Game
