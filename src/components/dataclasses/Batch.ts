/** Class representing a batch. */
export class Batch {
  public id: number
  public created: string
  public updated: string
  public deleted: string
  public service_name: string
  public status: string
  public update_batch_id: number
  public module_metadata_id: number

  /**
   * Construct an object of the module class.
   * @param {number} id - ID number for the batch.
   * @param {string} created - Creation date for batch.
   * @param {string} updated - Last updated date for batch.
   * @param {string} deleted - Date when batch was deleted.
   * @param {string} service_name - Service which batch is associated with.
   * @param {string} status - Status of batch.
   * @param {number} update_batch_id - Batch ID.
   * @param {number} module_metadata_id - ID of associated module.
   */
  constructor (
    id: number,
    created: string,
    updated: string,
    deleted: string,
    service_name: string,
    status: string,
    update_batch_id: number,
    module_metadata_id: number
  ) {
    this.id = id
    this.created = created
    this.updated = updated
    this.deleted = deleted
    this.service_name = service_name
    this.status = status
    this.update_batch_id = update_batch_id
    this.module_metadata_id = module_metadata_id
  }

}
