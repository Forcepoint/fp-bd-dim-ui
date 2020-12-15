<template>
  <transition name="fade">
    <div v-if="active">

      <!-- Element - URL -->
      <table v-if="type == 'URL'">
        <tr>
          <th>Source</th>
          <th>Type</th>
          <th>Value</th>
          <th></th>
        </tr>
        <tr>
          <td>Manual Entry</td>
          <td><v-select label="element_type" v-model="type" :options="types" class="type-select" :clearable="false"></v-select></td>
          <td><input placeholder="Value" v-model="value" /></td>
          <td><button @click="submit_element">Submit</button></td>
        </tr>
      </table>

      <!-- Element - Domain -->
      <table v-else-if="type == 'DOMAIN'">
        <tr>
          <th>Source</th>
          <th>Type</th>
          <th>Value</th>
          <th></th>
        </tr>
        <tr>
          <td>Manual Entry</td>
          <td><v-select label="element_type" v-model="type" :options="types" class="type-select" :clearable="false"></v-select></td>
          <td><input placeholder="Value" v-model="value" /></td>
          <td><button @click="submit_element">Submit</button></td>
        </tr>
      </table>

      <!-- Element - IP -->
      <table v-else-if="type == 'IP'">
        <tr>
          <th>Source</th>
          <th>Type</th>
          <th>Value</th>
          <th></th>
        </tr>
        <tr>
          <td>Manual Entry</td>
          <td><v-select label="element_type" v-model="type" :options="types" class="type-select" :clearable="false"></v-select></td>
          <td><input placeholder="Value" v-model="value" /></td>
          <td><button @click="submit_element">Submit</button></td>
        </tr>
      </table>

      <!-- Element - Range -->
      <table v-else-if="type == 'RANGE'">
        <tr>
          <th>Source</th>
          <th>Type</th>
          <th>Value</th>
          <th></th>
        </tr>
        <tr>
          <td>Manual Entry</td>
          <td><v-select label="element_type" v-model="type" :options="types" class="type-select" :clearable="false"></v-select></td>
          <td><input placeholder="From" v-model="from" class="from-to" /><input placeholder="To" v-model="to" class="from-to" /></td>
          <td><button @click="submit_element">Submit</button></td>
        </tr>
      </table>

    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Add extends Vue {
  @Prop(String) list!: string
  @Prop(Boolean) active!: boolean

  // Display values and types.
  types = ['URL', 'DOMAIN', 'IP', 'RANGE']
  type = 'URL'
  value = ''
  from = ''
  to = ''

  /**
   * On clicking submit, submit a manual
   * entry to the blocklist or safelist.
   */
  submit_element() {

    // Validate values
    if (!this.valid_value()) {
      return
    }

    // Build value.
    let element_value = ''
    if (this.type === 'RANGE') {
      element_value = `${this.from}-${this.to}`
    } else {
      element_value = this.value
    }

    // Build element for submission.
    const element = {
      source: 'Manual Entry',
      service_name: 'controller',
      type: this.type,
      value: element_value,
      safe: this.list === 'Safelist'
    }

    // Build request and post.
    const url = '/api/elements'
    Vue.axios.post(url, JSON.stringify(element)).then(() => {
      this.$EventBus.$emit('alert', { type: 1, value: `Successfully added entry for '${this.type}' with value '${element_value}'.` })
      this.$EventBus.$emit('refresh_elements')
      this.value = ''
      this.type = 'URL'
    }).catch((error) => {
      if (error.response.status === 401) {
        this.$EventBus.$emit('alert', { type: 2, value: 'Your session has expired. Please login again.' })
        this.$EventBus.$emit('close_websocket')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.$router.push('/login')
      } else if (error.response.status === 403) {
        this.$EventBus.$emit('alert', { type: 2, value: 'You are not authorized. Please login.' })
        this.$EventBus.$emit('close_websocket')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.$router.push('/login')
      } else if (error.response.status === 409) {
        this.$EventBus.$emit('alert', { type: 3, value: 'Duplicate values not allowed in the Dynamic Intelligence Manager elements list.' })
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error submitting the new element. Please try again later.' })
      }
    })

  }

  /**
   * Validate the values entered.
   * Checks if field empty and if the
   * value entered relates to the type
   * selected.
   */
  valid_value() {

    // Check if empty value
    if (this.type !== 'RANGE' && this.value === '') {
      this.$EventBus.$emit('alert', { type: 3, value: 'A value must be entered. The field cannot be empty.' })
      return false
    } else if (this.type === 'RANGE' && (this.to === '' || this.from === '')) {
      this.$EventBus.$emit('alert', { type: 3, value: 'A value must be entered for both the from and to fields. The fields cannot be empty.' })
      return false
    }

    // Validate different element types
    let valid = false

    if (this.type === 'URL') {

      // Check that it's not an IP address.
      const ip = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/
      const ip_regex = new RegExp(ip)

      valid = ip_regex.test(this.value)

      if (!valid) {

        // Create regular expression for urls
        const url = /^(http:\/\/|https:\/\/|www\.)+[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
        const url_regex = new RegExp(url)

        valid = url_regex.test(this.value)

      } else {

        valid = false

      }

    } else if (this.type === 'Domain' || this.type === 'DOMAIN') {

      // Create regular expression for domains.
      const domain = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/
      const domain_regex = new RegExp(domain)

      // Check if value valid
      valid = domain_regex.test(this.value)

    } else if (this.type === 'IP') {

      // Create regular expression for IP addresses
      const ip = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/
      const ip_regex = new RegExp(ip)

      valid = ip_regex.test(this.value)

    } else if (this.type === 'RANGE') {

      // Create regular expression for IP addresses
      const range = /^(\b([1-9][0-9]{0,2}?|255)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)-(\b([1-9][0-9]{0,2}?|255)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)$/
      const range_regex = new RegExp(range)
      const ip_range = `${this.from}-${this.to}`

      valid = range_regex.test(ip_range)

    }

    // Check if IP range and if valid range.
    if (this.type === 'RANGE' && valid) {
      valid = this.from < this.to
    }

    // Send out alert if invalid.
    if (!valid) {
      this.$EventBus.$emit('alert', { type: 3, value: `The value entered must be a valid '${this.type}'.` })
    }

    return valid
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

table {
  display: table;
  margin: 0 0 1.5em 0;
}

.type-select {
  width: 12em;
  background-color: #FFFFFF;
}

button {
  padding: 1em 1.5em;
  float: right;
  background-color: $main;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input {
  background-color: #FFFFFF;
  border: none;
  padding: 1.2em 1.25em;
}

input:hover {
  background-color: $quatenary;
}

.panel-margin {
  margin: 0 0 1.5em 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.from-to {
  width: 17.5em;
}

.from-to:nth-child(1) {
  margin: 0 0 0.5em 0;
}

</style>
