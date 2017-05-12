/**
 * constants.js
 *
 * Holds all constats for the game
 *
 * Created by Sameid Usmani on 10-05-17.
 */

var STATES = {
    GAME: 0,
    GAME_OVER: 1,
    MAIN_MENU: 2,
    HOSTING_SETUP: 3,
    JOINING: 4,
    HOST_WAITING: 5,
    SINGLEPLAYER: 6,
    JOIN_WAITING: 7,
    HOST_READY: 8,
    MULTIPLAYER: 9
};

var BULLET_SPEED = 30;
var SCALAR = 0;

var DIRECTION = {
    87: "up",
    83: "down",
    68: "right",
    65: "left"
};

var COLORS = {
    BG: "#ecf0f1",
    CHARACTER: {
        HOST: {
            COLOR: "#2980b9",
            OFF_COLOR: "#22A7F0"
        },
        CLIENT: {
            COLOR: "#27ae60",
            OFF_COLOR: "#2ecc71"
        }
    }
}
