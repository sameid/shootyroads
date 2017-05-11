/**
 * enemy.js
 *
 * Handles Enemy computation and drawing, also holds an enemy library that defines behavious and drawing mechanics for each type of enemy
 *
 * Created by Sameid Usmani on 10-05-17.
 */

/**
 * Draws any number sided polygon, helper function
 *
 * @param x {Float}
 * @param y {Float}
 * @param radius {Float}
 * @param sides {Integer}
 * @param startAngle {Float}
 * @param anticlockwise {Boolean}
 */
var polygon = function(ctx, x, y, radius, sides, startAngle, anticlockwise) {
    if (sides < 3) return;
    var a = (Math.PI * 2)/sides;
    a = anticlockwise?-a:a;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(startAngle);
    ctx.moveTo(radius,0);
    for (var i = 1; i < sides; i++) {
        ctx.lineTo(radius*Math.cos(a*i),radius*Math.sin(a*i));
    }
    ctx.closePath();
    ctx.restore();
}

// Enemy library that stores all the different enemy types
var enemyLibrary = {
	"triangle": {
		speed: 3,
		health: 25,
		init: function(that){
			//can attach some global value to use in config
			that.angle = 0;
		},
		behaviour: function(that){
			//behaviour;
		},
		drawConfig: function(ctx, that){
			that.angle += (1.5) * (Math.PI / 180)
			// that.angle ++;
			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius + (that.radius * 0.2), 3, that.angle  );
			ctx.fillStyle = "#27ae60";
			ctx.fill();

			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius - (that.radius*0.5), 3, that.angle  );
			ctx.fillStyle = "#2ecc71";
			ctx.fill();
		}
	},
	"square": {
		speed: 4,
		health: 30,
		init: function(that){
			that.angle = 0;
		},
		behaviour: function(that){
			//behaviour;
		},
		drawConfig: function(ctx, that){
			that.angle -= (2) * (Math.PI / 180)
			// that.angle ++;
			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius + (that.radius * 0.2), 4, that.angle  );
			ctx.fillStyle = "#d35400";
			ctx.fill();

			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius - (that.radius*0.5), 4, that.angle  );
			ctx.fillStyle = "#e67e22";
			ctx.fill();
		}
	},
	"pentagon": {
		speed: 2,
		health: 20,
		init: function(that){
			that.angle = 0;
			that.frame = 0;
		},
		behaviour: function(enemyStack, bulletStack, character, that){
			//behaviour;
			that.frame++;
			if (that.frame % 240 == 0){
				that.frame = 0;

				var xDiff = character.x - that.x;
				var yDiff = character.y - that.y;
				var angle = Math.atan(xDiff/yDiff);

				if (that.x  < character.x  ) {
					if (that.y < character.y) angle = Math.PI/2 - angle;
					else if (that.y  > character.y) angle = (Math.PI/2 + angle)*-1;
				}
				else if (that.x  > character.x ) {
					if (that.y < character.y ) angle = Math.PI/2 + (angle*-1);
					else if (that.y > character.y) angle = (Math.PI/2 + angle)*-1;
				}

				var bulletSpeedX = Math.cos(angle) * (0.3);
				var bulletSpeedY = Math.sin(angle) * (0.3);

				// _.throttle(function(){
					// bulletStack.push(new Bullet(that.x, that.y, bulletSpeedX, bulletSpeedY, true));
				// }, 100, true);

			}
		},
		drawConfig: function(ctx, that){
			that.angle += (4) * (Math.PI / 180)
			// that.angle ++;
			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius + (that.radius * 0.2), 5, that.angle  );
			ctx.fillStyle = "#8e44ad";
			ctx.fill();

			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius - (that.radius*0.5), 5, that.angle  );
			ctx.fillStyle = "#9b59b6";
			ctx.fill();
		}
	},
	"square_drop":{
		speed:3.5,
		health: 40,
		init: function(that){
			that.angle = 0;
			that.frame = 0;

		},
		behaviour: function(enemyStack, bulletStack, character, that){
			that.frame++;

			if (that.frame % 300 == 0){
				that.frame = 0;
				// bulletStack.push(new Bullet(that.x, that.y, 0, 0, true));
			}
		},
		drawConfig: function(ctx, that){
			that.angle -= (10) * (Math.PI / 180)
			// that.angle ++;
			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius + (that.radius * 0.2), 4, that.angle  );
			ctx.fillStyle = "#16a085";
			ctx.fill();

			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius - (that.radius*0.5), 4, that.angle  );
			ctx.fillStyle = "#1abc9c";
			ctx.fill();
		}
	},
	"multiply":{
		speed:2,
		health: 20,
		init: function(that){
			that.angle = 0;

		},
		behaviour: function(enemyStack, bulletStack, character, that){
			if (that.health < 0){
				// enemyStack.push(new Enemy("triangle", true, that.x + that.radius + (that.radius * 0.2), that.y));
				// enemyStack.push(new Enemy("triangle", true, that.x - that.radius + (that.radius * 0.2), that.y));
				// enemyStack.push(new Enemy("triangle", true, that.x , that.y + that.radius + (that.radius * 0.2)));
			}

		},
		drawConfig: function(ctx, that){
			that.angle += (1) * (Math.PI / 180)
			// that.angle ++;
			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius + (that.radius * 0.2), 3, that.angle  );
			ctx.fillStyle = "#f39c12";
			ctx.fill();

			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius - (that.radius*0.5), 3, that.angle  );
			ctx.fillStyle = "#e67e22";
			ctx.fill();
		}
	},
	"rotate_shoot": {
		speed:4,
		health: 60,
		init: function(that){
			that.angle = 0;
			that.shootingAngle = 0;
			that.frame = 0;

		},
		behaviour: function(enemyStack, bulletStack, character, that){
			that.frame++;
			if (that.frame % 60 == 0){
					that.shootingAngle = Math.random() * (2 * Math.PI)

					that.frame = 0;

					var bulletSpeedX = Math.cos(that.shootingAngle) * (0.3);
					var bulletSpeedY = Math.sin(that.shootingAngle) * (0.3);

					// bulletStack.push(new Bullet(that.x, that.y, bulletSpeedX, bulletSpeedY, true));
			}

		},
		drawConfig: function(ctx, that){
			that.angle += (4) * (Math.PI / 180)
			// that.angle ++;
			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius + (that.radius * 0.2), 6, that.angle  );
			ctx.fillStyle = "#c0392b";
			ctx.fill();

			ctx.beginPath();
			polygon(ctx, that.x, that.y, that.radius - (that.radius*0.5), 6, that.angle  );
			ctx.fillStyle = "#e74c3c";
			ctx.fill();
		}
	}
}

