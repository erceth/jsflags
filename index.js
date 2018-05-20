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
app.get('/socket.io.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/socket.io.js'))
})
app.get('/jquery-2.2.4.min.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/jquery-2.2.4.min.js'))
})

let options = config.options

// parse commandline args
var commandlineArgs = {}
for (var i = 2; i < process.argv.length; i++) {
  if (process.argv[i].indexOf('=')) {
    var keyValue = process.argv[i].split('=')
    keyValue[1] = parseInt(keyValue[1], 10) || keyValue[1] // if int change to int
    commandlineArgs[keyValue[0]] = keyValue[1]
  }
}

for (let key in commandlineArgs) {
  options[key] = commandlineArgs[key]
}

module.exports.options = options

// create new game
var Game = require('./src/game')

var g = new Game('maps/' + options.map)

module.exports.Game = g
