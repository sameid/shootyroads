module.exports = {
    apps : [{
        name        : "shootyroads",
        script      : "./server.js",
        watch       : false,
        env: {
            "PORT": 3000
        },
        env_production : {
            "PORT": 80
        }
    }]
}
