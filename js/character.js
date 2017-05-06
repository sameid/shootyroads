//4% factoring

var Character = function(){
	this.radius = SCALAR * 0.04;
	this.x = game.width/2;
	this.y = game.height/2;
	this.SPEED = 2.0;
	this.angle = 0;
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

Character.prototype.move = function(accel, offset, inverse){

	// if (pad.active){
	// 	pad.xDiff = pad.moving.x - pad.start.x;
	// 	pad.yDiff = pad.moving.y - pad.start.y;

	// 	if (isNaN(pad.xDiff))pad.xDiff = 0;
	// 	if (isNaN(pad.yDiff))pad.yDiff = 0;

	if (this.x-this.radius >= game.width) this.x = 0-this.radius;
	else if (this.x+this.radius <= 0) this.x = game.width+this.radius;
	if (this.y-this.radius >= game.height) this.y = 0-this.radius;
	else if (this.y+this.radius <= 0) this.y = game.height+this.radius;

	// 	this.x += pad.xDiff * this.SPEED;
	// 	this.y += pad.yDiff * this.SPEED;
	// 	// console.log(this.x, this.y);
	// 	// console.log(pad.xDiff, pad.yDiff);

	// }

	//android

	if (inverse){
		this.SPEED = 20;
		if (OS == "Android") {
			this.x += (accel.x * this.SPEED) - (offset.x * this.SPEED);
	    this.y += -1*(accel.y *this.SPEED) + (offset.y * this.SPEED);
		}
		else if (OS == "iOS") {
			this.x += -1*(accel.x * this.SPEED) + (offset.x * this.SPEED);
			this.y += (accel.y * this.SPEED) - (offset.y * this.SPEED);
		}
	}
	else {

		this.SPEED = 5.0

		if (OS == "Android") {
			this.x += -1*(accel.x * this.SPEED) + (offset.x * this.SPEED);
			this.y += (accel.y * this.SPEED) - (offset.y * this.SPEED);
		}
		else if (OS == "iOS") {
			this.x += (accel.x * this.SPEED) - (offset.x * this.SPEED);
			this.y += -1*(accel.y *this.SPEED) + (offset.y * this.SPEED);
		}
	}

}