/**
 * Enemy constructor
 *
 * @param type {String}
 * @param followCharacter {Character}
 * @param x {Float}
 * @param y {Float}
 * @param id {Integer}
 */
var Enemy = function(type, followCharacter, x, y, id){
    // Inherit the id from the constructor or generate a new one
    this.id = id || Math.floor(Math.random()*10000)

    // Preset all the enemy properties
	this.radius = SCALAR * 0.04;
	this.direction = 0;
	this.speedX = 0;
	this.speedY = 0;
	this.type = type;
	this.speed = enemyLibrary[type].speed;
	this.health = enemyLibrary[type].health + MECHANICS.ENEMY_HEALTH;
    this.character = followCharacter;

    // Initialize properites specific to the enemy type passed in
	enemyLibrary[type].init(this);

    // Calculate the game radius so there are spawn locations are out side the canvas
	var radius = 10 + Math.sqrt (Math.pow (game.width/2, 2) + Math.pow (game.height/2, 2));

    // Properties to hold spawn coordinates
    var tempX;
	var tempY;

    // Calculate an y spawn point inside the canvas radius
	tempX = Math.floor(Math.random() * radius);

    // Randmoly select to spawn the x value on left or right side of the canvas
	if (Math.floor(Math.random() *2) == 0){
		tempX *= -1;
	}

    // Calculate a y spawn point within the radius less the tempX
	tempY = Math.sqrt (Math.pow (radius, 2) - Math.pow (tempX, 2));

    // Randomly select to spawn the y value above or below the canvas
	if (Math.floor(Math.random() *2) == 0){
		tempY *= -1;
	}

    // Set the x or y via the constructor, otherwise set them too the tempX and tempY coordinates
	this.x = x || game.width /2 + tempX;
	this.y = y || game.height/2 + tempY;
}

