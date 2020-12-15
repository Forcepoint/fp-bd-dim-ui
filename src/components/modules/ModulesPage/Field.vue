<template>
  <span class="field" :class="{'form': field.type != 7}">

    <!-- Field Label -->
    <label :for="field.expected_json_name" :class="{'label-dropdown': field.type == 2, 'label-radio': field.type == 3}" v-if="field.type !== 7">{{ field.label }}</label>
    <p class="rationale" v-if="field.type != 7">{{ field.rationale }}</p>

    <!-- Field - Text -->
    <input type="text" v-model="field.value" :id="field.expected_json_name" :placeholder="field.label" :ref="field.expected_json_name" v-if="field.type == 1" />

    <!-- Field - Select -->
    <v-select :label="field.label" v-model="field.value" :ref="field.expected_json_name" :options="field.possible_values" v-else-if="field.type == 2" class="config-select" />

    <!-- Field - Radio Buttons -->
    <div class="field-radio-buttons" v-else-if="field.type == 3">
      <span v-for="(value, index) in field.possible_values" :key="index" class="config-radio-field">
        <label :for="field.expected_json_name">{{ value }}</label>
        <input :label="field.label" type="radio" :id="field.expected_json_name" :name="field.expected_json_name" :value="field.value" :ref="field.expected_json_name" class="config-radio">
      </span>
    </div>

    <!-- Field - Number -->
    <input type="number" v-model="field.value" :id="field.expected_json_name" :placeholder="field.label" :min="field.possible_values && field.possible_values.length >= 2 ? field.possible_values[0] : 0" :max="field.possible_values && field.possible_values.length >= 2 ? field.possible_values[1] : 1000000" :ref="field.expected_json_name" v-else-if="field.type == 4">

    <!-- Field - Password -->
    <input type="password" v-model="field.value" :id="field.expected_json_name" :placeholder="field.label" :ref="field.expected_json_name" v-else-if="field.type == 5">

    <!-- Field - Disabled -->
    <input type="text" v-model="field.value" :placeholder="field.label" v-else-if="field.type == 6" disabled>

    <!-- Field - Requirements -->
    <div class="info-field" v-else-if="field.type == 7">
      <h2 class="requirements-title">{{ field.label }}</h2>
      <pre>{{ field.rationale }}</pre>
      <a :href="field.value">{{ field.value }}</a>
    </div>

    <!-- Field - File Upload -->
    <div v-else-if="field.type == 8">
      <input type="file" ref="filedata" />
      <!-- <button class="upload-button" @click="upload_file">Upload</button> -->
    </div>

    <!-- Field - Textarea -->
    <textarea v-else-if="field.type == 9" :placeholder="field.label" v-model="field.value" :ref="field.expected_json_name">
    </textarea>

  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Field as FieldData } from '@/components/dataclasses/Field'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'

@Component
export default class Field extends Vue {
  @Prop(FieldData) field!: FieldData
  @Prop(ConnectedModule) module!: ConnectedModule

  /**
   * Mount event handler for file upload
   * event. Upload file to modules run
   * endpoint.
   */
  mounted() {
    this.$EventBus.$on('upload_file', this.upload_file)
  }

  /**
   * Handle file upload to run endpoint.
   * Run upon clicking Upload Button.
   */
  upload_file() {
    const files_field = this.$refs.filedata as HTMLInputElement
    if (files_field !== undefined && files_field.files !== null && files_field.files.length > 0) {
      const file = files_field.files[0]
      const form_data = new FormData()
      console.log(file)
      form_data.append('file', file, file.name)
      const url = `/api${this.module.module_route}/run`
      Vue.axios.post(url, form_data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(response => {
        console.log(response)
      })
    }
  }

}

</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.field {
  width: 100%;
  line-height: 1.4em;
  box-sizing: border-box;
  display: block;
  margin: 1em 0 1em 0;
  float: left;
}

.form {
  border-bottom: 1px solid $secondary;
  padding: 0 0 1.5em 0;
}

.field label {
  font-size: 1em;
  line-height: 1.4em;
  font-weight: 700;
  margin: 0 0 0.5em 0;
  display: block;
  color: $main;
}

.field input, textarea {
  background-color: $secondary;
  border: none;
  padding: 1.25em;
  width: calc(100% - 3em);
  position: relative;

}

textarea {
  min-height: 10em;
}

.field input:hover, textarea:hover {
  background-color: $quatenary;
}

.config-select {
  width: 15em;
  line-height: 2em;
  background-color: $secondary;
  border: none !important;
  float: left;
}

.label-dropdown {
  float: left;
  position: relative;
  top: 1em;
}

.label-radio {
  float: left;
  position: relative;
}

.field-radio-buttons {
  float: left;
}

.config-radio-field {
  float: left;
}

.config-radio-field label {
  float: left;
  position: relative;
}

.config-radio-field input {
  float: left;
  position: relative;
  left: -1em;
  top: 0.25em;
}

.info-field a {
  color: $main;
}

.info-field a:hover, a:visited {
  color: #000000;
}

.info-field h2 {
  font-size: 1.2em;
  font-weight: 100;
  border-bottom: 1px solid $secondary;
  box-sizing: border-box;
  padding: 0 0 0.5em 0;
  margin:  0 0 0.5em 0;
}

.info-field p {
  display: block;
  margin: 0 0 0.5em 0;
}

pre {
  font-family: inherit;
  white-space: pre-line;
  font-size: 0.9em;
}

.upload-button {
  padding: 1em 1.5em;
  float: right;
  background-color: $main;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  top: -3.6em;
  right: 1em;
}

.upload-button:hover {
  background-color: black;
}

.requirements-title {
  color: $main;
}

.rationale {
  margin: 0 0 0.75em 0;
}

</style>
