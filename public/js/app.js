/**
 * app.js
 *
 * Handles all game ui
 *
 * Created by Sameid Usmani on 10-05-17.
 */

/**
 * MasterViewModel, used to append to handle the main Knockout binding for all the game ui
 * (Note: Knockout uses a MVVM paradigm where this function the Model and index.html is the View, and all observables are two-way bindable properties)
 *
 * @param game {Object} - entire game Object
 * @param network {Network} - instance of the network Object
 * @param io {Object} - entire ui object
 */
var MasterViewModel = function(game, network, ui) {
    // Keep a current state of the view model to be used within functions and computed observables
    var self = this;

    // Keep a local instance of the states to compare against in index.html
    self.states = STATES;

    // Current state is used to determine which ui menu to show the user
    self.currentState = ko.observable(STATES.MAIN_MENU); // Preset to MAIN_MENU at the initialization

    // Knockout Observables used for two-way binding between model and view
    self.serverName = ko.observable();
    self.clientName = ko.observable();
    self.roomName = ko.observable();
    self.buildHtml = ko.observable();

    // Uses the getCurrentBuild in utils.js to get the current builf from Github
    getCurrentBuild(function(data){
        var date = moment(data.date).format('MMMM Do YYYY, h:mm a');
        self.buildHtml("Version rc"+ data.version + " (alpha)<br> Last updated " + date + "<br> Build: " + data.message );
    });

    /**
     * If called in the view, it will start the actual game module
     */
    self.startGame = function() {
        setTimeout(function(){
            self.currentState(STATES.GAME);
        }, 200);
        game.start();
    };

    /**
     * Cancel the current game if there is one, and reset the game
     */
    self.cancel = function() {

        //TODO: check game and stop it if necessary

        isMultiplayer = false;
        self.serverName("");
        self.clientName("");
        self.roomName("")
        self.currentState(STATES.MAIN_MENU);
    }

    // Main Menu Actions

    /**
     * Starts a new game, for singlePlayer
     */
    self.singlePlayer = function() {
        isMultiplayer = false;
        self.startGame();
    };

    /**
     * Moves to the multiplayer ui view
     */
    self.multiplayer = function() {
        self.currentState(STATES.MULTIPLAYER);
    };

    self.isOpen = ko.observable(!network.isClosed);

    /**
     * Generates a roomName for the hoster and moves to the hosting setup view
     */
    self.hostGame = function() {
        isMultiplayer = true;
        isHosting = true;
        self.roomName(Math.floor(Math.random() * 10000));
        self.currentState(STATES.HOSTING_SETUP);
    };

    /**
     * Moves the client user to the joining ui view
     */
    self.joinGame = function() {
        isMultiplayer = true;
        isHosting = false;
        self.currentState(STATES.JOINING);
    }

    //Game Over Menu Actions

    /**
     * Moves to the main menu ui view
     */
    self.home = function() {
        self.currentState(STATES.MAIN_MENU);
    }

    /**
     * Moves starts a new game, and will notify the client if it's in multiplayer mode
     */
    self.replay = function () {
        if (isMultiplayer){
            network.sendGameStartedByHost();
        }
        self.startGame();
    }

    //Hosting Menu Actions

    /**
     * Notifies the backend that the host has started hosting
     */
    self.startHosting = function() {
        network.sendHostingMessage(self.serverName(), self.roomName());
    }

    /**
     * Callback for the host to be notified that they can now wait for clients to join them
     */
    ui.onStartHostingResponse = function() {
        self.currentState(STATES.HOST_WAITING);
    }

    //Joining Menu Actions

    /**
     * Notifies the backend that the client is requesting to join a room
     */
    self.joiningGame = function() {
        network.sendJoiningMessage(self.clientName(), self.roomName());
    }

    /**
     * Callback for when the server responds to the join request
     *
     * @param message {Object}
     */
    ui.onJoinResponse = function(message) {
        if (isHosting){
            self.clientName(message.clientName);
            self.currentState(STATES.HOST_READY);
        } else {
            self.serverName(message.serverName);
            self.currentState(STATES.JOIN_WAITING);
        }
    }

    //Host Ready Menu Actions

    /**
     * Notifies the client that a new game has started by the host
     */
    self.hostStartGame = function() {
        network.sendGameStartedByHost();
        self.startGame();
    }

    /**
     * Callback for when the host notifies that they have started a new game
     */
    ui.onStartGameByHost = function() {
        self.startGame();
    }

    /**
     * Callback for either when the host or client has notified that the game is over.
     */
    ui.onGameOver = function() {
        game.stop();
    }

    /**
     * Callback for either when the host or client has disconnected from the node server
     */
    ui.onCancel = function () {
        self.cancel();
    }

    return self;
}
