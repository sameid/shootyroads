/**
 * game.js
 *
 * Handles all game computation and all necessary related functionality.
 *
 * Created by Sameid Usmani on 08-05-17.
 */

/**
 * Global Variables
 */
var MECHANICS = {};
var difficultyLock = false;
var levelSystem = {};
var isMultiplayer = false;
var isHosting = false;
var otherCharacter = null;

/**
 * Resets the current level system to the starting points.
 */
var resetLevelSystem = function(){
    levelSystem = {
        previousLevel: 0,
        currentLevel: 1,
        score: 0,
        reserveStack: ["rotate_shoot", "multiply", "square_drop", "pentagon",  "square", "triangle"],
        spawnStack: [],
        spawnCount: 0
    }
}

/**
 * Resets all the game mechanics.
 */
var resetMechanics = function(){
    MECHANICS = {
        ENEMY_HEALTH: 0,//arbitrary value
        ENEMY_CREATION_RATE: 2000, //milliseconds (global)
        DEVELOPER_MODE: false, //(global)
        RATE_OF_DIFFICULTY_INCREASE: 1, //every x points (global, deprecated)
        BLOCK_DIFFICULTY_INCREASE: 50, //level at which there is no increase (global, deprecated)
        ENEMY_HEALTH_INCREASE_RATE: 5, //global, deprecated
        INCREASE_DIFFICULTY: true
    }
}

