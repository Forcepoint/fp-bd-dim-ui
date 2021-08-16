<template>
  <div class="bottom-margin">
    <div class="market-module">
      <div class="module">
        <img :src="module.icon_url" />
        <div class="module-details">
          <h2 class="title">{{ module.name }}</h2>
          <ul class="tags">
            <li v-for="(type, index) in module.accepted_data_types" :key="index">{{ data_types[type] }}</li>
          </ul>
        </div>
        <div class="clear" />
      </div>
      <div class="controls">
        <button @click="active = !active"><font-awesome-icon icon="info-circle" class="control-icon"></font-awesome-icon>Info</button>
        <button v-if="installed" disabled><font-awesome-icon icon="check" class="control-icon"></font-awesome-icon>Installed</button>
        <button disabled v-else-if="installing"><font-awesome-icon icon="spinner" spin></font-awesome-icon></button>
        <button @click="install()" v-else class="install"><font-awesome-icon icon="download" class="control-icon"></font-awesome-icon>Install</button>
      </div>
      <transition name="fade">
        <div class="module-description" v-if="active">
          <p>{{ module.description }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { CatalogModule as CatalogModuleData } from '@/components/dataclasses/CatalogModule'

@Component
export default class CatalogModule extends Vue {
  @Prop(CatalogModuleData) module!: CatalogModuleData
  @Prop(Boolean) installed!: boolean

  // State flags.
  active = false
  installing = false

  // Tag data types.
  data_types = {
    IP: 'IP Addresses',
    RANGE: 'IP Ranges',
    URL: 'URLs',
    DOMAIN: 'Domains',
    SNORT: 'Snort Rules'
  }

  /**
   * Send request to docker controller to
   * install the module selected.
   */
  install() {
    const url = '/api/docker'
    const modules = { containers: [this.module] }
    this.installing = true
    Vue.axios.post(url, JSON.stringify(modules)).then(() => {
      this.$EventBus.$emit('alert', { type: 1, value: `Successfully sent request to install module '${this.module.name}'.` })
    }).catch(() => {
      this.$EventBus.$emit('alert', { type: 3, value: `There was an error sending the request to install module '${this.module.name}'.` })
    })
  }
}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.module {
  background-color: #F2F2F2;
  box-sizing: border-box;
  padding: 1em;
  width: 100%;
}

.bottom-margin {
  margin: 0 0 1em 0;
}

.module:nth-child(odd) {
  margin: 0 1em 1em 0;
}

.module img {
  height: 6em;
  width: 6em;
  float: left;
}

.module-details {
  float: left;
  position: relative;
  margin: 1.4em 0 0 1.5em;
  overflow: hidden;
  width: 16em;
}

.title {
  float: left;
  position: relative;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1.3em;
  color: $main;
  font-weight: normal;
  width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  list-style: none;
  margin: 0 0 1em 0;
  display: block;
}

.tags li {
  font-size: 12px;
  color: #FFFFFF;
  background-color: $green1;
  box-sizing: border-box;
  padding: 0.2em;
  border-radius: 2px;
  float: left;
  margin: 0 0.25em 0 0;
}

.controls {
  width: 100%;
  float: left;
  background: $quatenary;
  margin: -1em 0 0 0;
}

.controls button {
  width: 50%;
  background: $main;
  color: #FFFFFF;
  border: none;
  box-sizing: border-box;
  padding: 1em 1em;
}

.controls button:hover {
  background: #000000;
  cursor: pointer;
}

.control-icon {
  font-size: 1em;
  text-align: left;
  margin: 0 0.5em 0 0;
}

.module-description {
  padding: 1em;
  background-color: $quatenary;
  margin: 2.75em 0 0 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.market-module {
  margin: 0 0 3em 0;
}

</style>
