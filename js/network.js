var Network = function(host, ui) {
    console.log("Connecting to server...")
    var that = this;

    this.receiveCallback = null;
    this.closed = true;

    this.sock = new SockJS(host);

    this.sock.onopen = function() {
        console.log("Connected!");
        that.closed = false;
    };

    this.sock.onmessage = function(e) {
        console.log('message', e.data);
        var message = JSON.parse(e.data)

        if (message.id == MESSAGES.SUCCESSFUL_ROOM_CREATION.id) {
            ui.makeHostWait();
        }

        // if (that.receiveCallback) {
        //     that.receiveCallback(e.data);
        // }
    };

    this.sock.onclose = function() {
        that.close = true;
    };
}

Network.prototype.receiveCallback = function(callback) {
    this.receiveCallback = callback;
}

Network.prototype.sendHostingMessage = function(serverName, roomName){
    this.sock.send(JSON.stringify({
        id: MESSAGES.HOSTING_GAME_REQUEST.id,
        serverName: serverName,
        roomName: roomName
    }));

    // this.sock.send("test");
}

Network.prototype.sendData = function(data) {
    this.sock.send(data);
}

Network.prototype.closeSocket = function() {
    this.sock.close();
}