Zepto(function($){

    var direction = {
        up: 0,
        down: 0,
        right: 0,
        left: 0
    };

    var mouse = {
        down: false,
        x: 0,
        y: 0
    };

    var mouseDown = false;

    var character = {};
    var enemyDeath = document.getElementById("sound-death");
    var lossCounter = 0;

    var game = {};
    var ui = {};

    var $game = $("#game");
    var canvas = $game.get(0);
    var ctx = canvas.getContext("2d");
    var canvasRect = canvas.getBoundingClientRect();

    var network = new Network("http://" + window.location.hostname + ":3001/multiplayer", ui);

    // These are all the input handlers and update the global mouse object
    $("body").on("keydown", function(event){
        direction[DIRECTION[event.keyCode]] = 1;
    });

    $("body").on("keyup", function(event) {
        direction[DIRECTION[event.keyCode]] = 0;
    })

    $("body").on("mousedown", function(event) {
        mouse.down = true
    });

    $("body").on("mouseup", function(event) {
        mouse.down = false;
    });

    $("body").on("mousemove", function(event){
        mouse.x = Math.round((event.pageX - canvasRect.left) / (canvasRect.right - canvasRect.left) * canvas.width);
        mouse.y = Math.round((event.pageY - canvasRect.top) / (canvasRect.bottom - canvasRect.top) * canvas.height);
    });

    /**
     * Handles the over game initialization, can be run many times.
     */
    game.start = function() {
        console.log("Game Started!");

        // Reset the overall mechanics and level system for the game
        resetMechanics();
        resetLevelSystem();

        // Take the game out of a possible limbo state
        game.limbo = false;
        ctx.imageSmoothingEnabled = false;

        // Set the game to a proprietary width and height, could be something else for different platforms
        game.width = 1600;
        game.height = 900;

        // Create a overall multiplier for all other objects in the game to use as reference.
        SCALAR = game.height/1.5;

        // Set the HTML attributes for the canvas element
        $game.attr("width", game.width);
        $game.attr("height", game.height);
        $game.css('background-color', COLORS.BG);
        $game.css('left', '0');

        // Create a new local character (the player)
        character = new Character(isMultiplayer, isHosting);
        character.setColor(true);

        if (isMultiplayer) {
            // If it's multiplayer we need to intialize the otherCharacter (other player)
            otherCharacter = new Character(isMultiplayer, isHosting);

            otherCharacter.setColor(!isHosting);
            character.setColor(isHosting);

            // Based on whether or not this user is hosting, setup up the correct handler to listen to the WebSocket
            if (isHosting){
                network.setGameDataCallback(game.receiveHostData);
            } else {
                network.setGameDataCallback(game.receiveJoinData);
            }
        }

        // If this user handles the game computation, then they should be in charge of creating the enemies
        if (game.isComputer()) {
            game.enemyGeneratorId = setInterval(createEnemy, MECHANICS.ENEMY_CREATION_RATE);
        }

        // Start the game loop after 300 ms (Safety)
        setTimeout(function() {
            // Running the game loop at 1000 ms/ 60, ensures the game runs at 60FPS
            game.id = setInterval(game.loop, 1000 / 60);
            game.running = true;
        }, 300);
    }

    /**
     * Handles the network operations needed to be performed in the game loop
     */
    game.network = function() {
        if (isMultiplayer) {
            if (isHosting) {
                game.sendHostData();
            } else {
                game.sendJoinData();
            }
        }
    }

    /**
     * If the user is hosting the game, we need to send over all data that needs to be rendered by the client.
     * Will be handled by receiveJoinData by the client.
     */
    game.sendHostData = function() {
        var zip = {
            character: character,
            input: mouse,
            levelSystem: levelSystem
        };
        network.sendGameData(zip);
    }

    /**
     * If the user is the clieant, then we need to send over all data that needs to be computed and rendered by the host.
     * Will be handled by the receiveHostData by the host.
     */
    game.sendJoinData = function() {
        var zip = {
            character: character,
            input: mouse
        }
        network.sendGameData(zip);
    }

    /**
     * WebSocket message handler for the host.
     *
     * @param zip {Object} - network object
     */
    game.receiveHostData = function(zip) {
        if (zip.character) {
            otherCharacter.setState(zip.character);
        }

        if (zip.input) {
            createBullet(zip.input, otherCharacter);
        }
    }

    /**
     * WebSocket message handler for the client.
     *
     * @param zip {Object} - network object
     */
    game.receiveJoinData = function(zip) {

        // If the host sent the level system, then update the local level system
        if (zip.levelSystem) {
            levelSystem = zip.levelSystem;
        }

        // If the host sent it's character data then set the current state for the other character
        if (zip.character) {
            otherCharacter.setState(zip.character);
        }

        // If the host sent it's input data, then create a new bullet if necessary
        if (zip.input) {
            createBullet(zip.input, otherCharacter);
        }

        // newEnemy will exist on zip object if a new enemy was created.
        if (zip.newEnemy) {
            var enemy = zip.newEnemy;
            var followHost = zip.followHost;

            // Create an identical enemy to the one the host created.
            var newEnemy = new Enemy(enemy.type, followHost ? otherCharacter : character, enemy.x, enemy.y, enemy.id);

            //TODO: remove?
            newEnemy.setState(enemy);

            // Push the newly created enemy to the local enemyStack
            enemyStack.push(newEnemy);
        }

        // deadEnemy will exist on the zip object if an enemy died.
        if (zip.deadEnemy) {

            // Find the matching enemy in the local enemyStack and make it's health below 0
            enemyStack.forEach(function(enemy, index, array) {
                if (enemy.id == zip.deadEnemy.id){
                    enemy.health = -1;
                }
            });
        }
    }

    $game.on("touchstart", function(e) {
        character.x = game.width/2;
        character.y = game.height/2;
    });

    // All the object stacks used for computing and drawing the game objects
    var enemyStack = [];
    var bulletStack = [];
    var particleStack = [];

    /**
     * Generate a random float in between in the min and max parameters passed.
     *
     * @param min {Integer}
     * @param max {Integer}
     */
    var randomFloat = function(min, max) {
        return min + Math.random()*(max-min);
    }

    var toggleCharacter = false;

    /**
     * Will check the level based on the system parameters, and increase the level if necessary.
     */
    var checkLevel = function() {
        // Calculate the currentLevel based on the total number of enemies killed (score)
        levelSystem.currentLevel = Math.floor(levelSystem.score/3) + 1;

        // Check if the currentLevel is greater than the previous level and reset the spawn count.
        if (levelSystem.currentLevel > levelSystem.previousLevel){
            levelSystem.spawnCount = 0;
            if (levelSystem.reserveStack.length > 0) {
                // Now add a new enemy type to the type of enemies that can be created
                levelSystem.spawnStack.push(levelSystem.reserveStack.pop());
            }
        }
        levelSystem.previousLevel = levelSystem.currentLevel;
    }

    /**
     * Creates a new enemy based on if the level system allows
     */
    var createEnemy = function() {

        checkLevel();

        // If the number of enemies that have been spawned in the current level is below 5, create a new enemy.
        if (levelSystem.spawnCount < 5){
            levelSystem.spawnCount++;

            // Randomly select an enemy type from the list of types available in this level.
            var type = levelSystem.spawnStack[Math.floor(Math.random() * levelSystem.spawnStack.length)];

            // Toggle which character this new enemy should follow, will always default to the regular character
            var followCharacter = toggleCharacter && otherCharacter ? otherCharacter : character;

            // Create the new enemy
            var enemy = new Enemy(type, followCharacter);

            // Let the client know we have created a new enemy
            if (isMultiplayer) {
                network.sendGameData({
                    newEnemy: enemy,
                    followHost: !toggleCharacter
                });
            }

            // Push the new enemy to the character stack.
            enemyStack.push(enemy);
            toggleCharacter = !toggleCharacter;
        }
    }

    /**
     * Creates a bullet based on the input parameters passed
     */
    var createBullet = function (input, character) {
        // If the user is left clicking, then create a new bullet object and append to the bulletStack
        if (input.down){
            bulletStack.push(new Bullet(character.x, character.y, input.x, input.y));
        }
    }

    //refactor to Explosion object
    var createExplosion = function(x, y, color){
        var minSize = SCALAR * 0.04;
        var maxSize = SCALAR * 0.06;
        var count = 10;
        var minSpeed = 60.0 * 2; //scalar
        var maxSpeed = 200.0 * 2; //scalar
        var minScaleSpeed = 1.0; //scalar
        var maxScaleSpeed = 4.0; //scalar

        for (var angle=0; angle<360; angle += Math.round(360/count))
        {
            var particle = new Particle();

            //refactor below to the particle
            particle.x = x;
            particle.y = y;

            particle.radius = randomFloat(minSize, maxSize);
            particle.color = color;
            particle.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);

            var speed = randomFloat(minSpeed, maxSpeed);

            particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
            particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);

            particleStack.push(particle);
        }
    }

    /**
     * Checks if two objects have collided
     *
     * @param o1 {Character|Bullet|Enemy}
     * @param o2 {Character|Bullet|Enemy}
     */
    var collision = function(o1, o2) {
        if (_.isNull(o1) || _.isNull(o2)) return false;
        var dx = o2.x - o1.x;
        var dy = o2.y - o1.y;
        var radii = o2.radius + o1.radius;
        if (( dx * dx )  + ( dy * dy ) < radii * radii ) {
            return true;
        }
        return false;
    }

    /**
     * Clears all game object stacks
     */
    var clearStacks = function() {
        enemyStack = [];
        bulletStack = [];
        partcleStack = [];
    }

    /**
     *  Checks whether to increase the difficulty based on the current system
     */
    var increaseDifficulty = function(score) {
        if (MECHANICS.INCREASE_DIFFICULTY &&
            score <= MECHANICS.BLOCK_DIFFICULTY_INCREASE &&
            score != 0 &&
            score % MECHANICS.RATE_OF_DIFFICULTY_INCREASE == 0 &&
            !difficultyLock) {

            difficultyLock = true;
            MECHANICS.ENEMY_HEALTH += MECHANICS.ENEMY_HEALTH_INCREASE_RATE;
        }
    }

    /**
     * Update all the game logic based on the current state of the elements involved
     */
    game.update = function(){
        // Increase the enemy health if necessary
        increaseDifficulty(levelSystem.score);

        // Create bullets if necessary
        createBullet(mouse, character);

        // Iterate through the enemy stack and perform necessary state changes
        enemyStack.forEach(function(enemy, index, array){
            // Perform the necessary enemy behaviour
            enemy.behaviour(enemyStack, bulletStack, character);

            // Move the location of the enemy
            enemy.move();

            // If the user is performing the computation for both the host and client, then perform collision detection
            if (game.isComputer()){

                // Check if either characters have collided with an enemy
                if (collision(character, enemy) || collision(otherCharacter, enemy)){
                    if (!MECHANICS.DEVELOPER_MODE){

                        // If they have collided end the game and notify the other
                        if (isMultiplayer) {
                            network.sendGameOver();
                        }
                        game.stop();
                        lossCounter++;
                    }
                }
            }

            // Check if the enemy is dead
            if (enemy.isDead()) {

                // If the user is performing game computation let the client know that an enemy died
                if (game.isComputer()){

                    if (isMultiplayer) {
                        network.sendGameData({
                            deadEnemy: enemy
                        });
                    }

                    // Increase score
                    levelSystem.score++;
                    difficultyLock = false;
                }

                // Create an explosion object
                createExplosion(enemy.x, enemy.y, "#525252");
                createExplosion(enemy.x, enemy.y, "#FFA318");

                // Remove the enemy from the current enemy stack
                delete array[index];


            }
        });

        // Iterate through each bullet in the bullet stack
        bulletStack.forEach(function(bullet, index, array) {
            // Move the location of the bullet
            bullet.move();

            //figure out
            // if(bullet.fromEnemy && (collision (bullet, character) || collision(bullet, otherCharacter))){
            //     if (!MECHANICS.DEVELOPER_MODE){
            //         network.sendGameOver();
            //         game.stop();
            //         lossCounter++;
            //     }
            // }

            // For each bullet iterate through each enemy and perform a collision detect
            enemyStack.forEach(function(enemy, ei, ea) {
                // If the bullet and enemy collide decrease the enemy health
                if (collision(bullet, enemy) && !bullet.fromEnemy) {
                    enemy.decreaseHealth();

                    // On the next process tick, delete the bullet from the bullet stack
                    setTimeout(function(){
                        delete array[index];
                    }, 10);
                }
            });

            // Check if the bullet is outside the canvas and remove it from the stack
            // Simply a memory leak fix
            if (bullet.isOutside()) {
                delete array[index];
            }
        });

        // Iterate through each particle and update it's state
        particleStack.forEach(function(particle, index, array) {
            particle.update();

            // Check if the particle is at it's smallest
            if (particle.isDead()) {

                // Remove the particle from the particle stack
                // Another memory leak fix
                delete array[index];
            }
        });

        // Update the character location
        character.move(direction);
    }

    /**
     * Draw all the objects to canvas
     */
    game.draw = function(){
        // Clear the canvas on each iteration of the game loop
        ctx.clearRect(0, 0, game.width, game.height);

        // Draw the score in background
        game.drawScore(ctx);

        // Draw all the bullets on the bullet stack
        bulletStack.forEach(function(bullet){
            bullet.draw(ctx);
        });

        // Draw all the enemies on the enemy stack
        enemyStack.forEach(function(enemy){
            // Sanity check if the enemy actually exists
            if (enemy){
                enemy.draw(ctx);
            }
        });

        // Draw all the particles on the particle stack
        particleStack.forEach(function(particle, index, array){
            particle.draw(ctx);
        });

        // Draw the character
        character.draw(ctx);

        // Draw the otherCharacter if it's multiplayer and the otherCharacter exists
        if (isMultiplayer && otherCharacter){
            otherCharacter.draw(ctx);
        }
    }

    /**
     * The core game loop that runs at 60 fps
     */
    game.loop = function(){
        game.network();
        game.update();
        game.draw();
    }

    /**
     * When a character dies, we want the player to be in limbo for 3 seconds, this function renders all the on screen elements
     */
    game.endGame = function(){
        // Update all the particles
        particleStack.forEach(function(particle, index, array){
            particle.update();
            if (particle.isDead()){
                delete array[index];
            }
        });

        // Clear the canvas
        ctx.clearRect(0, 0, game.width, game.height);
        game.drawScore(ctx);

        // Draw all the remaining enemies on the enemy stack
        enemyStack.forEach(function(enemy){
            enemy.draw(ctx);
        });

        // Draw all the remaining particles on the particle stack
        particleStack.forEach(function(particle, index, array){
            particle.draw(ctx);
        });
    }

    /**
     * Performs all end game related components
     */
    game.stop = function(){
        console.log("Game stopped.");

        if (!game.running) {
            return;
        }

        game.running = false;

        // Clears the game loop interval, and the enemyGenerator interval
        clearInterval(game.id);
        clearInterval(game.enemyGeneratorId);

        // Run the end game loop at 60 fps
        var endGameId = setInterval(game.endGame, 1000/60);

        // Create explosions where the character died to make it look like the character exploded
        createExplosion(character.x, character.y, "#525252");
        createExplosion(character.x, character.y, "#FFA318");

        // Update the high score in localStorage
        var highScore = window.localStorage.getItem("highScore");
        if (!highScore) highScore = 0;
        if (levelSystem.score > highScore){
            highScore = levelSystem.score;
            window.localStorage.setItem("highScore", highScore);
        }

        // Let the end game "limbo" drawing run for 3 seconds
        setTimeout(function(){

            // After 3 seconds end the end game "limbo"
            clearInterval(endGameId);

            // Reset the score
            levelSystem.score=0;

            // Clear all object stacks
            clearStacks();

            // Update the current view model state
            if (game.isComputer()) {
                vm.currentState(STATES.GAME_OVER);
            } else {
                vm.currentState(STATES.JOIN_WAITING);
            }

        }, 3000);
    }

    /**
     * Indicates whether this current user should do core game computation (eg. creating enemies and checking collisions)
     */
    game.isComputer = function() {
        return !isMultiplayer || (isMultiplayer && isHosting);
    }

    /**
     * Will draw the score to the canvas
     *
     * @param ctx {CanvasContext}
     */
    game.drawScore = function(ctx) {
        ctx.font = "700px score";
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = "center";
        ctx.fillText(levelSystem.score, game.width/2, game.height - 300);
    }

    // Create a MasterViewModel and pass the necessary parameters
    var vm = new MasterViewModel(game, network, ui);

    // Use knockout to apply the model to the view
    ko.applyBindings(vm);
});
