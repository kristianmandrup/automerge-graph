interface ILogger {
  log(msg: string, data?: any): void
}

export interface INotifier {
  log(message: string, data?: any): void
  error(message: string, data?: any): void
  warn(message: string, data?: any): void
}

export class Notifier {
  logger: ILogger
  constructor(options: any) {
    this.logger = options.logger || console
  }
  /**
   * Log a message with optional data
   * @param message
   * @param data
   */
  log(message: string, data?: any): void {
    data ? this.logger.log(message, data) : this.logger.log(message)
  }

  /**
   *
   * @param message
   * @param data
   */
  error(message: string, data?: any): void {
    message = 'ERROR:' + message
    this.log(message, data)
    throw new Error(message)
  }

  /**
   *
   * @param message
   * @param data
   */
  warn(message: string, data?: any): void {
    this.log('WARNING:' + message, data)
  }
}

