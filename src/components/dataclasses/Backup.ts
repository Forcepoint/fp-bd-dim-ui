import moment from 'moment'

/** Class representing a backup */
export class Backup {
  public id: number
  public type: string
  public backup_date: string
  public elements_count: number

  /**
   * Construct an object of the module class.
   * @param {number} id - The ID of the Backup.
   * @param {string} type - The backup type.
   * @param {string} backup_date - The date on which the backup was created.
   * @param {number} elements_count - Number of elements contained in backup.
   */
  constructor (
    id: number,
    type: string,
    backup_date: string,
    elements_count: number
  ) {
    this.id = id
    this.elements_count = elements_count

    if (type === 'Manual' || type === 'Auto') {
      this.type = type
    } else {
      this.type = '---'
    }

    moment().locale('en-GB')
    this.backup_date = moment.utc(backup_date, 'DD MMM YY HH:mm').format('dddd, MMMM Do YYYY, HH:mm')
  }

}
