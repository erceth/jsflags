var globals = require('../index')
var options = globals.options
var io = globals.io
var Tank = require('./tank')

/* Player AND Connection */
class Player {
  constructor (base, dimensions, resetGame, sendInit) {
    this.playerNumber = base.playerNumber
    this.namespace = 'player' + this.playerNumber
    this.connection = io.of(this.namespace)
    this.playerColor = base.color
    this.tanks = []
    this.base = {
      position: base.position,
      size: base.size
    }
    this.resetGame = resetGame // reset function
    this.sendInit = sendInit
    this.connected = false

    for (var i = 0; i < options.numOfTanks; i++) {
      this.tanks.push(new Tank(this.base, this.playerColor, i))
    }

    // connection part
    this.connection.on('connect', (socket) => {
      if (this.connected) {
        console.log('player already in use')
        socket.disconnect(0)
      }

      console.log(this.playerColor + ' connected')
      if (options.resetOnJoin) {
        this.resetGame() // TODO: extract to connection class
      }
      // reset game for new player

      socket.on('disconnect', () => {
        this.connected = false
        this.sendInit()
        console.log("goodbye y'all")
      })
      socket.on('move', (orders) => {
        this.moveTanks(orders)
      })
      socket.on('fire', (orders) => {
        this.fireTanks(orders)
      })
      this.connected = true
      this.sendInit() // TODO: extract to connection class
    })
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
    for (var i = 0; i < orders.tankNumbers.length; i++) {
      var tankNumber = parseInt(orders.tankNumbers[i], 10)
      if ((tankNumber || tankNumber === 0) && (tankNumber < this.tanks.length && tankNumber >= 0)) {
        this.tanks[tankNumber].fireTanks({speed: orders.speed, angleVel: orders.angleVel})
      }
    }
  }
}

module.exports = Player