/**
 * Perform the enemy behaviour based on the enemy type
 *
 * @param enemyStack {Array}
 * @param bulletStack {Array}
 * @param character {Character}
 */
Enemy.prototype.behaviour = function(enemyStack, bulletStack, character){
	enemyLibrary[this.type].behaviour(enemyStack, bulletStack, character, this);
}

/**
 * Draws the enemy to the canvas based on the type configuration
 *
 * @param ctx {CanvasContext}
 */
Enemy.prototype.draw = function(ctx){
	enemyLibrary[this.type].drawConfig(ctx, this);
}

/**
 * Will decreade the health of the enemy
 */
Enemy.prototype.decreaseHealth = function(){
	this.health --;
	this.radius += 0.3;
}

/**
 * Indicates whether the enemy is dead
 */
Enemy.prototype.isDead = function(){
    return this.health < 0;
}

/**
 * Sets the health to -1, thus killing the enemy
 */
Enemy.prototype.kill = function(){
	this.health = -1;
}

/**
 * Sets the health to -1, thus killing the enemy
 */
 // remove?
Enemy.prototype.rs = function(){
	return this.speed;
}

/**
 * Calculates the speed of the x and y displacements necessary to move the enemy
 */
Enemy.prototype.calculateSpeed = function(){
	this.speedX = this.rs()* (Math.cos(this.direction));
	this.speedY = this.rs()* (Math.sin(this.direction));
}

/**
 * Calculates the angle (direction) in which the enemy must move
 */
Enemy.prototype.calculateDirection = function(){
    // Get a snapshot of the character in which this enemy is supposed to follow
    var character = this.character;

    // Calculate the difference in displacement between the character and the enemy
	var down, top;
	top = (character.x + character.radius) - (this.x+ this.radius);
	down = (character.y + character.radius) - (this.y + this.radius);

    // Using the displacement, calculate the angle (direction) the character is from the enemy
    // Angle is in radians
	var angle = 0.0;
	angle = (Math.atan(top / down));

    // Based on the location the character and the enemy, normalize the angle
	if (character.x + character.radius < this.x + this.radius ) {
		if (character.y + character.radius < this.y + this.radius) {
			angle = Math.PI/2 - angle;

		}else if (character.y + character.radius > this.y + this.radius) {
			angle = (Math.PI/2 + angle)*-1;

		}
	} else if (character.x + character.radius > this.x + this.radius) {
		if (character.y + character.radius < this.y + this.radius) {
			angle = Math.PI/2 + (angle*-1);
		} else if (character.y + character.radius > this.y + this.radius) {
			angle = (Math.PI/2 + angle)*-1;
		}
	}

    // Set the current direction of the enemy
	this.direction = angle;
}

/**
 * Moves the enemy after calculating the direction and speed in which the enemy needs to move
 *
 * @param character {Character}
 */
Enemy.prototype.move = function(character){
	this.calculateDirection(character);
	this.calculateSpeed();
	this.x -= this.speedX;
	this.y -= this.speedY;
}

/**
 * remove?
 */
Enemy.prototype.setState = function(json){
    var keys = _.keys(json);
    keys.forEach(function(key){
        if (this[key]) {
            this[key] = json[key];
        }
    });
}
