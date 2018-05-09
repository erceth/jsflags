
var globals = require('../index')
var Game = require('./src/game')
var app = globals.app

var http = require('http').Server(app)
var io = require('socket.io')(http)

class Connection {
  constructor (options, map) {
    this.options = options
    this.map = map

    http.listen(this.options.port, () => { // TODO: move to index.js
      console.log('listening on *:' + this.options.port)
    })

    // inital connection, send availablePlayers
    io.on('connection', (socket) => {
      let availablePlayers = this.game.getAvailablePlayers()

      io.emit('init', {
        dimensions: this.map.dimensions,
        players: availablePlayers,
        scoreboard: this.map.scoreboard,
        tanks: this.gameState.getTanks()
      })
    })

    // client connecting as player
    for (let i = 0; i < this.map.bases.length; i++) {
      let playerNumber = this.map.bases[i].playerNumber
      this.connection = io.of('player' + playerNumber) // namespace
     
      this.connection.on('connect', (socket) => {
        if (!this.game.isPlayerAvailable(playerNumber)) {
          console.log(`player ${playerNumber} is not available`)
          return
        }

        this.game.createPlayer(playerNumber)
        console.log(`player ${playerNumber} connected`)
        if (this.options.resetOnJoin) {
          this.game.resetGame()
        }

        socket.on('disconnect', () => {
          console.log(`Player ${playerNumber} disconnected`)
          this.game.removePlayer(playerNumber)
        })

        socket.on('move', (orders) => {
          this.game.moveTanks(orders, playerNumber)
        })

        socket.on('fire', (orders) => {
          this.game.fireTanks(orders, playerNumber)
        })
      })
    }

    // emit game state
    setInterval(() => {
      this.update()
      io.emit('refresh', this.game.gameState)
    }, 1000 / 60) // denom is fps

    this.game = new Game(this.options, map)
  }
}

module.exports = Connection
