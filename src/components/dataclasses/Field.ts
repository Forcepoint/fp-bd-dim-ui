/** Class representing a form field. */
export class Field {
  public label: string
  public type: number
  public expected_json_name: string
  public rationale: string
  public value: string
  public possible_values: string[]
  public required: boolean

  /**
   * Construct an object of the field class.
   * @param {string} label - The label for the field.
   * @param {number} type - The field type to be displayed.
   * @param {string} expected_json_name - The json name for the field.
   * @param {string} rationale - The reasoning behind the field.
   * @param {string} value - The default value, or filled value.
   * @param {string[]} possible_values - The range of possible values for the field.
   * @param {boolean} required - Is this field required?
   */
  constructor (
    label: string,
    type: number,
    expected_json_name: string,
    rationale: string,
    value: string,
    possible_values: string[],
    required: boolean
  ) {
    this.label = label
    this.type = type
    this.expected_json_name = expected_json_name
    this.rationale = rationale
    this.value = value
    this.possible_values = possible_values
    this.required = required
  }
}
