var SCALAR = 0;
var MECHANICS = {};
var DIRECTION = {
    87: "up",
    83: "down",
    68: "right",
    65: "left"
};
var COLORS = {
    BG: "#ecf0f1"
}

var difficultyLock = false;
var levelSystem = {};

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

var checkLevel = function(){
    levelSystem.currentLevel = Math.floor(levelSystem.score/3) + 1;
    console.log(levelSystem.currentLevel);
    if (levelSystem.currentLevel > levelSystem.previousLevel){
        levelSystem.spawnCount = 0;
        if (levelSystem.reserveStack.length > 0)
            levelSystem.spawnStack.push(levelSystem.reserveStack.pop());
    }
    levelSystem.previousLevel = levelSystem.currentLevel;
}

var resetMechanics = function(){
    MECHANICS = {
        ENEMY_HEALTH: 25,//arbitrary value
        SHOOTING_DISTANCE_MULTIPLIER: 0.45,//percentage of screen height (global)
        ENEMY_CREATION_RATE: 2000, //milliseconds (global)
        DEVELOPER_MODE: false, //(global)
        ENEMY_MAX_SPEED: 3, //pixel per frame (60fps)
        ENEMY_MIN_SPEED: 1,//pixel per frame (60fps)
        RATE_OF_DIFFICULTY_INCREASE: 1, //every x points (global, deprecated)
        BLOCK_DIFFICULTY_INCREASE: 50, //level at which there is no increase (global, deprecated)
        ENEMY_HEALTH_INCREASE_RATE: 5, //global, deprecated
        ENEMY_SPEED_INCREASE_RATE: 0.25,// rate at which the enemy speed increases, (global, deprecated)
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

    var mouseDown = false;
    var mouse = {
        down: false,
        x: 0,
        y: 0
    }

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
        mouse.x = event.pageX;
        mouse.y = event.pageY;
    });

    var enemyDeath = document.getElementById("sound-death");

    getCurrentBuild(function(data){
        var date = moment(data.date).format('MMMM Do YYYY, h:mm a');
        $("#build").append("Version Rev"+ data.version + " (alpha) <br> Last updated " + date + "<br> Build: " + data.message );
    });

    var character = {};
    var otherCharacter = null;
    // var score = 0;
    var lossCounter = 0;

    var game = {};
    var ui = {};
    var $game = $("#game");
    var ctx = $game.get(0).getContext("2d");

    var network = new Network("http://192.168.0.21:3000/echo", ui);
    var multiplayer = false;
    var hosting = false;

    game.start = function(){
        console.log("Game Started!");

        resetMechanics();
        resetLevelSystem();

        game.limbo = false;
        ctx.imageSmoothingEnabled = false;

        game.width = 1600;
        game.height = 900;

        SCALAR = game.height/1.5;

        $game.attr("width", game.width);
        $game.attr("height", game.height);
        $game.css('background-color', COLORS.BG);
        $game.css('left', '0');

        character = new Character();

        if (multiplayer) {
            if (hosting){
                network.setGameDataCallback(game.receiveHostData);
            } else {
                network.setGameDataCallback(game.receiveJoinData);
            }
        }

        if (game.isComputer()) {
            game.enemyGeneratorId = setInterval(createEnemy, MECHANICS.ENEMY_CREATION_RATE);
        }

        setTimeout(function(){
            game.id = setInterval(game.loop, 1000 / 60);
        }, 300);
    }

    game.network = function() {
        if (multiplayer) {
            if (hosting) {
                game.sendHostData();
            } else {
                game.sendJoinData();
            }
        }
    }

    game.sendHostData = function() {
        var zip = {
            character: character,
            // enemyStack: enemyStack,
            input: mouse,
            levelSystem: levelSystem
        };
        network.sendGameData(zip);
    }

    game.sendJoinData = function() {
        var zip = {
            character: character,
            input: mouse
        }
        network.sendGameData(zip);
    }

    game.receiveHostData = function(zip) {
        if (!otherCharacter) {
            otherCharacter = new Character();
        }
        otherCharacter.setState(zip.character);
        createBullet(zip.input, otherCharacter);
    }

    game.receiveJoinData = function(zip) {
        if (zip.levelSystem) {
            levelSystem = zip.levelSystem;
        }

        if (!otherCharacter) {
            otherCharacter = new Character();
        }

        if (zip.character) {
            otherCharacter.setState(zip.character);
        }

        if (zip.input) {
            createBullet(zip.input, otherCharacter);
        }

        if (zip.newEnemy) {
            var enemy = zip.newEnemy;
            var newEnemy = new Enemy(enemy.type, enemy.character, enemy.x, enemy.y, enemy.id);
            // newEnemy.setState(enemy);
            enemyStack.push(newEnemy);
        }

        if (zip.deadEnemy) {
            enemyStack.forEach(function(enemy, index, array) {
                if (enemy.id = zip.deadEnemy.id){
                    enemy.health = -1;
                }
            });
        }
    }

    $game.on("touchstart", function(e){
        character.x = game.width/2;
        character.y = game.height/2;
    });

    var enemyStack = [];
    var bulletStack = [];
    var particleStack = [];

    var randomFloat = function(min, max){
        return min + Math.random()*(max-min);
    }

    var toggleCharacter = false;

    var createEnemy = function(){
        checkLevel();

        if (levelSystem.spawnCount < 5){
            levelSystem.spawnCount++;
            var type = levelSystem.spawnStack[Math.floor(Math.random() * levelSystem.spawnStack.length)];
            var enemy = new Enemy(type, toggleCharacter && otherCharacter ? otherCharacter : character);
            enemyStack.push(enemy);
            toggleCharacter = !toggleCharacter;

            network.sendGameData({
                newEnemy: enemy
            });
        }
    }

    var createBullet = function (input, character) {
        if (input.down){
            bulletStack.push(new Bullet(character.x, character.y, input.x, input.y));
        }
    }

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

    var collision = function(o1, o2){
        if (_.isNull(o1) || _.isNull(o2)) return false;
        var dx = o2.x - o1.x;
        var dy = o2.y - o1.y;
        var radii = o2.radius + o1.radius;
        if (( dx * dx )  + ( dy * dy ) < radii * radii ){
            return true;
        }
        return false;
    }

    var clearStacks = function(){
        enemyStack = [];
        bulletStack = [];
        partcleStack = [];
    }

    var increaseDifficulty = function(score){
        MECHANICS.ENEMY_HEALTH += MECHANICS.ENEMY_HEALTH_INCREASE_RATE;
        MECHANICS.ENEMY_MAX_SPEED += MECHANICS.ENEMY_SPEED_INCREASE_RATE;
    }

    game.update = function(){
        createBullet(mouse, character);

        enemyStack.forEach(function(enemy, index, array){
            enemy.behaviour(enemyStack, bulletStack, character);
            enemy.move();

            if (game.isComputer()){
                if (collision(character, enemy) || collision(otherCharacter, enemy)){
                    if (!MECHANICS.DEVELOPER_MODE){
                        network.sendGameOver();
                        game.stop();
                        lossCounter++;
                    }
                }
            }

            if (enemy.isDead()) {
                createExplosion(enemy.x, enemy.y, "#525252");
                createExplosion(enemy.x, enemy.y, "#FFA318");
                delete array[index];

                if (game.isComputer()){
                    network.sendGameData({
                        deadEnemy: enemy
                    });
                    levelSystem.score++;
                    difficultyLock = false;
                    if (MECHANICS.SHOOTING_DISTANCE_MULTIPLIER > 0.15) MECHANICS.SHOOTING_DISTANCE_MULTIPLIER -= 0.01;
                }
            }
        });

        bulletStack.forEach(function(bullet, index, array){
            bullet.move();

            //figure out
            if(bullet.fromEnemy && (collision (bullet, character) || collision(bullet, otherCharacter))){
                if (!MECHANICS.DEVELOPER_MODE){
                    network.sendGameOver();
                    game.stop();
                    lossCounter++;
                }
            }

            enemyStack.forEach(function(enemy, ei, ea){
                if (collision(bullet, enemy) && !bullet.fromEnemy){
                    enemy.decreaseHealth();
                    setTimeout(function(){
                        delete array[index];
                    }, 10);
                }
            });

            if (bullet.isOutside()){
                delete array[index];
            }
        });

        particleStack.forEach(function(particle, index, array){
            particle.update();
            if (particle.isDead()){
                delete array[index];
            }
        });

        character.move(direction);
    }

    game.draw = function(){
        ctx.clearRect(0, 0, game.width, game.height);

        game.drawScore(ctx);

        bulletStack.forEach(function(bullet){
            bullet.draw(ctx);
        });

        enemyStack.forEach(function(enemy){
            if (enemy){
                enemy.draw(ctx);
            }
        });

        particleStack.forEach(function(particle, index, array){
            particle.draw(ctx);
        });

        character.draw(ctx);

        if (multiplayer){
            otherCharacter.draw(ctx);
        }
    }

    game.loop = function(){
        game.network();
        game.update();
        game.draw();
    }

    game.endGame = function(){
        particleStack.forEach(function(particle, index, array){
            particle.update();
            if (particle.isDead()){
                delete array[index];
            }
        });

        ctx.clearRect(0, 0, game.width, game.height);
        game.drawScore(ctx);

        enemyStack.forEach(function(enemy){
            enemy.draw(ctx);
        });

        particleStack.forEach(function(particle, index, array){
            particle.draw(ctx);
        });
    }

    game.stop = function(){
        console.log("game stopped");

        clearInterval(game.id);
        clearInterval(game.enemyGeneratorId);

        var endGameId = setInterval(game.endGame, 1000/60);

        createExplosion(character.x, character.y, "#525252");
        createExplosion(character.x, character.y, "#FFA318");

        var highScore = window.localStorage.getItem("highScore");
        if (!highScore) highScore = 0;
        if (levelSystem.score > highScore){
            highScore = levelSystem.score;
            window.localStorage.setItem("highScore", highScore);
        }

        setTimeout(function(){
            clearInterval(endGameId);
            levelSystem.score=0;
            clearStacks();

            if (game.isComputer()) {
                vm.currentState(STATES.GAME_OVER);
            } else {
                vm.currentState(STATES.JOIN_WAITING);
            }

        }, 3000);
    }

    game.isComputer = function() {
        return !multiplayer || (multiplayer && hosting);
    }

    game.drawScore = function(ctx){
        ctx.font = "700px score";
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = "center";
        ctx.fillText(levelSystem.score, game.width/2, game.height - 300);
    }

    var vm = new MasterViewModel(game, network, ui);
    ko.applyBindings(vm);

});
