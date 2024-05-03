<template>
  <div class="radio-wrapper">
    <v-container>
      <h1 style="color: white;">Preferiti🌟</h1>
      <br>
      <!-- Search bar -->
      <v-text-field v-model="search" label="Cerca" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details
        single-line @input="filterFavorites"></v-text-field>

      <v-row>
        <v-col v-for="(favorite, index) in filteredFavorites" :key="index" cols="12" sm="6" md="4">
          <v-card class="radio-card" :class="{ 'active-radio': index === activeRadioIndex }">
            <v-row no-gutters>
              <v-col cols="8">
                <v-card-title>{{ favorite.name }}</v-card-title>
                <!-- Add other radio details if necessary -->
                <v-card-text>
                  <p>{{ favorite.tags }}</p>
                  <p>{{ favorite.country }}</p>
                  <div class="text-center align-end"
                    style="position: absolute; bottom: 0; width: 60%; margin-bottom: 30px;">
                    <!-- Button for favorites -->
                    <v-btn :style="{ marginRight: display && display.mdAndUp.value ? '5px' : '0' }" icon
                      @click="removeFromFavorites(index)" color="error">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>

                    <v-btn :style="{ margin: '0 5px' }" icon @click="togglePlayPause(favorite, index)">
                      <v-icon v-if="isPlaying(favorite)">mdi-pause</v-icon>
                      <v-icon v-else>mdi-play</v-icon>
                    </v-btn>


                    <v-img v-if="isPlaying(favorite)" src="/musica-music.gif" class="d-inline-block"
                      style="position: absolute; right: -60px; top: 0;" width="100"></v-img>


                    <!--<v-btn :style="{ marginLeft: display && display.mdAndUp.value ? '5px' : '0' }" icon
                      @click="stopRadio(favorite)" :color="isPlaying(favorite) ? 'blue' : ''">
                      <v-icon>mdi-stop</v-icon>
                    </v-btn>-->



                  </div>
                </v-card-text>
              </v-col>
              <v-col cols="4">
                <a :href="favorite.homepage" target="_blank">
                  <v-img :src="favorite.favicon ? getFaviconUrl(favorite) : '/default_favicon.png'" aspect-ratio="1/1"
                    style="margin: 10px;"></v-img>
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
import Hls from 'hls.js';

export default {
  name: 'FavoritesPage',
  data() {
    return {
      favorites: JSON.parse(localStorage.getItem('favorites')) || [],
      filteredFavorites: [],
      search: '',
      selectedRadio: null,
      audio: null,
      sheet: false,
      activeRadioIndex: null
    }
  },
  methods: {
    removeFromFavorites(index) {
    console.log('Rimozione dalla lista dei preferiti:', this.favorites[index].name);
    this.clearAudio(); // Interrompiamo l'audio prima di rimuovere dalla lista dei preferiti
    this.favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
    this.stopRadio();
    this.filterFavorites(); // Aggiorniamo i preferiti dopo la rimozione
  },
    filterFavorites() {
      const searchText = this.search.toLowerCase();
      this.filteredFavorites = this.favorites.filter(favorite => {
        return favorite.name.toLowerCase().includes(searchText) ||
          favorite.tags.toLowerCase().includes(searchText) ||
          favorite.country.toLowerCase().includes(searchText);
      });
    },


    

    isPlaying(favorite) {
      return this.selectedRadio === favorite && this.audio && !this.audio.paused;
    },
    getFaviconUrl(favorite) {
      return favorite.favicon || '/default_favicon.png';
    },
    playRadio(favorite) {
    if (this.audio) {
      this.stopRadio();
    }

    if (favorite.url.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        this.audio = new Audio();
        this.audio.addEventListener('error', () => {
          console.error('Errore durante la riproduzione della radio');
          this.stopRadio();
        });
        const hls = new Hls();
        hls.loadSource(favorite.url);
        hls.attachMedia(this.audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.audio.play();
          this.audio.volume = 1;
          this.sheet = true;
          this.selectedRadio = favorite;
        });
      } else {
        console.error('HLS non è supportato nel tuo browser');
      }
    } else {
      this.audio = new Audio(favorite.url);
      this.audio.play();
      this.audio.volume = 1;
      this.sheet = true;
      this.selectedRadio = favorite;
    }
  },
  
  togglePlayPause(favorite, index) {
  console.log('togglePlayPause called');
  if (this.isPlaying(favorite)) {
    this.stopRadio();
  } else {
    this.playRadio(favorite, index);
    this.activeRadioIndex = index;
  }
},

stopRadio() {
  console.log('stopRadio called');
  if (this.audio) {
    this.audio.pause();
    this.audio = null;
    this.sheet = false;
    this.selectedRadio = null;
  }
},

clearAudio() {
  console.log('clearAudio called');
  const videoPlayer = this.$refs.videoPlayer;
  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.src = '';
    // Rimuovi eventuali istanze di HLS
    if (this.currentHlsInstance) {
      this.currentHlsInstance.detachMedia();
      this.currentHlsInstance.destroy();
      this.currentHlsInstance = null;
    }
  }
},

beforeRouteLeave(to, from, next) {
      // Interrompi l'audio prima di lasciare la pagina
      this.clearAudio();
      next(); // Assicurati di chiamare next() per permettere la navigazione
    },



  },
  created() {
    this.filterFavorites(); // Filter favorites on page load
  },
  setup() {
    const display = useDisplay();
    return { display };
  }
}
</script>

<style>
body {
  background-color: #1B3659;
}

.radio-card {
  height: 185px;
}

.radio-wrapper {
  background-color: rgb(3, 162, 202);
}

.active-radio {
  background-color: #F0F0F0;
}
</style>
