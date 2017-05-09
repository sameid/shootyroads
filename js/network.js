var Network = function(host, ui) {
    console.log("Connecting to server...", host);
    var that = this;

    this.gameDataCallback = null;
    this.closed = true;

    this.sock = new SockJS(host);
    this.roomName = null;
    this.isHost = null;

    this.sock.onopen = function() {
        console.log("Connected!");
        that.closed = false;
    };

    this.sock.onmessage = function(e) {
        var message = JSON.parse(e.data)

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

    this.sock.onclose = function() {
        that.close = true;
    };
}

//maybe we can remove this?
Network.prototype.setGameDataCallback = function(callback) {
    this.gameDataCallback = callback;
}

Network.prototype.sendHostingMessage = function(serverName, roomName){
    this.isHost = true;
    this.roomName = roomName;
    this.sock.send(JSON.stringify({
        id: MESSAGES.HOSTING_GAME_REQUEST.id,
        serverName: serverName,
        roomName: roomName
    }));
}

Network.prototype.sendJoiningMessage = function(clientName, roomName){
    this.isHost = false
    this.roomName = roomName;
    this.sock.send(JSON.stringify({
        id: MESSAGES.JOINING_GAME_REQUEST.id,
        clientName: clientName,
        roomName: roomName
    }));
}

Network.prototype.sendGameStartedByHost = function(){
    var message = MESSAGES.GAME_STARTED_BY_HOST;
    message.roomName = this.roomName
    message = JSON.stringify(message);
    this.sock.send(message);
}

Network.prototype.sendGameData = function(data) {
    var message = MESSAGES.GAME_DATA;
    message.data = data;
    message.isHost = this.isHost;
    message.roomName = this.roomName;
    message = JSON.stringify(message);
    this.sock.send(message);
}

Network.prototype.sendGameOver = function() {
    var message = MESSAGES.GAME_OVER;
    message.isHost = this.isHost;
    message.roomName = this.roomName;
    message = JSON.stringify(message);
    this.sock.send(message);
}

Network.prototype.closeSocket = function() {
    this.sock.close();
}
