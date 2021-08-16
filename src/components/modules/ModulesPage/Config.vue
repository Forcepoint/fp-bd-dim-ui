<template>
  <transition name="fade-height" mode="out-in">

    <div class="config-panel" v-if="config_visible">

      <!-- Config Panel - Module Details -->
      <div class="details">
        <span class="details-title">{{ module.module_display_name }}</span>
        <p class="details-desc">{{ module.module_description }}</p>
        <div v-for="(field, index) in info" :key="index">
          <Field :field="field" :module="module" />
        </div>
      </div>

      <!-- Config Panel - Fields -->
      <div class="fields" v-if="fields.length > 0">

        <!-- Fields -->
        <div v-for="(field, index) in fields" :key="index">
          <Field :field="field" :module="module" :ref="'input'+index" />
        </div>

        <!-- Submit -->
        <button @click="submit_config" class="submit" v-if="module.configurable">Submit</button>
        <button @click="config_visible = !config_visible" class="submit" v-else>Close</button>
      </div>

      <!-- Config Panel - No Fields -->
      <div class="fields" v-else>
        <p>No configuration available for this module.</p>
      </div>

      <div class="clear"></div>
    </div>

  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Field as FieldData } from '@/components/dataclasses/Field'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'
import Alert from '@/components/modules/Global/Alert.vue'
import Field from '@/components/modules/ModulesPage/Field.vue'

@Component({
  components: {
    Alert,
    Field
  }
})
export default class Config extends Vue {
  @Prop(ConnectedModule) module!: ConnectedModule
  @Prop(String) icon!: string
  @Prop(Number) index!: number

  loading = false
  config_visible = false

  // Store fields returned
  info: FieldData[] = []
  fields: FieldData[] = []

  /**
   * Upon being mounted load the configuration
   * for the currently selected module.
   */
  mounted() {
    this.retrieve_fields()
    this.$EventBus.$on('show_config', this.show)
  }

  /**
   * Retrieve fields for form.
   */
  retrieve_fields() {

    // Build and send request for config.
    const url = `/api${this.module.module_route}/config`
    Vue.axios.get(url).then(response => {
      if (response.data.fields === null) {
        return
      }
      response.data.fields.forEach(entry => {
        const field = new FieldData(
          entry.label,
          entry.type,
          entry.expected_json_name,
          entry.rationale,
          entry.value,
          entry.possible_values,
          entry.required
        )
        if (field.type === 7) {
          this.info.push(field)
        } else {
          this.fields.push(field)
        }
      })
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error retrieving the configuration fields. Please try again later.' })
      }
    })
  }

  /**
   * On clicking submit button, build json response and post.
   */
  submit_config() {

    // Send file upload event. If file field present, file is uploaded.
    this.$EventBus.$emit('upload_file')

    // Build config to be posted.
    const config = { values: {} }
    Object.keys(this.$refs).forEach(ref => {
      const reference = this.$refs[ref]
      if (reference === undefined) {
        return
      }
      const child = reference[0].$refs
      Object.keys(child).forEach(child_ref => {
        if (child_ref !== 'filedata') {
          config.values[child_ref] = child[child_ref].value
        }
      })
    })

    // Verify configuration is entered.
    if (!this.verify_config(config.values)) {
      return
    }

    // Post config to config endpoint.
    const url = `/api${this.module.module_route}/config`
    Vue.axios.post(url, JSON.stringify(config)).then(() => {
      this.$EventBus.$emit('refresh_modules')
      this.$EventBus.$emit('alert', { type: 1, value: `Successfully updated the configuration for the ${this.module.module_display_name} module.` })
    }).catch((error) => {
      if (error.response.status === 400) {
        this.$EventBus.$emit('alert', { type: 3, value: error.response.data })
      } else if (error.response.status === 401) {
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error submitting the configuration. Please try again later.' })
      }
    })
  }

  /**
   * Show configuration for module on click.
   */
  show(module: string) {
    if (this.module.module_service_name === module) {
      this.config_visible = !this.config_visible
    }
  }

  /**
   * Verify that all fields which are
   * required have values.
   */
  verify_config(config: Record<string, string>) {
    let valid = true
    console.log(config)
    this.fields.forEach((field) => {

      // Check if value entered.
      if (field.required && field.type !== 7) {
        if (config[field.expected_json_name] === '' || config[field.expected_json_name] === undefined) {
          this.$EventBus.$emit('alert', { type: 2, value: `Please enter a value in all required fields. The '${field.label}' field has not been entered.` })
          valid = false
          return null
        }
      }

      // Check if in valid range.
      const min = field.possible_values && field.possible_values.length >= 2 ? field.possible_values[0] : 0
      const max = field.possible_values && field.possible_values.length >= 2 ? field.possible_values[1] : 100000
      if (field.type === 4) {
        const value = parseInt(config[field.expected_json_name])
        if (value < min || value > max) {
          this.$EventBus.$emit('alert', { type: 2, value: `Please enter a value in the '${field.label}' between ${min} and ${max}.` })
          valid = false
          return null
        }
      }

      // Check if in possible values.
      if (field.type === 2 || field.type === 3) {
        if (!field.possible_values.includes(config[field.expected_json_name])) {
          this.$EventBus.$emit('alert', { type: 2, value: `Please select a valid value for the '${field.label}' field.` })
          valid = false
          return null
        }
      }

    })
    return valid
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.details {
  width: 30%;
  float: left;
  box-sizing: border-box;
  padding: 0 1.5em 0 0;
}

.details img {
  width: 100%;
}

.fields {
  width: 70%;
  float: left;
  box-sizing: border-box;
  padding: 0 0 0 1.5em;
  border-left: 1px solid $secondary;
}

.details-title {
  font-size: 1.5em;
  color: $main;
  border-bottom: 1px solid $secondary;
  padding: 0.4em 0 0.4em 0;
  margin: 0 0 0.4em 0;
  display: block;
}

.details-desc {
  font-size: 0.9em;
  line-height: 1.4em;
}

.fields p {
  font-size: 0.9em;
  line-height: 1.4em;
}

.submit {
  padding: 1em 1.5em;
  float: right;
  background-color: $main;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit:hover {
  background-color: black;
}

.config-panel {
  border: 1px solid $secondary;
  box-sizing: border-box;
  padding: 1em 1.5em 1.5em 1.5em;
  margin: 0 0 1em 0;
}

// Transition effects.
.fade-height-enter-active,
.fade-height-leave-active {
  transition: all 0.4s;
  max-height: auto;
}
.fade-height-enter,
.fade-height-leave-to
{
  opacity: 0;
  max-height: 0px;
}

</style>
