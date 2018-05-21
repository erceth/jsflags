// let map = 'square.json'
// let map = 'plain_field.json'
let map = 'one_vs_one.json'
// let map = 'one_vs_one_plain.json'

let config = {
  options: {
    numOfTanks: 4,
    maxTankSpeed: 1,
    friendlyFireSafe: true,
    port: 8003,
    maxBulletSpeed: 5,
    respawnTime: 10000,
    flagRepawnWait: 10000,
    pointsForCarry: 1,
    pointsForCapture: 100,
    resetOnJoin: true,
    maxFireFrequency: 1000,
    map: map
  }
}

module.exports = config
