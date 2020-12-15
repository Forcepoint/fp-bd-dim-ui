<template>
  <tr v-if="!editing">
    <td>{{ element.source }}</td>
    <td class="element-type">{{ element.type }}</td>
    <td class="element-value" v-if="element.type == 'RANGE'">{{ value.split("-")[0] }} - {{ value.split("-")[1] }}</td>
    <td class="element-value" v-else>{{ value }}</td>
    <td class="controls">
      <button class="move-button" @click="move_element()" v-if="type == 'Blocklist'">Move to Safelist</button>
      <button class="move-button" @click="move_element()" v-else-if="type == 'Safelist'">Move to Blocklist</button>
      <button class="edit-button" @click="edit_element()"><font-awesome-icon icon="edit"></font-awesome-icon></button>
      <button class="delete-button" @click="delete_element()"><font-awesome-icon icon="trash"></font-awesome-icon></button>
    </td>
  </tr>
  <tr v-else>
    <td>{{ element.source }}</td>
    <td class="element-type">{{ element.type }}</td>
    <td class="element-value-range" v-if="element.type == 'RANGE'">
      <input type="text" placeholder="From" :class="{'odd-input': (index % 2 == 0), 'error': error}" class="from-to" v-model="from" />
      <input type="text" placeholder="To" :class="{'odd-input': (index % 2 == 0), 'error': error}" class="from-to" v-model="to" />
    </td>
    <td class="element-value" v-else>
      <input type="text" placeholder="Value" :class="{'odd-input': (index % 2 == 0), 'error': error}" v-model="value" />
    </td>
    <td class="controls">
      <button class="move-button" @click="move_element()" v-if="type == 'Blocklist'" disabled>Move to Safelist</button>
      <button class="move-button" @click="move_element()" v-else-if="type == 'Safelist'" disabled>Move to Blocklist</button>
      <button class="save-button" @click="update_element()"><font-awesome-icon icon="save"></font-awesome-icon></button>
      <button class="delete-button" @click="delete_element()" disabled><font-awesome-icon icon="trash"></font-awesome-icon></button>
    </td>
  </tr>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Element as ElementData } from '@/components/dataclasses/Element'

@Component
export default class Element extends Vue {
  @Prop(ElementData) element!: ElementData
  @Prop(String) type!: string
  @Prop(Number) index!: number

  // Store value
  old_value = this.element.value
  value = this.element.value

  from = ''
  to = ''
  old_from = ''
  old_to = ''

  // Store component state.
  editing = false

  // Store error
  error = false

  /**
   * On mounting register event handler
   * to prevent multiple fields being
   * edited.
   */
  mounted() {
    this.$EventBus.$on('edit-element', this.set_state)

    // Set values if type is RANGE
    if (this.element.type === 'RANGE') {
      const values = this.element.value.split('-')
      this.from = values[0]
      this.to = values[1]
      this.old_from = this.from
      this.old_to = this.to
    }
  }

  /**
   * Edit the value of a given element.
   * Allows you to update the value in a
   * given element.
   */
  edit_element() {
    this.$EventBus.$emit('edit-element', this.element.id)
    this.editing = true
    this.value = this.old_value
  }

  /**
   * Set field state.
   */
  set_state(id: number) {
    if (this.element.id !== id) {
      this.editing = false
      this.error = false
      this.value = this.old_value
    }
  }

  /**
   * Delete an element from the Lists.
   * Removes an element from the database.
   */
  delete_element() {
    this.$fire({
      title: 'Confirm',
      text: 'Are you sure you wish to delete this entry from the blocklist?',
      showCancelButton: true,
      customClass: {
        popup: 'confirm-popup',
        header: 'confirm-header',
        cancelButton: 'cancel-button',
        confirmButton: 'confirm-button',
        title: 'confirm-title',
        content: 'confirm-content'
      }
    }).then(r => {
      if (r.value) {
        const url = '/api/elements'
        Vue.axios.delete(url, { data: JSON.stringify(this.element) }).then(() => {
          this.$emit('refresh_elements')
          this.$EventBus.$emit('alert', { type: 1, value: `Successfully deleted ${this.element.type} with value '${this.element.value}'.` })
        }).catch((error) => {
          if (error.response.status === 401) {
            this.$EventBus.$emit('alert', { type: 2, value: 'Your session has expired. Please login again.' })
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.$router.push('/login')
          } else if (error.response.status === 403) {
            this.$EventBus.$emit('alert', { type: 2, value: 'You are not authorized. Please login.' })
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.$router.push('/login')
          } else {
            this.$EventBus.$emit('alert', { type: 3, value: 'There was an error deleting the element. Please try again later.' })
          }
        })
      }
    })
  }

