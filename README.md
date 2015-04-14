# JSFlags

## About

Robot AI tanks and game engine written 100% in nodeJS and javascript from scratch. A rewrite of [this](https://github.com/chris-clm09/bzflag) BTZFlag Python game. Tanks move about a 2d world shooting enemy tanks and stealing flags for points. Actions of tanks are recieved from a Javascript written artificial intelligence. Goal was to write the game with as few dependencies as possible to make the game super portable and easy to set up. This project is written to be a fun hackathon where each member creates an AI and battle each other. I also plan to make several improvments from the original python game including a manual mode. Still in development. View in Chrome.

## How to set up

- install nodejs (google is your friend)
- Download jsflags
- in the project root run: node index.js
- open localhost:8003 in Chrome
- run [jsflags-ai](https://github.com/erceth/jsflags-ai) to connect 
- to enter manual mode select player (note: running manual mode and connecting an AI to the same player will cause tanks to listen to both commands)
- to simply watch the AI control the tanks click Observer

## Screenshot
![jsflag screenshot](https://dl.dropboxusercontent.com/u/49269350/jsflags.png "jsflag gameplay")

## Manual controls
- Once the jsflags server is running and you view the game in Chrome, you can select manual mode to move your tanks with the mouse and fire with the keyboard.
- Select a tank by either clicking on the tank icon to the right of the screen or by clicking on the tanks directly.
- Deselect a tank by doing the same thing.
- To select all tanks double click on the grass.
- To move selected tanks click once anywhere on the map.
- To fire selected tanks press any key (i like to use the f key).

## Rules of the game
- Objective is to earn more points than everyone else.
- You earn one point for every second your tank holds the flag.
- You earn 100 points for returning the enemy flag to your base.
- The flag will reset to the enemy base after you return it to your base and recieve capture points.

## More info
- This game is design to to be run on a local area network.  After you run jsflags server another computer on the same network can connect their AI to your server using your local IP address.
- Technically this game could probably run over the internet.
- Various options are available in index.js in the options object.

