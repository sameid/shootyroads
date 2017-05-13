/**
* bullet.js
*
* Handles all Bullet computation and drawing
*
* Created by Sameid Usmani on 08-05-17.
*/

/**
* Bullet constructor
*
* @param fromX {Float}
* @param fromY {Float}
* @param toX {Float}
* @param toY {Float}
* @param fromEnemy {Boolean}
*/
var Bullet = function(fromX, fromY, toX, toY, fromEnemy){

	var fromRadius = SCALAR * 0.04;
	var toRadius = SCALAR * 0.02;

	var toMapX = toX + toRadius;
	var toMapY = toY + toRadius;
	var fromMapX = fromX + fromRadius;
	var fromMapY = fromY + fromRadius;

	// Calculate the difference between where the bullet should started, and the direction in which we want it to go
	var top = toMapX - fromMapX;
	var down = toMapY - fromMapY;

	// Calculate the angle in which we want the bullet to go in
	var angle = 0.0;
	angle = Math.atan(top / down);

	// Normalize the angle based on the from and to positions of where we wanted the bullet to start
	if (toMapX < fromMapX) {
		if (toMapY < fromMapY) {
			angle = Math.PI/2 - angle;
		} else if (toMapY  > fromMapY) {
			angle = (Math.PI/2 + angle) *- 1;
		}
	}
	else if (toMapX  > fromMapX) {
		if (toMapY < fromMapY) {
			angle = Math.PI/2 + (angle *- 1);
		} else if (toMapY > fromMapY) {
			angle = (Math.PI/2 + angle) *- 1;
		}
	}

	// Once normalized, calculate the cosine ratio for the x displacement and sine ratio for the y displacement
	var bulletSpeedX = -1 * Math.cos(angle);
	var bulletSpeedY = -1 * Math.sin(angle);

	this.x = fromX;
	this.y = fromY;
	this.radius = SCALAR * 0.02;
	this.speedX = BULLET_SPEED * bulletSpeedX;
	this.speedY = BULLET_SPEED * bulletSpeedY;
	this.fromEnemy = fromEnemy;
}

/**
* Move the bullet position based on the current speed
*/
Bullet.prototype.move = function(){
	this.x += this.speedX;
	this.y += this.speedY;
}

/**
* Draw the bullet to the canvas
*
* @param ctx {CanvasContext}
*/
Bullet.prototype.draw = function(ctx){
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#c0392b';
	ctx.fill();
}

/**
* Indicates whether the bullet is outside the current canvas
*/
Bullet.prototype.isOutside = function(){
	if (this.x < 0 || this.x > game.width) return true;
	else if (this.y < 0 || this.y > game.height) return true;
	return false;
}
