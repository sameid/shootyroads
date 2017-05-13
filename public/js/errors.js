var ERRORS = {
    ROOM_ALREADY_EXISTS: {
        error: 1000,
        message: "A room with this name already exists."
    },
    ROOM_DOES_NOT_EXIST: {
        error: 1001,
        message: "A room with this name does not exist."
    },
    CLIENT_DISCONNECTED: {
        error: 1002,
        message: "The client mysteriously disconnected."
    },
    SERVER_DISCONNECTED: {
        error: 1002,
        message: "The client mysteriously disconnected."
    }
}

try {
    if (module){
        module.exports = ERRORS;
    }
} catch(e) {}
