var MasterViewModel = function(game, network, ui) {
    var self = this;

    self.states = STATES;
    self.currentState = ko.observable(STATES.MAIN_MENU);
    self.serverName = ko.observable();
    self.clientName = ko.observable();
    self.roomName = ko.observable();

    self.buildHtml = ko.observable();
    getCurrentBuild(function(data){
        var date = moment(data.date).format('MMMM Do YYYY, h:mm a');
        self.buildHtml("Version rc"+ data.version + " (alpha)<br> Last updated " + date + "<br> Build: " + data.message );
    });

    self.startGame = function() {
        setTimeout(function(){
            self.currentState(STATES.GAME);
        }, 200);
        game.start();
    };

    // Main Menu Actions
    self.singlePlayer = function() {
        multiplayer = false;
        self.startGame();
    };

    self.multiplayer = function() {
        self.currentState(STATES.MULTIPLAYER);
    };

    self.hostGame = function() {
        multiplayer = true;
        hosting = true;
        self.roomName(Math.random().toString(36).substr(2, 1));
        self.currentState(STATES.HOSTING_SETUP);
    };

    self.joinGame = function() {
        multiplayer = true;
        hosting = false;
        self.currentState(STATES.JOINING);
    }

    //Game Over Menu Actions
    self.home = function() {
        self.currentState(STATES.MAIN_MENU);
    }

    self.replay = function () {
        if (multiplayer){
            network.sendGameStartedByHost();
        }
        self.startGame();
    }

    //Hosting Menu Actions
    self.startHosting = function() {
        network.sendHostingMessage(self.serverName(), self.roomName());
    }

    ui.onStartHostingResponse = function() {
        console.log("test");
        self.currentState(STATES.HOST_WAITING);
    }

    //Joining Menu Actions
    self.joiningGame = function() {
        network.sendJoiningMessage(self.clientName(), self.roomName());
    }

    ui.onJoinResponse = function(message) {
        if (hosting){
            self.clientName(message.clientName);
            self.currentState(STATES.HOST_READY);
        } else {
            self.serverName(message.serverName);
            self.currentState(STATES.JOIN_WAITING);
        }
    }

    //Host Ready Menu Actions
    self.hostStartGame = function() {
        network.sendGameStartedByHost();
        self.startGame();
    }

    ui.onStartGameByHost = function() {
        self.startGame();
    }

    ui.onGameOver = function() {
        game.stop();
        if (hosting){

        } else {

        }
    }

    return self;
}
