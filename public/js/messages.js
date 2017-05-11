var MESSAGES = {
    HOSTING_GAME_REQUEST: {
        id: 1
    },
    JOINING_GAME_REQUEST: {
        id: 2
    },
    SUCCESSFUL_JOIN_RESPONSE: {
        id: 3
    },
    GAME_STARTED_BY_HOST: {
        id: 4
    },
    SUCCESSFUL_ROOM_CREATION: {
        id: 5
    },
    GAME_DATA: {
        id: 100
    },
    GAME_OVER: {
        id: 101
    },
    CANCEL: {
        id: 200
    }
}

if (module){
    module.exports = MESSAGES;
}
