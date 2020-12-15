<template>
  <div>
    <div v-if="this.elements.length > 0">
      <font-awesome-icon icon="spinner" v-if="loading" spin></font-awesome-icon>
      <table class="elements-content">
        <tr>
          <th>Source</th>
          <th>Type</th>
          <th>Value</th>
          <th></th>
        </tr>
        <Element :element="element" :index="index" v-for="(element, index) in elements" :key="index" :type="type" @refresh_elements="refresh_elements" class="list-element" />
      </table>
      <paginate
      v-model="this.selected_page"
      :page-count="page_count"
      :container-class="'pagination'"
      :page-class="'page'"
      :click-handler="retrieve_elements">
      </paginate>
      <div class="clear" />
    </div>
    <div class="panel-empty" v-else>
      <h2>No elements found.</h2><p>Please import elements into the Dynamic Intelligence Manager</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Element as ElementData } from '@/components/dataclasses/Element'
import Element from '@/components/modules/ElementsPage/Element.vue'

@Component({
  components: {
    Element
  }
})
export default class Results extends Vue {
  @Prop({ default: '' }) search_term!: string
  @Prop({ default: '' }) module!: string
  @Prop(String) type!: string

  loading = false
  page_count = 0
  selected_page = 1

  // Store elements returned
  elements: ElementData[] = []

  /**
   * Upon being mounted load the array of elements.
   */
  mounted() {
    this.retrieve_elements(this.selected_page)
    this.$EventBus.$on('refresh_elements', () => {
      this.retrieve_elements(1)
    })
  }

  /**
   * Retrieve elements.
   */
  retrieve_elements(page: number) {

    this.loading = true

    // Clear elements and update selected page
    this.selected_page = page
    this.elements.length = 0

    // Build and send request for elements.
    let url = `/api/elements?pageSize=20&page=${this.selected_page}&safeList=${this.type === 'Safelist'}`
    if (this.search_term !== '') {
      url = `${url}&searchterm=${this.search_term}`
    }
    if (this.module !== '') {
      url = `${url}&module=${this.module}`
    }

    // Send request
    Vue.axios.get(url).then(response => {
      // If no data in response.
      if (response.data.elements === null) {
        return
      }

      // Update page count
      this.page_count = response.data.total_page_count

      // If elements in response.
      response.data.elements.forEach(element => {
        const field = new ElementData(
          element.id,
          element.created_at,
          element.updated_at,
          element.deleted_at,
          element.source,
          element.service_name,
          element.type,
          element.value,
          element.batch_number,
          element.safe
        )
        this.elements.push(field)
      })
      this.loading = false
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
      }
    })
  }

  /**
   * Reload elements in table in response
   * to event in child components.
   */
  refresh_elements() {
    this.retrieve_elements(this.selected_page)
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.elements-content {
  display: table;
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

.edit-button, .delete-button {
  display: block;
}

.delete-button {
  margin-right: 1em;
  float: right;
}

</style>
