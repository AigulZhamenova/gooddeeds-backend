// logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info", // Уровень логирования
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "server.log" })
  ]
});

module.exports = logger;
