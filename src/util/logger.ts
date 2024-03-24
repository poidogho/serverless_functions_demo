import { createLogger, format, transports, Logger } from 'winston';

/**
 * Singleton class for application-wide logging.
 * Uses Winston for logging with a configured format and transports.
 */
class LoggerService {
  /**
   * Singleton instance of LoggerService.
   */
  // eslint-disable-next-line no-use-before-define
  private static instance: LoggerService;

  /**
   * Winston Logger instance.
   */
  private logger: Logger;

  /**
   * Private constructor to prevent direct construction calls with the `new` operator.
   */
  private constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      ],
    });
  }

  /**
   * Gets the singleton instance of the LoggerService.
   * @returns The singleton instance of the LoggerService.
   */
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Creates a child logger with the specified metadata.
   * @param meta Metadata to be included in every log from the child logger.
   * @returns A child logger instance.
   */
  public createChildLogger(meta: Record<string, unknown>): Logger {
    return this.logger.child(meta);
  }

  /**
   * Logs a message at the specified level.
   * @param level The level at which to log the message.
   * @param message The message to log.
   * @param meta Optional meta data to log with the message.
   */
  public log(level: string, message: string, meta?: unknown) {
    this.logger.log(level, message, meta);
  }

  /**
   * Logs a message at the 'info' level.
   * @param message The message to log.
   * @param meta Optional meta data to log with the message.
   */
  public info(message: string, meta?: unknown) {
    this.log('info', message, meta);
  }

  /**
   * Logs a message at the 'warn' level.
   * @param message The message to log.
   * @param meta Optional meta data to log with the message.
   */
  public warn(message: string, meta?: unknown) {
    this.log('warn', message, meta);
  }

  /**
   * Logs a message at the 'error' level.
   * @param message The message to log.
   * @param meta Optional meta data to log with the message.
   */
  public error(message: string, meta?: unknown) {
    this.log('error', message, meta);
  }

  /**
   * Logs a message at the 'debug' level.
   * @param message The message to log.
   * @param meta Optional meta data to log with the message.
   */
  public debug(message: string, meta?: unknown) {
    this.log('debug', message, meta);
  }
}

export default LoggerService;
