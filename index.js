var app = require('express')()
var fs = require('fs')
var vm = require('vm') // TODO: what's this? remove?
var path = require('path')
var config = require('./jsconfig')

module.exports.app = app
module.exports.fs = fs
module.exports.vm = vm

// parse config
let options = config.options
let map = JSON.parse(fs.readFileSync(config.options.map, 'utf8')) // get map

// TODO: serve these from a static folder
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})
app.get('/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/main.js'))
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

// create a new connection

let Connection = require('./src/connection')
let conn = new Connection(options, map)

// create new game
// var Game = require('./src/game')

// var g = new Game(config)

// module.exports.Game = g
