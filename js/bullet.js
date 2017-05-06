var BULLET_SPEED = 30;//needs to be scalar

//2% factoring

var Bullet = function(x, y, speedX, speedY, fromEnemy){
	this.x = x;
	this.y = y;
	this.radius = SCALAR * 0.02;
	this.speedX = BULLET_SPEED * speedX;
	this.speedY = BULLET_SPEED * speedY;
	this.fromEnemy = fromEnemy;


	this.animatex = 0;
	this.animatey = 0;
	this.angle = 0;

	console.log("created bullet")
}


Bullet.prototype.move = function(){
	this.x += this.speedX;
	this.y += this.speedY;


}

Bullet.prototype.draw = function(ctx){
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#c0392b';
	ctx.fill();

}

Bullet.prototype.isOutside = function(){
	if (this.x < 0 || this.x > game.width) return true;
	else if (this.y < 0 || this.x > game.height) return true;
	return false;

}
