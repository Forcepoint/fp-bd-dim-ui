/** Class representing stats reported from stats endpoint */
export class Statistics {

  public num_sources: number
  public num_blocked_ips: number
  public num_blocked_domains: number
  public num_blocked_urls: number
  public last_update: string

  /**
   * Constructor for object of Statistics Class
   */
  constructor () {
    this.num_sources = 0
    this.num_blocked_ips = 0
    this.num_blocked_domains = 0
    this.num_blocked_urls = 0
    this.last_update = ''
  }

  /**
   * Add data from JSON response
   * @param {number} num_sources - Number of stats sources.
   * @param {number} num_blocked_ips - Number of blocked IP addresses.
   * @param {number} num_blocked_domains - Number of blocked domain names.
   * @param {number} num_blocked_urls - Number of blocked URLs.
   * @param {string} last_update - Last Updated date and time.
   */
  set (
    num_sources: number,
    num_blocked_ips: number,
    num_blocked_domains: number,
    num_blocked_urls: number,
    last_update: string
  ) {
    this.num_sources = num_sources
    this.num_blocked_ips = num_blocked_ips
    this.num_blocked_domains = num_blocked_domains
    this.num_blocked_urls = num_blocked_urls
    this.last_update = last_update
  }

}
