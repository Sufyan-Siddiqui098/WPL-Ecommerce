import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Set dynamic severity
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(), // Output JSON format for log analyzers
    winston.format.colorize()
  ),
  transports: [
    new winston.transports.Console(), // Log to terminal
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // Error log file
    new winston.transports.File({ filename: 'combined.log' }) // All system log file
  ],
});
