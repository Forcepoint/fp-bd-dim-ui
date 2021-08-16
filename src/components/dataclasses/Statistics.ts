/** Class representing stats reported from stats endpoint */
export class Statistics {

  public num_sources: number
  public num_blocked_ips: number
  public num_blocked_domains: number
  public num_blocked_urls: number
  public num_blocked_ranges: number
  public num_blocked_snorts: number
  public last_update: string

  /**
   * Constructor for object of Statistics Class
   */
  constructor () {
    this.num_sources = 0
    this.num_blocked_ips = 0
    this.num_blocked_domains = 0
    this.num_blocked_urls = 0
    this.num_blocked_ranges = 0
    this.num_blocked_snorts = 0
    this.last_update = ''
  }

  /**
   * Add data from JSON response
   * @param {Record<string, any>} data - json response
   */
  // eslint-disable-next-line
  set (data: Record<string, any>) {
    this.num_sources = data.num_sources
    this.num_blocked_ips = data.num_blocked_ips
    this.num_blocked_domains = data.num_blocked_domains
    this.num_blocked_urls = data.num_blocked_urls
    this.num_blocked_ranges = data.num_blocked_ranges
    this.num_blocked_snorts = data.num_blocked_snorts
    this.last_update = data.last_update
  }

}
