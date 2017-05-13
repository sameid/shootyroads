/**
* particle.js
*
* Handles all particle computation and drawing
*
* Created by Sameid Usmani on 08-05-17.
*/

/**
* Particle constructor
*/
var Particle = function(){
	this.scale = 1.0;
	this.x = 0;
	this.y = 0;
	this.radius = 20;
	this.color = "#000";
	this.velocityX = 0;
	this.velocityY = 0;
	this.scaleSpeed = 0.5;
	this.dead = false;
}

/**
* Performs particle updates
*/
Particle.prototype.update = function() {
	// Calculate one second over 60 frames
	var ms = 1000/60;

	// Use the ms calculation and multiply by the scale speed and divide by 1 second
	// After use that to descrease the size of the particle
	this.scale -= this.scaleSpeed * ms / 1000.0;

	// If the scale is less than zero then kill the particle
	if (this.scale <= 0) {
		this.scale = 0;
		this.dead = true;
	}

	// Move the position of the particle via the calculated velocity
	this.x += this.velocityX * ms/1000.0;
	this.y += this.velocityY * ms/1000.0;
};

/**
* Performs particle drawing
*
* @param ctx {CanvasContext}
*/
Particle.prototype.draw = function(ctx) {
	// translating the 2D context to the particle coordinates
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.scale(this.scale, this.scale);

	// drawing a filled circle in the particle's local space
	ctx.beginPath();
	ctx.arc(0, 0, this.radius, 0, Math.PI*2, true);
	ctx.closePath();

	ctx.fillStyle = this.color;
	ctx.fill();

	ctx.restore();
};

/**
* Indicates if the particle is dead, and should be removed
*/
Particle.prototype.isDead = function() {
	return this.dead;
}
