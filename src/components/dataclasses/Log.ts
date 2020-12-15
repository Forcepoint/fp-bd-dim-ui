import moment from 'moment'

/** Class representing a log entry. */
export class Log {
  public module_name: string
  public message: string
  public date: string
  public time: string
  public log_level: string

  /**
   * Construct an object of the log class.
   * @param {string} module_name - The name for the app.
   * @param {string} message - The message itself.
   * @param {string} date_time - Date and time of log message.
   * @param {string} log_level - Log level
   */
  constructor (module_name: string, message: string, date_time: string, log_level: string) {
    this.module_name = module_name
    this.message = message
    this.log_level = log_level

    moment().locale('en-GB')
    this.date = moment(date_time).format('L')
    this.time = moment(date_time).format('h:mm:ssa')
  }
}
