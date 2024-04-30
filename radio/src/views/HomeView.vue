<template>
  <div class="radio-wrapper">
    <v-container>
      <h1 style="color: white;">Radio</h1>
      <br>
      <!-- Search bar -->
      <v-text-field
        v-model="Cerca"
        label="Cerca"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
        @input="filterRadios"
      ></v-text-field>

      <v-row>
        <v-col v-for="(radio, index) in filteredRadios" :key="index" cols="12" sm="6" md="4">
          <v-card class="radio-card">
            <v-row no-gutters>
              <v-col cols="8">
                <v-card-title>{{ radio.name }}</v-card-title>
                <v-card-text>
                  <!-- Add other radio details if necessary -->
                  <p>{{ radio.codec }}</p>
                  <p>{{ radio.bitrate }}</p>
                </v-card-text>
              </v-col>
              <v-col cols="4">
                <a :href="radio.homepage" target="_blank">
                  <v-img :src="getFaviconUrl(radio)" aspect-ratio="1/1" style="margin: 10px;"></v-img>
                </a>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <div class="text-center align-end" style="position: absolute; bottom: 0; width: 100%; margin-bottom: 10px;">
                  <v-btn :style="{ marginRight: display.mdAndUp.value ? '5px' : '0' }" icon @click="togglePlayPause(radio)" :color="isPlaying(radio) ? 'blue' : ''">
                    <v-icon v-if="isPlaying(radio)">mdi-pause</v-icon>
                    <v-icon v-else>mdi-play</v-icon>
                  </v-btn>

                  <v-btn :style="{ marginLeft: display.mdAndUp.value ? '5px' : '0' }" icon @click="stopRadio" :color="isPlaying(radio) ? 'blue' : ''">
                    <v-icon>mdi-stop</v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useDisplay } from 'vuetify';
import Hls from 'hls.js';
import VueCoreVideoPlayer from 'vue-core-video-player';

export default {
  name: 'HomeView',
  components:{
    VueCoreVideoPlayer,
  },
  data() {
    return {
      radios: [],
      filteredRadios: [], // Add filteredRadios array
      search: '', // Add search property
      audio: null,
      sheet: false,
      selectedRadio: null
    }
  },
  methods: {
    getRadios() {
      fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
        .then(response => response.json())
        .then(data => {
          this.radios = data;
          this.filteredRadios = data; // Initialize filteredRadios with all radios
          console.log(data);
        });
    },
    getFaviconUrl(radio) {
      return radio.favicon || '/radio.png'; // Return the default image path if favicon is not available
    },
    playRadio(radio) {
      if (this.audio) 
      {
    this.stopRadio();
  }
  if (radio.hls === 1) {
        console.log('Using HLS player for M3U8 format');
        this.audio = null; // Remove existing audio element
        this.selectedRadio = radio; // Set the selected radio
        this.sheet = true; // Show the bottom sheet
      } else {
        console.log('Using <audio> element for other formats');
        this.audio = new Audio(radio.url_resolved);
        this.audio.play();
        this.sheet = true; // Show the bottom sheet
        this.selectedRadio = radio; // Set the selected radio
      }
    },

    
    stopRadio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
        this.sheet = false; // Deactivate bottom sheet when playback is stopped
      }
    },
    filterRadios() {
      if (!this.search) {
        this.filteredRadios = this.radios; // If search is empty, show all radios
        return;
      }
      this.filteredRadios = this.radios.filter(radio => radio.name.toLowerCase().includes(this.search.toLowerCase()));
    },
    togglePlayPause(radio) {
      if (this.isPlaying(radio)) {
        this.stopRadio();
      } else {
        this.playRadio(radio);
      }
    },
    isPlaying(radio) {
      return this.selectedRadio === radio && this.audio && !this.audio.paused;
    },
  },

  created() {
    this.getRadios();
  },
  setup() {
    const display = useDisplay();
    return { display };
  }
}
</script>


<style>
body{
  background-color: white;
}
.radio-wrapper {
  margin-left: 5%;
  margin-right: 5%;
  background: rgb(0, 110, 255);
  border-radius: 20px;
}

/* Modifica del background */
.v-text-field {
  margin-bottom: 20px;
  border-radius: 20px;
  border : none;
  background-color: white;
}

.v-text-field:hover{
  animation: none;
}

.radio-card {
  height : 170px;
}

</style>
