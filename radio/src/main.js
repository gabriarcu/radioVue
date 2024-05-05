import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


import '@mdi/font/css/materialdesignicons.css'


import 'video.js/dist/video-js.css'


import { VideoPlayer } from 'vue-hls-video-player'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi',
  }
})

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.use(VideoPlayer)

app.mount('#app')