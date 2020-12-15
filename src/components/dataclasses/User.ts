/** Class representing a user account. */
export class User {
  public name: string
  public email: string

  /**
   * Construct an object of the user class.
   */
  constructor (name: string, email: string) {
    this.name = name
    this.email = email
  }
}
