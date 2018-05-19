# JSFlags

## About

Robot AI tanks and game engine written 100% in nodeJS and javascript from scratch. A rewrite of [this](https://github.com/chris-clm09/bzflag) BTZFlag Python game. Tanks move about a 2d world shooting enemy tanks and stealing flags for points. Actions of tanks are recieved from a Javascript written artificial intelligence. Goal was to write the game with as few dependencies as possible to make the game super portable and easy to set up. This project can be a fun hackathon where each member creates an AI and battle each other. View in Chrome.

## How to set up

- install nodejs (version 8)
- Download jsflags and cd into the directory
- Run: `npm start`
- open localhost:8003 in Chrome
- to enter manual mode, select a player

## How to connect AI
- follow set up steps above ^
- run [jsflags-ai](https://github.com/erceth/jsflags-ai) to connect 

## Observer
- to simply watch the AI control the tanks click Observer

## Screenshot
![jsflag screenshot](http://ericethington.com/assets/tanks2.png "jsflag gameplay")

## Manual controls
- enter manual mode by navigating to the host and selecting a player
- Select a tank by pushing keys of your keyboard. Manual mode current supports eight tanks: 1, 2, 3, 4, Q, W, E, R
- To move selected tanks click once anywhere on the map.
- To fire selected tanks press the spacebar.

## Rules of the game
- Objective is to earn more points than everyone else.
- You earn one point for every second your tank holds the flag.
- You earn 100 points for returning the enemy flag to your base.
- The flag will reset to the enemy base after you return it to your base and recieve capture points.

## More info
- This game can run on a local area networks.  After you run jsflags server another computer on the same network can connect their AI to your server using your local IP address.
- Various game options are available in jscong.js
