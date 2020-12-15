<template>
  <div>
    <h2>Backup Elements</h2>
    <p class="desc">Backup of all elements stored into Dynamic Intelligence Manager is performed automatically on a weekly basis, and manual backups can also be taken when necessary.</p>
    <Alert :alert_title="'settings_alert_password'" />
    <div class="backup-schedule">
      <h3>Automated Backup</h3>
      <p>Use the menus to configure the weekly schedule of automated backups.</p>
      <span class="backup-field">
        <v-select label="day" v-model="day" :options="days" class="backup-select"></v-select>
        <v-select label="time" v-model="time" :options="times" class="backup-select"></v-select>
        <button @click="update_schedule" class="update-schedule">Update Schedule</button>
        <div style="clear: both;"></div>
      </span>
      <div style="clear: both;"></div>
    </div>
    <div class="backup-now">
      <h3>Manual Backup</h3>
      <p>Click the button to take a backup of the elements currently stored in the Dynamic Intelligence Manager.</p>
      <button @click="backup">Backup Now</button>
      <div style="clear: both;"></div>
    </div>
    <div class="backups">
      <h3>Restore Backups</h3>
      <p>Click the button to restore a backup: all elements currently stored will be replaced with the ones stored at backup time. Restoring a backup does not delete elements previously exported.</p>
      <table>
        <tr v-for="(backup, index) in backups" :key="index" class="backup-row">
          <td>{{ backup.type }}</td>
          <td>{{ backup.backup_date }}</td>
          <td>{{ backup.elements_count }} <span v-if="backup.elements_count > 1">Elements</span><span v-else>Element</span></td>
          <td><button @click="restore(backup.id)">Restore</button></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Backup } from '@/components/dataclasses/Backup'
import Alert from '@/components/modules/SettingsPage/Alert.vue'

@Component({
  components: {
    Alert
  }
})
export default class BackupElements extends Vue {

  backups: Backup[] = []

  // Data for select.

  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  times = [
    '00:00',
    '00:30',
    '01:00',
    '01:30',
    '02:00',
    '02:30',
    '03:00',
    '03:30',
    '04:00',
    '04:30',
    '05:00',
    '05:30',
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
    '22:30',
    '23:00',
    '23:30'
  ]

  day = this.days[0]
  time = this.times[0]

  /**
   * Load backups and register event handler.
   */
  mounted() {
    this.load_backups()
    this.$EventBus.$on('refresh', this.load_backups)
  }

  /**
   * Retrieve array of backups from controller.
   */
  load_backups() {
    this.backups = []
    const url = '/api/backup'
    Vue.axios.get(url).then((response) => {
      if (response.data === null) {
        return
      }
      response.data.history.forEach(backup => {
        const new_backup = new Backup(
          backup.hash,
          backup.message.split(' ')[0],
          backup.message.split(' : ')[0],
          backup.message.split(' : ')[1].replace('Elements', '')
        )
        this.backups.push(new_backup)
      })
      if (response.data.schedule.time !== '') {
        this.time = response.data.schedule.time
      }
      if (response.data.schedule.day !== '') {
        this.day = response.data.schedule.day
        this.day = this.day.charAt(0).toUpperCase() + this.day.slice(1)
      }
    })
  }

  /**
   * Send request to controller to backup elements table.
   */
  backup() {
    const data = {
      cmd: 'backup',
      hash: ''
    }
    const url = '/api/backup'
    Vue.axios.post(url, JSON.stringify(data)).then(() => {
      // this.$EventBus.$emit('alert', { type: 1, value: 'Successfully sent request to backup Dynamic Intelligence Manager.' })
    })
  }

  /**
   * Restore elements table to version with given hash.
   */
  restore(hash: string) {
    const data = {
      cmd: 'restore',
      hash: hash
    }
    const url = '/api/backup'
    Vue.axios.post(url, JSON.stringify(data)).then(() => {
      // this.$EventBus.$emit('alert', { type: 1, value: 'Successfully sent request to restore Dynamic Intelligence Manager.' })
    })
  }

  /*
   * Set update schedule for automated backups.
   */
  update_schedule() {
    const data = {
      day: this.day.toLowerCase(),
      time: this.time
    }
    const url = '/api/backup'
    Vue.axios.put(url, data).then((response) => {
      console.log(response)
      this.$EventBus.$emit('alert', { type: 1, value: 'Successfully updated the backup schedule.' })
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error while updating the backup schedule. Please try again later.' })
      }
    })
  }

}
</script>

<style lang="scss" scoped>

@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
@import '../../../scss/variables.scss';

.desc {
  line-height: 1.5em;
  margin: 0 0 1.5em 0;
  padding: 0 0 1em 0;
  border-bottom: 1px solid $secondary;
}

h2, h3 {
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  color: $main;
  margin: 0 0 0.5em 0;
}

h3 {
  width: 100%;
  border-bottom: 1px solid $secondary;
  padding: 0 0 1em 0;
  margin: 0 0 1em 0;
}

input {
  width: 65%;
  background-color: $secondary;
  border: none;
  margin: 0 0 1.5em 0;
  padding: 1.3em 1.25em;
  float: left;
}

.backup-field {
  width: 100%;
  float: left;
  margin: 0 0 1em 0;
}

input:hover {
  background-color: $quatenary;
}

.backup-schedule {
  border-bottom: 1px solid $secondary;
  margin: 0 0 1.5em 0;
}

button {
  padding: 1em;
  background: $main;
  border: none;
  border-radius: 2px;
  color: #FFFFFF;
  cursor: pointer;
}

button:hover {
  background-color: black;
}

.backup-schedule p {
  margin: 0 0 1em 0;
}

.backup-now, .backups {
  padding: 0 0 1em 0;
  border-bottom: 1px solid $secondary;
  margin: 0 0 1em 0;
}

.backup-now button {
  margin: 1em 0 0 0;
}

table {
  margin: 1em 0 0 0;
  display: table;
}

.backup-select {
  width: 35%;
  float: left;
  background-color: #f2f2f2;
  margin: 0 0.5em 0 0;
}

.update-schedule {
  float: left;
  width: calc(30% - 1.5em);
  padding: 1.175em;
}

</style>
