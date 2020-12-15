/** Class representing an Element. */
export class Element {
  public id: number
  public created_at: string
  public updated_at: string
  public deleted_at: string
  public source: string
  public service_name: string
  public type: string
  public value: string
  public batch_number: number
  public safe: boolean

  /**
   * Construct an object of the element class.
   */
  constructor(
    id: number,
    created_at: string,
    updated_at: string,
    deleted_at: string,
    source: string,
    service_name: string,
    type: string,
    value: string,
    batch_number: number,
    safe: boolean
  ) {
    this.id = id
    this.created_at = created_at
    this.updated_at = updated_at
    this.deleted_at = deleted_at
    this.source = source
    this.service_name = service_name
    this.type = type
    this.value = value
    this.batch_number = batch_number
    this.safe = safe
  }
}
