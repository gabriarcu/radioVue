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
          <v-card class="radio-card">
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
                    <v-btn :style="{ marginRight: display.mdAndUp.value ? '10px' : '0' }" icon
                      @click="toggleFavorite(radio)" :color="isFavorite(radio) ? 'red' : ''">
                      <v-icon v-if="isFavorite(radio)" :color="isPlaying(radio) ? 'white' : ''">mdi-heart</v-icon>
                      <v-icon v-else>mdi-heart-outline</v-icon>
                    </v-btn>


                    <!--bottone pause-->
                    <v-btn :style="{ marginRight: display.mdAndUp.value ? '5px' : '0' }" icon
                      @click="togglePlayPause(radio)" :color="isPlaying(radio) ? 'blue' : ''">
                      <v-icon v-if="isPlaying(radio)">mdi-pause</v-icon>
                      <v-icon v-else>mdi-play</v-icon>
                    </v-btn>

                    <!--Bottne stop-->
                    <v-btn :style="{ marginLeft: display.mdAndUp.value ? '5px' : '0' }" icon @click="stopRadio"
                      :color="isPlaying(radio) ? 'blue' : ''">
                      <v-icon>mdi-stop</v-icon>
                    </v-btn>

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



    </v-container>
  </div>
</template>

<script>
import { useDisplay } from 'vuetify';

export default {
  name: 'HomeView',
  data() {
    return {
      radios: [],
      filteredRadios: [],
      search: '',
      audio: null,
      sheet: false,
      selectedRadio: null,
      favorites: [], // Aggiunto per gestire i preferiti
    }
  },
  methods: {
    getRadios() {
      fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
        .then(response => response.json())
        .then(data => {
          this.radios = data;
          this.filteredRadios = data;
        });
    },
    getFaviconUrl(radio) {
      return radio.favicon || '/radio.png';
    },
    playRadio(radio) {
      if (this.audio) {
        this.stopRadio();
      }
      console.log('Using <audio> element for MP3 format');
      this.audio = new Audio(radio.url_resolved);
      this.audio.play();
      this.sheet = true;
      this.selectedRadio = radio;
    },
    stopRadio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
        this.sheet = false;
      }
    },
    filterRadios() {
      if (!this.search) {
        this.filteredRadios = this.radios;
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
  setup() {
    const display = useDisplay();
    return { display };
  }
}
</script>

<style>
body {
  background-color: white;
}

.radio-wrapper {
  margin-left: 5%;
  margin-right: 5%;
  background: rgb(0, 110, 255);
  border-radius: 20px;
}

.v-text-field {
  margin-bottom: 20px;
  border-radius: 20px;
  border: none;
  background-color: white;
}

.v-text-field:hover {
  animation: none;
}

.radio-card {
  height: 170px;
}
</style>
