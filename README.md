# FPC Coding Challenge: Shooty Roads

For the The Float Plane Club coding challenge, I wrote a arcade multiplayer top down shooter. You and one of your friends have to avoid the enemies and shoot them. If you collide with an enemy even once you are dead.

## Instructions

You are the blue circle, to move simply use `W, A, S, D`. Avoid the enemies at all costs. In order to destroy the enemies use your mouse to aim, and `LEFT CLICK` to fire!

## Try it out!

[Demo](http://104.131.183.120:8080/)

## How to run it locally

```
git clone https://github.com/sameid/shootyroads.git
npm install
node server.js
```

It's as easy as that.

## Code Basics

- All the core business logic for the game is done in `public/js/game.js`.
- There are supporting classes for any objects related to ui, network, and other game objects.

### Game Loop
The Game is achieved through a common pattern known as the Game Loop.
- Basically the game loop is achieved by creating a loop that runs non-stop to render the game.
- First we obtain the current state of the game and use that along side the input to compute the next state. This is known as the `UPDATE`.
- We then take that state and draw (paint) all the items to a 2D renderer, in this case the HTML5 `canvas` element. This is known as the `DRAW`.
- We then loop again and have the process repeat.
- The Game Loop is designed to 1000 ms divided by 60 frames. This allows the game to render 60 times a seconds, or rather 60fps.

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

## Devops

The app is currently running on a Digital Ocean Droplet. I also use `pm2` as the production process manager.
