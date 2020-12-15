<template>
  <div id="main">
    <div class="panel">

      <!-- Panel Header -->
      <div class="panel-header">
        <h2>Settings</h2>
      </div>

      <!-- Panel Content -->
      <div class="panel-content">
        <ul class="settings-menu">
          <li v-for="(panel, index) in panels" :key="index" @click="selected_panel = index" :class="{'active': selected_panel == index}">{{ panel.name }}</li>
        </ul>
        <div class="settings-component">
          <component :is="panels[selected_panel].component" />
        </div>
        <div class="clear"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BackupElements from '@/components/modules/SettingsPage/BackupElements.vue'
import ChangePassword from '@/components/modules/SettingsPage/ChangePassword.vue'
import UserAccounts from '@/components/modules/SettingsPage/UserAccounts.vue'
import RegistrationToken from '@/components/modules/SettingsPage/RegistrationToken.vue'

@Component({
  components: {
    BackupElements,
    ChangePassword,
    UserAccounts,
    RegistrationToken
  }
})
export default class Settings extends Vue {

  selected_panel = 0
  panels = [
    { name: 'Backup Elements', component: BackupElements },
    { name: 'Change Password', component: ChangePassword },
    { name: 'User Accounts', component: UserAccounts },
    { name: 'Registration Token', component: RegistrationToken }
  ]

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.settings-menu {
  width: 25%;
  float: left;
  list-style: none;
  box-sizing: border-box;
  padding: 0 1em 0 0;
}

.settings-menu li {
  box-sizing: border-box;
  padding: 1em;
  background: $main;
  cursor: pointer;
  margin: 0 0 0.5em 0;
  border-radius: 3px;
  color: #FFFFFF;
}

.settings-menu li:hover {
  background: #000000;
}

.settings-component {
  width: 75%;
  float: left;
  box-sizing: border-box;
  padding: 0 0 0 1em;
  border-left: 1px solid $secondary;
}

.icon {
  position: relative;
  margin: 0 0 0 0.5em;
}

.active {
  background-color: #000000 !important;
}

</style>
