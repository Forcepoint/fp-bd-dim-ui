// Main Imports
import axios from 'axios'
import App from './App.vue'
import Paginate from 'vuejs-paginate'
import store from './store'
import vSelect from 'vue-select'
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'
import VueSimpleAlert from 'vue-simple-alert'
import './plugins/fontawesome'

// Page imports
import Marketplace from './components/pages/Marketplace.vue'
import Elements from './components/pages/Elements.vue'
import Export from './components/pages/Export.vue'
import Home from './components/pages/Home.vue'
import Ingest from './components/pages/Ingest.vue'
import Login from './components/pages/Login.vue'
import Logs from './components/pages/Logs.vue'
import Settings from './components/pages/Settings.vue'

// Register components and modules
Vue.use(VueApexCharts)
Vue.use(VueAxios, axios)
Vue.use(VueRouter)
Vue.use(VueSimpleAlert)
Vue.component('apexchart', VueApexCharts)
Vue.component('paginate', Paginate)
Vue.component('v-select', vSelect)

// Register Pages
Vue.component('Marketplace', Marketplace)
Vue.component('Elements', Elements)
Vue.component('Export', Export)
Vue.component('Home', Home)
Vue.component('Ingest', Ingest)
Vue.component('Login', Login)
Vue.component('Logs', Logs)
Vue.component('Settings', Settings)

Vue.config.productionTip = false

// Store global defaults
Vue.prototype.$EventBus = new Vue()

// Define routes
const routes = [
  // Private Pages
  { path: '/', name: 'Home', component: Home, public: false },
  { path: '/ingress', name: 'Intelligence Sources', component: Ingest, public: false },
  { path: '/egress', name: 'Intelligence Export', component: Export, public: false },
  { path: '/elements', name: 'Elements', component: Elements, public: false },
  { path: '/logs', name: 'Logs', component: Logs, public: false },
  { path: '/marketplace', name: 'Marketplace', component: Marketplace, public: false },
  { path: '/settings', name: 'Settings', component: Settings, public: false },
  // Public Pages
  { path: '/login', name: 'Login', component: Login, public: true }
]

// Create router for pages and apps.
const router = new VueRouter({
  routes
})

// Set global base URL for requests
if (process.env.NODE_ENV === 'development') {
  Vue.prototype.$RegistrationToken = ''
  Vue.axios.defaults.baseURL = 'http://localhost:8080'
}

// Handle Authentication check before each page.
router.beforeEach((to, from, next) => {

  // Public Pages and wheter current page is public.
  const public_pages = ['/login']
  const auth_required = !public_pages.includes(to.path)

  // Retrieve user token from storage and retrieval time.
  const token = localStorage.getItem('token')

  // If user hasn't logged in and auth required.
  if (auth_required && !token) {
    return next('/login')
  }

  // Set global token for requests.
  Vue.axios.defaults.headers.common = {
    'x-access-token': localStorage.getItem('token')
  }

  next()
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
