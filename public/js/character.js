/**
 * character.js
 *
 * Handles all character computation and drawing
 *
 * Created by Sameid Usmani on 08-05-17.
 */

/**
 * Character constructor
 */
var Character = function(isMultiplayer, isHost) {
	this.radius = SCALAR * 0.04;
	this.x = game.width/2;
	this.y = game.height/2;
	this.isMultiplayer = isMultiplayer;
	this.isHost = isHost;

	if (isMultiplayer) {
		if (isHost) {
			this.x = (game.width/2) - 100;
		} else {
			this.x = (game.width/2) + 100;
		}
	}

	this.SPEED = 10;
	this.angle = 0;
}

/**
 * Sets the current state of the Character from a raw json object
 *
 * @param json {Object}
 */
Character.prototype.setState = function(json) {
	this.x = json.x;
	this.y = json.y;
	this.animatex = json.animatex;
	this.animatey = json.animatey;
	this.SPEED = json.SPEED;
	this.angle = json.angle;
	this.radius = json.radius;
}

/**
 * Sets the current state of the Character from a raw json object
 *
 * @param ctx {CanvasContext}
 */
Character.prototype.draw = function(ctx) {
	//TODO: The following should be refactored to an update function
	// The following is the calculation for the x y coordinates for the ball rotating around the character
	this.animatex = this.x + Math.cos(this.angle) * this.radius*1.4;
	this.animatey = this.y + Math.sin(this.angle) * this.radius*1.4;
	this.angle += 0.1;

	// Drawing the character to the canvas
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = this.color;
	ctx.fill();

	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius - (this.radius * 0.5), 0, 2 * Math.PI, false);
	ctx.fillStyle = this.offColor;
	ctx.fill();

	// Drawing the ball rotating around the character
	ctx.beginPath();
	ctx.arc(this.animatex, this.animatey, this.radius - (this.radius * 0.8), 0, 2 * Math.PI, false);
	ctx.fillStyle = this.color;
	ctx.fill();
}

/**
 * Sets the current state of the Character from a raw json object
 *
 * @param direction {Object}
 */
Character.prototype.move = function(direction) {
	this.y -= direction.up * this.SPEED;
	this.y += direction.down * this.SPEED;
	this.x += direction.right * this.SPEED;
	this.x -= direction.left * this.SPEED;

	if (this.x-this.radius >= game.width) this.x = 0-this.radius;
	else if (this.x+this.radius <= 0) this.x = game.width+this.radius;
	if (this.y-this.radius >= game.height) this.y = 0-this.radius;
	else if (this.y+this.radius <= 0) this.y = game.height+this.radius;
}

Character.prototype.setColor = function(primary) {
	this.color = primary ? COLORS.CHARACTER.HOST.COLOR : COLORS.CHARACTER.CLIENT.COLOR;
	this.offColor = primary ? COLORS.CHARACTER.HOST.OFF_COLOR : COLORS.CHARACTER.CLIENT.OFF_COLOR;
}
