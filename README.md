# FPC Coding Challenge: Shooty Roads

For the The Float Plane Club coding challenge, I wrote an arcade multiplayer top down shooter. You and one of your friends have to avoid the enemies and shoot them. If you collide with an enemy even once you are dead.

## Instructions

You are the blue circle, to move simply use `W, A, S, D`. Avoid the enemies at all costs. In order to destroy the enemies use your mouse to aim, and `LEFT CLICK` to fire!

## Try it out!

- [Demo](http://104.131.183.120:8080/)
- [Video Demo](https://youtu.be/mA6uXrE4ZlQ)

## Run it locally

```
git clone https://github.com/sameid/shootyroads.git
cd shootyroads
npm install
node server.js
```

Now go to [http://localhost:3000/](http://localhost:3000/) in your favourite browser.
> Tested in Chrome only.

## Run it in production

> The app is currently running on a Digital Ocean Droplet. I also use `pm2` as the production process manager.

To run it in your own production environment
```
git clone http://github.com/sameid/shootyroads.git
cd shootyroads
npm install -g pm2
npm install
pm2 start shootyroads.config.js --env production
```

## Stack

Front-end
- SockJS (Used for the real time WebSocket communication to the backend)
- TurretCSS (Used for the Game menu ui)
- Zepto.js (Similar to jQuery, without all the weight)
- moment.js (Used to format dates)
- underscore.js (Used for some utility operations)
- knockout.js (Used for the business logic in the game ui)

Backend
- Node.js (As per the coding challenge guidelines)
- SockJS (Used for the real time WebSocket communication to the front end)
- Express.js (Used for hosting the public folder where the game resides)

## Credits

> Fahd Usmani (Testing)
> Zohaib Bhatti (Testing)
> DL Sounds (Background Music)
> All the Open Source software authors!

---

## Common Patterns

- All the core business logic for the game is computed in `public/js/game.js`.
- There are supporting classes for any objects related to ui, network, and other game objects.

### Game Loop
> The rendering of the game is achieved through a common pattern known as the Game Loop.
- Basically the game loop is achieved by creating a loop that runs non-stop to render the game.
- First we obtain the current state of the game and use that along side the input to compute the next state. This is known as the `UPDATE`.
- We then take that state and draw (paint) all the items to a 2D renderer, in this case the HTML5 `canvas` element. This is known as the `DRAW`.
- We then loop again and have the process repeat.
- The Game Loop is designed to 1000 ms divided by 60 frames. This allows the game to render 60 times a second, or rather 60fps.

### Multiplayer
> We use SockJS and their implementation of WebSockets to help us achieve real time multiplayer functionality
- Alongside the `UPDATE` and `DRAW` operations, we perform a `NETWORK` operation that notifies the other player of the current state of the game.
- That network call has handlers on the other side, to update the state of the game and to keep the host and client in sync.
- After the game state has been updated, the game is rendered as normal for both the host and client.
