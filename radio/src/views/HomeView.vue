<template>
  <div class="radio-wrapper">
    <v-container>
      <h1 style="color: white;">Radio</h1>
      <br>
      <!-- Search bar -->
      <v-text-field v-model="search" label="Cerca" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details
        single-line @input="filterRadios"></v-text-field>

      <v-row>
        <v-col v-for="(radio, index) in filteredRadios" :key="index" cols="12" sm="6" md="4">
          <v-card :class="['radio-card', { 'playing': radio.isPlaying }]">
            <v-row no-gutters>
              <v-col cols="8">
                <v-card-title>{{ radio.name }}</v-card-title>
                <v-card-text>
                  <!-- Add other radio details if necessary -->
                  <p>{{ radio.tags }}</p>
                  <p>{{ radio.country }}</p>

                  <div class="text-center align-end"
                    style="position: absolute; bottom: 0; width: 60%; margin-bottom: 30px;">


                    <!--Bottone preferiti-->
                    <v-btn icon @click="toggleFavorite(radio)" :color="isFavorite(radio) ? 'red' : ''"
                      style="margin-right: 5px;">
                      <v-icon v-if="isFavorite(radio)" :color="radio.isPlaying ? 'white' : ''">mdi-heart</v-icon>
                      <v-icon v-else>mdi-heart-outline</v-icon>
                    </v-btn>

                    <!--bottone pause-->
                    <!-- Bottone play -->

                    <div style="display: inline-block; position: relative;">
                      <v-btn icon @click="togglePlayPause(radio)" :color="radio.isPlaying ? '' : ''"
                        style="margin-right: 5px;">
                        <v-icon>{{ radio.isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                      </v-btn>

                      <!-- GIF accanto al bottone play (solo quando è in riproduzione) -->
                      <v-img v-if="radio.isPlaying" src="/musica-music.gif" class="d-inline-block"
                        style="position: absolute; right: -70px; top: 0;" width="100"></v-img>
                    </div>

                    <v-btn icon class="google-maps-btn" @click="openGoogleMaps"
                      style="margin-right: 5px;">
                      <v-icon>mdi-map</v-icon>
                    </v-btn>

                    <!--<v-btn icon @click="stopRadio(radio)" :color="isPlaying(radio) ? 'blue' : ''">
                      <v-icon>mdi-stop</v-icon>
                    </v-btn>-->

                  </div>


                </v-card-text>
              </v-col>
              <v-col cols="4">
                <a :href="radio.homepage" target="_blank">
                  <v-img :src="getFaviconUrl(radio)" aspect-ratio="1/1" style="margin: 10px;"></v-img>
                </a>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Hidden video player for playing the radio stream -->
      <video ref="videoPlayer" @ended="stopRadio" style="display: none;"></video>
    </v-container>
  </div>
</template>

<script>
//import axios from 'axios';
import Hls from 'hls.js';

export default {
  name: 'HomeView',
  data() {
    return {
      radios: [],
      filteredRadios: [],
      search: '',
      currentRadio: null,
      currentHlsInstance: null,
      favorites: [],
      audio: null,
      sheet: false,
      selectedRadio: null,
      videoOptions: {
        controls: true,
        autoplay: false,
        muted: false,
      }, // New property to store Shazam events
    }
  },
  methods: {
    getRadios() {
      fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
        .then(response => response.json())
        .then(data => {
          this.radios = data.map(radio => ({ ...radio, isPlaying: false }));
          this.filteredRadios = this.radios;
        });
    },
    getFaviconUrl(radio) {
      return radio.favicon || '/image.png';
    },
    playRadio(radio) {
      this.stopRadio();
      this.sheet = true;
      this.selectedRadio = radio;

      if (radio.url.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          if (this.currentHlsInstance) {
            this.currentHlsInstance.destroy();
          }
          const hls = new Hls();
          hls.loadSource(radio.url);
          hls.attachMedia(this.$refs.videoPlayer);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.$refs.videoPlayer.play();
            this.$refs.videoPlayer.classList.add('playing');
            radio.isPlaying = true;
          });
          this.currentHlsInstance = hls;
        } else if (this.$refs.videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
          this.$refs.videoPlayer.src = radio.url;
          this.$refs.videoPlayer.play();
          this.$refs.videoPlayer.classList.add('playing');
          radio.isPlaying = true;
        }
      } else {
        this.$refs.videoPlayer.src = radio.url;
        this.$refs.videoPlayer.play();
        this.$refs.videoPlayer.classList.add('playing');
        radio.isPlaying = true;
      }
      this.currentRadio = radio.url;
    },
    stopRadio() {
      const video = this.$refs.videoPlayer;
      video.pause();
      video.src = '';
      if (this.currentHlsInstance) {
        this.currentHlsInstance.detachMedia();
        this.currentHlsInstance.destroy();
        this.currentHlsInstance = null;
      }
      if (this.selectedRadio) {
        this.selectedRadio.isPlaying = false;
      }
      this.currentRadio = null;
      this.sheet = false;
      this.selectedRadio = null; // Imposta selectedRadio a null quando si ferma la radio
      this.$refs.videoPlayer.classList.remove('playing');
    },

    filterRadios() {
      if (!this.search) {
        this.filteredRadios = this.radios;
        return;
      }
      this.filteredRadios = this.radios.filter(radio => radio.name.toLowerCase().includes(this.search.toLowerCase()));
    },

    togglePlayPause(radio) {
      if (radio.isPlaying) {
        this.stopRadio();
      } else {
        this.playRadio(radio);

        // Aggiungi un listener per l'evento 'timeupdate' per controllare continuamente lo stato della riproduzione
        this.$refs.videoPlayer.addEventListener('timeupdate', () => {
          if (!radio.isPlaying) {
            this.$refs.videoPlayer.classList.remove('playing');
            radio.isPlaying = false;
          }
        });

        // Aggiungi un ascoltatore per l'evento 'ended' per rimuovere la classe 'playing' quando la riproduzione è terminata
        this.$refs.videoPlayer.addEventListener('ended', () => {
          this.$refs.videoPlayer.classList.remove('playing');
          radio.isPlaying = false;
        }, { once: true }); // Rimuove l'ascoltatore dopo il primo evento 'ended'
      }
    },

    toggleFavorite(radio) {
      const index = this.favorites.findIndex(fav => fav.url === radio.url);
      if (index !== -1) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(radio);
      }
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    isFavorite(radio) {
      return this.favorites.some(fav => fav.url === radio.url);
    },
  },



  created() {
    this.getRadios();
    const favorites = localStorage.getItem('favorites');
    this.favorites = favorites ? JSON.parse(favorites) : [];
  },
}
</script>

<style>
body {
  background-color: #1B3659;
}

.radio-wrapper {
  margin-right: 5%;
  margin-left: 5%;
  border-radius: 20px;
}

.v-text-field {
  margin-bottom: 20px;
  border-radius: 20px;
  border: none;
  background-color: white;
}

.v-text-field:hover {
  animation: alternate-reverse;
}

.radio-card {
  height: 185px;
}
</style>
