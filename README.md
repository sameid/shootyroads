# FPC Coding Challenge: Shooty Roads

For the The Float Plane Club coding challenge, I wrote a arcade multiplayer top down shooter. You and one of your friends have to avoid the enemies and shoot them. If you collide with them even once you are dead.

## How to run it locally

```
git clone https://github.com/sameid/shootyroads.git
npm install
node server.js
```

It as easy as that.

## Stack

Front-end
- SockJS (Used for the real time WebSocket communication to the backend)
- TurretCSS (Used for the Game menu ui)
- Zepto.js (Used as replacement for jQuery, without all the weight)
- moment.js (Used to format dates)
- underscore.js (Used for some utility operations)
- knockout.js (Used for the business logic in the game ui)

Backend
- Node.js (As per the coding challenge guidelines)
- SockJS (Used for the real time WebSocket communication to the front end)
- Express.js (Used for hosting the public folder where the game resides)
