var Character = function(){
	this.radius = SCALAR * 0.04;
	this.x = game.width/2;
	this.y = game.height/2;
	this.SPEED = 10;
	this.angle = 0;
}

Character.prototype.setState = function(json) {
	this.x = json.x;
	this.y = json.y;
	this.animatex = json.animatex;
	this.animatey = json.animatey;
	this.SPEED = json.SPEED;
	this.angle = json.angle;
	this.radius = json.radius;
}

Character.prototype.draw = function(ctx){
	this.animatex = this.x + Math.cos(this.angle) * this.radius*1.4;
	this.animatey = this.y + Math.sin(this.angle) * this.radius*1.4;
	this.angle += 0.1;

	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = "#2980b9";
	ctx.fill();

	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius - (this.radius * 0.5), 0, 2 * Math.PI, false);
	ctx.fillStyle = "#22A7F0";
	ctx.fill();

	ctx.beginPath();
	ctx.arc(this.animatex, this.animatey, this.radius - (this.radius * 0.8), 0, 2 * Math.PI, false);
	ctx.fillStyle = "#2980b9";
	ctx.fill();
}

Character.prototype.move = function(direction){

	this.y -= direction.up * this.SPEED;
	this.y += direction.down * this.SPEED;
	this.x += direction.right * this.SPEED;
	this.x -= direction.left * this.SPEED;

	if (this.x-this.radius >= game.width) this.x = 0-this.radius;
	else if (this.x+this.radius <= 0) this.x = game.width+this.radius;
	if (this.y-this.radius >= game.height) this.y = 0-this.radius;
	else if (this.y+this.radius <= 0) this.y = game.height+this.radius;

}
