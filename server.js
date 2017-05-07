var http = require('http');
var sockjs = require('sockjs');
var MESSAGES = require("./js/messages");
var ERRORS = {
    ROOM_ALREADY_EXISTS: {
        error: 1000,
        message: "A room with this name already exists."
    },
    ROOM_DOES_NOT_EXIST: {
        error: 1001,
        message: "A room with this name does not exist."
    }
}

var rooms = {
    "test": {
        server: null,
        client: null
    }
}

var send = function(conn, object){
    conn.write(JSON.stringify(object));
}

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
echo.on('connection', function(conn) {
    conn.on('data', function(message) {
        var message = JSON.parse(message);

        if (message.id == MESSAGES.HOSTING_GAME_REQUEST.id) {
            if (!rooms[message.roomName]){
                rooms[message.roomName] = {
                    server: conn,
                    serverName: message.serverName
                };
                console.log("Created room:", message.roomName);
                send(conn, MESSAGES.SUCCESSFUL_ROOM_CREATION)
            } else {
                send(conn, ERRORS.ROOM_ALREADY_EXISTS);
            }
        }
        else if (message.id == MESSAGES.JOINING_GAME_REQUEST.id) {
            if (rooms[message.roomName] && !rooms[message.roomName].client) {
                var r = rooms[message.roomName];
                r.client = conn;

                var serverMessage = MESSAGES.SUCCESSFUL_JOIN_RESPONSE;
                serverMessage.clientName = message.clientName;
                send(r.server, serverMessage);

                var clientMessage = MESSAGES.SUCCESSFUL_JOIN_RESPONSE;
                clientMessage.serverName = r.serverName
                send(r.client, clientMessage);

            } else {
                send(conn, ROOM_DOES_NOT_EXIST);
            }
        }
        else if (message.id == MESSAGES.GAME_STARTED_BY_HOST.id) {
            var r = rooms[messageName.roomName];
            send(r.client, MESSAGES.GAME_STARTED_BY_HOST);
        }

    });

    conn.on('close', function() {});
});

var server = http.createServer();
echo.installHandlers(server, {prefix:'/echo'});
server.listen(3000, '0.0.0.0');
