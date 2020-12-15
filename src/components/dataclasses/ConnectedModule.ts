import moment from 'moment'

/** Class representing a connected module */
export class ConnectedModule {
  public module_display_name: string
  public module_service_name: string
  public module_description: string
  public module_type: string
  public icon_url: string
  public module_route: string
  public configured: boolean
  public configurable: boolean
  public status: number
  public last_import: string

  /**
   * Construct an object of the module class.
   * @param {string} module_display_name - The name for the module.
   * @param {string} module_service_name - The service name of the module.
   * @param {string} module_description - Description of module.
   * @param {string} module_type - Module module_type.
   * @param {string} icon_url - Module Icon URL.
   * @param {string} module_route - Inbound route for module.
   * @param {boolean} configured - Is the module configured?
   * @param {boolean} configurable - Flag to indicate if module can be configured.
   * @param {number} status - The status of the module.
   * @param {string} last_import - Last import date time.
   */
  constructor (
    module_display_name: string,
    module_service_name: string,
    module_description: string,
    module_type: string,
    icon_url: string,
    module_route: string,
    configured: boolean,
    configurable: boolean,
    status: number,
    last_import: string
  ) {
    this.module_display_name = module_display_name
    this.module_service_name = module_service_name
    this.module_description = module_description
    this.module_type = module_type
    this.icon_url = icon_url
    this.module_route = module_route
    this.configured = configured
    this.configurable = configurable
    this.status = status

    if (last_import === '') {
      this.last_import = ''
    } else {
      this.last_import = moment(last_import, 'YYYY-MM-DD hh:mm:ss').fromNow()
    }
  }

}
