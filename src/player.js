var globals = require('../index')
var options = globals.options
var io = globals.io
var Tank = require('./tank')
var Flag = require('./flag')

/* Player */
class Player {
  constructor (base, dimensions, resetGame, playerNumber, numOfTanks) {
    this.playerNumber = base.playerNumber
    // this.namespace = 'player' + this.playerNumber

    // this.connection = io.of(this.namespace)
    this.playerColor = base.color
    this.tanks = []
    this.base = {
      position: base.position,
      size: base.size
    }
    this.bullets = []
    this.resetGame = resetGame // reset function
    this.connected = true

    // create tanks
    // for (let i = 0; i < numOfTanks; i++) {
    //   this.tanks.push(new Tank(this.base, this.playerColor, i))
    // }

    // create flags
    this.flag = new Flag(this.playerColor, this.base.position)
    this.score = 0
    this.gameState.score[this.players[i].playerColor] = {color: this.players[i].playerColor, score: 0}

    // connection part
    // this.connection.on('connect', (socket) => {
    //   console.log(this.playerColor + ' connected')
    //   if (options.resetOnJoin) {
    //     this.resetGame()
    //   }
    //   // reset game for new player

    //   socket.on('disconnect', () => {
    //     console.log("goodbye y'all")
    //   })
    //   socket.on('move', (orders) => {
    //     this.moveTanks(orders)
    //   })
    //   socket.on('fire', (orders) => {
    //     this.fireTanks(orders)
    //   })
    // })
  }

  disconnect () {
    this.connected = false
  }

  getTanks () {
    return this.tanks
  }

  getFlag () {
    return this.flag
  }

  moveTanks (orders) {
    for (var i = 0; i < orders.tankNumbers.length; i++) {
      var tankNumber = parseInt(orders.tankNumbers[i], 10)
      if ((tankNumber || tankNumber === 0) && (tankNumber < this.tanks.length && tankNumber >= 0)) {
        this.tanks[tankNumber].moveTanks({speed: orders.speed, angleVel: orders.angleVel})
      }
    }
  }

  fireTanks (orders) {
    if (!this.connected) return
    for (var i = 0; i < orders.tankNumbers.length; i++) {
      var tankNumber = parseInt(orders.tankNumbers[i], 10)
      if ((tankNumber || tankNumber === 0) && (tankNumber < this.tanks.length && tankNumber >= 0)) {
        let newBullet = this.tanks[tankNumber].fireTanks()
        if (newBullet) {
          this.bullets.push(newBullet)
        }
      }
    }
  }

  getBullets () {
    return this.bullets
  }

  removeDeadBullets () {
    this.bullets = this.bullets.filter((bull) => {
      return !bull.dead
    })
  }
}

module.exports = Player
