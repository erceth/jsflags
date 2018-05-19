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

app.get('/img/red_tank.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/red_tank.png'))
})
app.get('/img/blue_tank.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/blue_tank.png'))
})
app.get('/img/green_tank.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/green_tank.png'))
})
app.get('/img/purple_tank.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/purple_tank.png'))
})

app.get('/img/red_basetop.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/red_basetop.png'))
})
app.get('/img/blue_basetop.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/blue_basetop.png'))
})
app.get('/img/green_basetop.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/green_basetop.png'))
})
app.get('/img/purple_basetop.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/purple_basetop.png'))
})

app.get('/img/red_flag.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/red_flag.png'))
})
app.get('/img/blue_flag.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/blue_flag.png'))
})
app.get('/img/green_flag.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/green_flag.png'))
})
app.get('/img/purple_flag.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/purple_flag.png'))
})

app.get('/img/grass.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/grass(100x100).png'))
})

app.get('/img/wall.png', function (req, res) {
  res.sendFile(path.join(__dirname, '/img/wall.png'))
})

module.exports.options = config.options

// create new game
var Game = require('./src/game')

var g = new Game(config.map)

module.exports.Game = g
