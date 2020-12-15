<template>
  <div v-if="type_array(type).length > 0" class="modules">
    <h2>{{ status_type }} Modules</h2>
    <div class="right-column">
      <Module :module="module" class="module-margin" v-for="(module, index) in column_array(true)" :installed="status_type == 'Installed'" :key="index" />
    </div>
    <div class="left-column">
      <Module :module="module" class="module-margin" v-for="(module, index) in column_array(false)" :installed="status_type == 'Installed'" :key="index * 200" />
    </div>
    <div style="clear: both;"></div>
  </div>
  <div v-else>
    <h2>{{ status_type }} Modules</h2>
    <p>All available modules are already installed.</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { CatalogModule } from '@/components/dataclasses/CatalogModule'
import Module from '@/components/modules/MarketplacePage/Module.vue'

@Component({
  components: {
    Module
  }
})
export default class Results extends Vue {
  @Prop({ type: Array, required: true }) modules!: CatalogModule[]
  @Prop(String) status_type!: string
  @Prop(String) type!: string

  /**
   * Filter the array of modules based on the type
   * of modules.
   */
  type_array(type: string) {
    let modules: CatalogModule[] = []
    if (type === 'Source Modules') {
      modules = this.modules.filter((module) => {
        return module.type === 'ingress'
      })
    } else {
      modules = this.modules.filter((module) => {
        return module.type === 'egress'
      })
    }
    return modules
  }

  /**
   * Returns the filtered array of modules based on
   * the required column.
   */
  column_array(right: boolean) {
    let modules: CatalogModule[] = []
    if (right) {
      modules = this.type_array(this.type).filter((module, index) => {
        return index % 2 === 0
      })
    } else {
      modules = this.type_array(this.type).filter((module, index) => {
        return index % 2 === 1
      })
    }
    return modules
  }
}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.left-column, .right-column {
  width: calc(50% - 0.5em);
  float: left;
}

.left-column {
  margin: 0 0 0 1em;
}

h2 {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0.5em 0 0.5em 0;
  color: $main;
  font-weight: 200;
  border-bottom: 1px solid $secondary;
  border-top: 1px solid $secondary;
  margin: 0 0 0.5em 0;
}

p {
  text-align: center;
  height: 7em;
  line-height: 7em;
  background: $secondary;
  margin: 0 0 0.5em 0;
}

.modules {
  padding: 0 0 1em 0;
}

</style>
