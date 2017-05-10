/**
 * network.js
 *
 * Handles all network operations over WebSockets using SockJS.
 *
 * Created by Sameid Usmani on 08-05-17.
 */

/**
 * Network constructor
 *
 * @param host {String}
 * @param ui {Object}
 */
var Network = function(host, ui) {
    console.log("Connecting to server...", host);
    var that = this;

    // Used to store receive data handler
    this.gameDataCallback = null;

    // Indicates if the socket is open or closed
    this.isClosed = true;

    // Stores the roomName the host or client is trying to host or join
    this.roomName = null;

    // Indicates if the current user is the host
    this.isHost = null;

    // Create a SockJS object that connects to our SockJS server
    this.sock = new SockJS(host);

    // Proprietary SockJS callbacks for WebSocket events.
    this.sock.onopen = function() {
        console.log("Connected!");
        that.isClosed = false;
    };

    this.sock.onclose = function() {
        that.isClosed = true;
    };

    // Main WebSocket message handler, performs specific game related functions based on messages
    this.sock.onmessage = function(e) {
        var message = JSON.parse(e.data)

        // Specific messages will result in either game or ui changes
        if (message.id == MESSAGES.SUCCESSFUL_ROOM_CREATION.id) {
            ui.onStartHostingResponse();
        }
        else if (message.id == MESSAGES.SUCCESSFUL_JOIN_RESPONSE.id) {
            ui.onJoinResponse(message);
        }
        else if (message.id == MESSAGES.GAME_STARTED_BY_HOST.id) {
            ui.onStartGameByHost();
        }
        else if (message.id == MESSAGES.GAME_DATA.id) {
            that.gameDataCallback(message.data);
        }
        else if (message.id == MESSAGES.GAME_OVER.id) {
            ui.onGameOver();
        }
    };

}

/**
 * Sets the function which needs to be called when network updates game data
 *
 * @param callback {function(data)}
 */
Network.prototype.setGameDataCallback = function(callback) {
    this.gameDataCallback = callback;
}

/**
 * Let the backend know room name and the name of the character asking to host a room
 *
 * @param serverName {String}
 * @param roomName {String}
 */
Network.prototype.sendHostingMessage = function(serverName, roomName){
    this.isHost = true;
    this.roomName = roomName;
    this.sock.send(JSON.stringify({
        id: MESSAGES.HOSTING_GAME_REQUEST.id,
        serverName: serverName,
        roomName: roomName
    }));
}

/**
 * Let the backend know the room name and the name of the character requesting to join the room
 *
 * @param clientName {String}
 * @param roomName {String}
 */
Network.prototype.sendJoiningMessage = function(clientName, roomName){
    this.isHost = false
    this.roomName = roomName;
    this.sock.send(JSON.stringify({
        id: MESSAGES.JOINING_GAME_REQUEST.id,
        clientName: clientName,
        roomName: roomName
    }));
}

/**
 * Let the client know that the host has started the game
 */
Network.prototype.sendGameStartedByHost = function(){
    var message = MESSAGES.GAME_STARTED_BY_HOST;
    message.roomName = this.roomName
    message = JSON.stringify(message);
    this.sock.send(message);
}

/**
 * Let either the client or host send game data
 *
 * @param data {Object}
 */
Network.prototype.sendGameData = function(data) {
    var message = MESSAGES.GAME_DATA;
    message.data = data;
    message.isHost = this.isHost;
    message.roomName = this.roomName;
    message = JSON.stringify(message);
    this.sock.send(message);
}

/**
 * Let either have either the client or host the send the game
 */
Network.prototype.sendGameOver = function() {
    var message = MESSAGES.GAME_OVER;
    message.isHost = this.isHost;
    message.roomName = this.roomName;
    message = JSON.stringify(message);
    this.sock.send(message);
}

/**
 * Gracefully closes the WebSocket.
 */
Network.prototype.closeSocket = function() {
    this.sock.close();
}