  /**
   * Update an element from the Lists.
   * Updates an element in the database.
   */
  update_element() {

    // Check if valid value before saving.
    if (!this.valid_value()) {
      return
    }

    // Store changed value.
    const value = this.old_value
    this.old_value = this.value

    // Update the element
    this.element.value = this.value

    // Send request to update value.
    const url = '/api/elements'
    Vue.axios.put(url, JSON.stringify(this.element)).then(() => {
      console.log(this.element)
      this.$EventBus.$emit('alert', { type: 1, value: `Successfully updated element from '${value}' to '${this.value}'.` })
      this.$EventBus.$emit('refresh_elements')
      this.editing = false
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
        this.old_value = value
        this.value = value
        this.element.value = value
        this.$EventBus.$emit('alert', { type: 3, value: 'Unable to update element. Duplicate entry.' })
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error updating the element. Please try again later.' })
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

    // Clear error
    this.error = false

    // Check if empty value
    if (this.value === '') {
      this.error = true
      this.$EventBus.$emit('alert', { type: 3, value: 'A value must be entered. The field cannot be empty.' })
      return false
    }

    // Validate different element types
    let valid = false

    if (this.element.type === 'URL') {

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

    } else if (this.element.type === 'Domain' || this.element.type === 'DOMAIN') {

      // Create regular expression for domains.
      const domain = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/
      const domain_regex = new RegExp(domain)

      // Check if value valid
      valid = domain_regex.test(this.value)

    } else if (this.element.type === 'IP') {

      // Create regular expression for IP addresses
      const ip = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/
      const ip_regex = new RegExp(ip)

      valid = ip_regex.test(this.value)

    } else if (this.element.type === 'RANGE') {

      // Create regular expression for IP addresses
      const ip = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/
      const ip_regex = new RegExp(ip)

      valid = ip_regex.test(this.from) && ip_regex.test(this.to)

    }

    // Check if IP range and if valid range.
    if (this.element.type === 'RANGE' && valid) {
      valid = this.from < this.to
    }

    // Send out alert if invalid.
    if (!valid) {
      this.error = true
      this.$EventBus.$emit('alert', { type: 3, value: `The value entered must be a valid '${this.element.type}'.` })
    }

    return valid
  }

  /**
   * Move element between blocklist and
   * safelist. Updates the safe flag in
   * the database.
   */
  move_element() {

    // Toggle element safe value.
    this.element.safe = !this.element.safe

    // Send request to move element.
    const url = '/api/elements'
    Vue.axios.put(url, JSON.stringify(this.element)).then(() => {
      this.$EventBus.$emit('alert', { type: 1, value: 'Successfully moved element.' })
      this.$EventBus.$emit('refresh_elements')
      this.editing = false
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
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error moving the element between the lists. Please try again later.' })
      }
    })

  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.controls {
  float: right;
}

.delete-button {
  margin: 0 0 0 1em;
}

button {
  padding: 1em 1.5em;
  float: left;
  background-color: $main;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: $quatenary;
  cursor: auto;
}

input {
  background-color: $secondary;
  border: none;
  padding: 1.5em 1.25em;
  max-width: 12em;
}

input:hover {
  background-color: $quatenary;
}

.odd-input {
  background-color: #FFFFFF !important;
}

.error {
  border: 1px solid $red;
  background-color: $red3 !important;
}

.move-button {
  margin: 0 1em 0 0;
}

.element-value {
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.element-value-range {
  max-width: 12em;
}

.element-type {
  text-transform: uppercase;
}

.from-to {
  width: 12em;
}

.from-to:nth-child(1) {
  margin: 0 0 0.5em 0;
}

</style>
