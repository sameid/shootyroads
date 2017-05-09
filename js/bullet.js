var Bullet = function(fromX, fromY, toX, toY, fromEnemy){
	var xDiff = toX - fromX;
	var yDiff = toY - fromY;

	var angle = Math.atan(xDiff/yDiff);
	if (toX  < fromX) {
		if (toY < fromY) angle = Math.PI/2 - angle;
		else if (toY  > fromY) angle = (Math.PI/2 + angle)*-1;
	}
	else if (toX  > fromX ) {
		if (toY < fromY ) angle = Math.PI/2 + (angle*-1);
		else if (toY > fromY) angle = (Math.PI/2 + angle)*-1;
	}
	var bulletSpeedX = -1 * Math.cos(angle);
	var bulletSpeedY = -1 * Math.sin(angle);

	this.x = fromX;
	this.y = fromY;
	this.radius = SCALAR * 0.02;
	this.speedX = BULLET_SPEED * bulletSpeedX;
	this.speedY = BULLET_SPEED * bulletSpeedY;
	this.fromEnemy = fromEnemy;
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
	else if (this.y < 0 || this.y > game.height) return true;
	return false;
}
