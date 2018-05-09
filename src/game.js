
var Player = require('./player')
var Boundary = require('./boundary')
var globals = require('../index')

var app = globals.app
var fs = globals.fs
var vm = globals.vm
var http = globals.http
var io = globals.io

var self // For debugging, TODO: remove

class Game {
  constructor (options, map) {
    self = this // For debugging, TODO: remove
    this.players = []
    this.gameState = {
      tanks: [],
      boundaries: [],
      bullets: [],
      flags: [],
      score: {}
    }

    this.options = options
    this.map = map

    // create boundaries
    for (let k = 0; k < this.map.boundaries.length; k++) {
      this.gameState.boundaries.push(new Boundary(this.map.boundaries[k]))
    }

    // update game score
    setInterval(() => {
      for (var i = 0; i < this.players.flags.length; i++) {
        if (this.players.flags[i].tankToFollow) {
          this.players.score[this.players.flags[i].tankToFollow.color].score += this.options.pointsForCarry
        }
      }
    }, 1000 / 1)

    setInterval(() => {
      this.update()
      io.emit('refresh', this.gameState)
    }, 1000 / 60) //denom is fps
  }

  isPlayerAvailable (playerNumber) {
    this.getAvailablePlayers().find((pl) => pl.playerNumber === playerNumber)
  }

  getAvailablePlayers () {
    let availablePlayers = this.map.bases.filter((base) => {
      let pl = this.players.find((player) => {
        return player.playerNumber === base.playerNumber
      })
      return !pl || !pl.connected
    }).map((player) => {
      return {
        'playerNumber': player.playerNumber,
        'color': player.color
      }
    })
    return availablePlayers
  }

  createPlayer (playerNumber = this.map.bases.length - 1) {
    if (this.players.length < this.map.bases.length) {
      this.players.push(new Player(this.map.bases[playerNumber], this.map.dimensions, this.resetGame, playerNumber))
    }
  }

  removePlayer (playerNumber) {
    let player = this.players.find((pl) => pl.playerNumber === playerNumber)
    if (player) {
      player.disconnect()
    }
  }

  resetGame () {
    if (this.gameState.score.red) { this.gameState.score.red.score = 0 } // TODO: simple loop?
    if (this.gameState.score.blue) { this.gameState.score.blue.score = 0 }
    if (this.gameState.score.green) { this.gameState.score.green.score = 0 }
    if (this.gameState.score.purple) { this.gameState.score.purple.score = 0 }
    for (let i = 0; i < this.players.length; i++) {
      let tanks = this.players[i].getTanks()
      let flag = this.players[i].getFlag()
      for (let j = 0; j < tanks.length; i++) {
        tanks[j].die(5000)
      }
      flag.die()
    }
  }

  moveTanks (orders, playerNumber) {
    let player = this.players.find((pl) => pl.playerNumber === playerNumber)
    player.moveTanks(orders)
  }

  fireTanks (orders, playerNumber) {
    let player = this.players.find((pl) => pl.playerNumber === playerNumber)
    player.fireTanks(orders)
  }
  
  update() {
    let setBodies1 = [this.gameState.tanks] // sets of moving bodies
    let setBodies2 = [this.gameState.tanks, this.gameState.boundaries] // sets of other bodies to check against
    
    setBodies1.forEach(bodies1) {
      let i = bodies1.length
      outterLoop:
      while ((i -= 1) >= 0) {
        let okToMoveX = true, okToMoveY = true
        let b1 = bodies1[i]
        let move = b1.calculateMove() // get desired move of body 1
        b1Sides = b1.calculateSides(move.x, move.y) // calculate new sides of body if it moved
        setBodies2.forEach(bodies2) {
          let j = bodies2.length
          while ((j -= 1) >= 0) {
            let b2 = bodies2[j]
            if (b1.id === b2.id) { continue } // ignore self
            if (b2.ghost) { continue } // drive through ghost tanks
            let b2Sides = b2.calculateSides(b2.x, b2.y) // get sides of other body

            if (!(b1Sides.right < b2Sides.left || b1Sides.left > b2Sides.right || b1Sides.top > b2Sides.bottom || b1Sides.bottom < b2Sides.top)) {
              okToMoveX = false
              okToMoveY = false
              break outterLoop
            }
            if (b1Sides.right > this.map.dimensions.width || b1Sides.left < 0) {
              okToMoveX = false
            }
            if (b1Sides.bottom > this.map.dimensions.height || b1Sides.top < 0) {
              okToMoveY = false
            }
          }
        }
        // finally move!
        if (okToMoveX) {
          b1.moveX(move.x)
        }
        if (okToMoveY) {
          b1.moveY(move.y)
        }
      }
    }


    let i = this.gameState.players.length;
    while ((i -= 1) >= 0) {
      let player = this.gameState.players[i]

      // check bullets
      let bullets = player.getBullets()
      let j = bullets.length
      while ((j -= 1) >= 0) {
        let b1 = bullets[j]
        let move = b1.calculateMove() // get desired move of body 1
        b1Sides = b1.calculateSides(move.x, move.y) // calculate new sides of body if it moved
        setBodies2.forEach(bodies2) {
          let k = bodies2.length
          while ((k -= 1) >= 0) {
            let b2 = bodies2[k]
            let b2Sides = b2.calculateSides(b2.x, b2.y) // get sides of other body

            if (!(b1Sides.right < b2Sides.left || b1Sides.left > b2Sides.right || b1Sides.top > b2Sides.bottom || b1Sides.bottom < b2Sides.top)) {
              b1.die()
              b2.die()
              break
            }
            if (b1Right < 0 || b1Left > this.map.dimensions.width || b1Bottom < 0 || b1Top > this.map.dimensions.height) {
              b1.die()
            }
            b1.moveX()
            b1.moveY()
          }
        }
      }
      player.removeDeadBullets()

      // update flag
      let flag = player.flag
      let tank = flag.tankToFollow
      if (tank) {
        if (tank.dead && !flag.slowDeathTimeout ) { // tank dropped flag on death
          flag.slowDeath()
        }
        let base = tank.base
        let tankColor = tank.color

        let flagSides = flag.calculateSides()

        let baseRight = base.position.x + base.size.width / 2
        let baseLeft = base.position.x - base.size.width / 2

        let baseTop = base.position.y - base.size.height / 2
        let baseBottom = base.position.y + base.size.height / 2

        if (!(flagSides.right < baseLeft || flagSides.left > baseRight || flagSides.top > baseBottom || flagSides.bottom < baseTop)) {
          this.gameState.score[tankColor].score += this.options.pointsForCapture
          flag.die()
        } else {
          flag.setPosition(tank.x, tank.y)
        }
      }
    }
  }
}

module.exports = Game
