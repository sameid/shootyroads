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

Particle.prototype.update = function()
{
	var ms = 1000/60;

	// shrinking
	this.scale -= this.scaleSpeed * ms / 1000.0;

	if (this.scale <= 0)
	{
		this.scale = 0;
		this.dead = true;
	}

	// moving away from explosion center
	this.x += this.velocityX * ms/1000.0;
	this.y += this.velocityY * ms/1000.0;
};

Particle.prototype.draw = function(ctx)
{
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

Particle.prototype.isDead =function() {
	return this.dead;
}
