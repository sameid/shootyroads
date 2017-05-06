
var Wall = function (x, y, width, height){

  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

}

Wall.prototype.draw = function(ctx){
  ctx.beginPath;
  ctx.fillStyle = '#3498db';
  ctx.fillRect(this.x, this.y, this.width, this.height);
	// ctx.fill();
}

Wall.prototype.collision = function (c) {
	var rHalfWidth =  this.width / 2,
	    rHalfHeight = this.height / 2,
	    cx = Math.abs(c.x - this.x - rHalfWidth),
	    cy, distX, distY, distXSq, distYSq, maxDist;

	if (cx > rHalfWidth + c.radius) {
		return false;
	}

	cy = Math.abs(c.y - this.y - rHalfHeight);

	if (cy > rHalfHeight + c.radius) {
		return false;
	}

	if (cx <= rHalfWidth || cy <= rHalfHeight) {
		return true;
	}

	distX = cx - rHalfWidth;
	distY = cy - rHalfHeight;
	distXSq = distX * distX;
	distYSq = distY * distY;
	maxDist = c.radius * c.radius;

	return distXSq + distYSq <= maxDist;
}


var wallLibrary = [
  [
    new Wall(400, 100, 10, 300),
    new Wall(400, 500, 300, 10),
  ]
];
