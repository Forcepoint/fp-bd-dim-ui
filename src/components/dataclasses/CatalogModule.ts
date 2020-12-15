/** Class representing an module module */
export class CatalogModule {
  public id: string
  public name: string
  public description: string
  public type: string
  public accepted_data_types: string[]
  public image_ref: string
  public icon_url: string
  public volumes: string[]
  public env_vars: string[]
  public command = 'create'

  /**
   * Construct an object of the module class.
   * @param {string} id - The ID for the module.
   * @param {string} name - The name for the module.
   * @param {string} description - Description of module.
   * @param {string} type - Module type e.g ingress.
   * @param {string[]} accepted_data_types - List of accepted data types.
   * @param {string} image_ref - Name of docker image.
   * @param {string} icon_url - URL for the icon for the UI.
   * @param {string[]} volumes - Docker volumes.
   * @param {string[]} env_vars - Environment Variables for Docker.
   */
  constructor (
    id: string,
    name: string,
    description: string,
    type: string,
    accepted_data_types: string[],
    image_ref: string,
    icon_url: string,
    volumes: string[],
    env_vars: string[]
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.type = type
    this.accepted_data_types = accepted_data_types
    this.image_ref = image_ref
    this.icon_url = icon_url
    this.volumes = volumes
    this.env_vars = env_vars
  }

}
