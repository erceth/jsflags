var app = require('express')()
var fs = require('fs')
var vm = require('vm')
var http = require('http').Server(app)
var io = require('socket.io')(http)
var path = require('path')
var config = require('./jsconfig')

module.exports.app = app
module.exports.fs = fs
module.exports.vm = vm
module.exports.http = http
module.exports.io = io

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})
app.get('/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/main.js'))
})
app.get('/base64Images.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/base64Images.js'))
})
app.get('/styles.css', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/styles.css'))
})

module.exports.options = config.options

// create new game
var Game = require('./src/game')

var g = new Game(config.map)

module.exports.Game = g
