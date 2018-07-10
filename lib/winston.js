const winston = require('winston');

const options = {
    file: {
        level: 'info',
        filename: `./logs/server.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const transports = [new winston.transports.File(options.file)];
if (process.env.NODE_ENV == 'development') {
    transports.push(new winston.transports.Console(options.console));
}

const logger = winston.createLogger({
    transports: transports,
    exitOnError: false,
});

module.exports = logger;