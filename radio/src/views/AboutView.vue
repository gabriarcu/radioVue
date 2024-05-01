<template>
  <div class="radio-wrapper">
    <v-container>
      <h1 style="color: white;">Preferiti</h1>
      <br>

      <v-text-field v-model="search" label="Cerca" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details
        single-line @input="filterFavorites"></v-text-field>





      <v-row>
        <v-col v-for="(favorite, index) in filteredFavorites" :key="index" cols="12" sm="6" md="4">
          <v-card class="radio-card">
            <v-row no-gutters>
              <v-col cols="8">
                <v-card-title>{{ favorite.name }}</v-card-title>
                <!-- Aggiungi altri dettagli se necessario -->
                <v-card-text>
                  <!-- Add other radio details if necessary -->

                  <p>{{ favorite.tags }}</p>
                  <p>{{ favorite.country }}</p>

                  <div class="text-center align-end"
                    style="position: absolute; bottom: 0; width: 60%; margin-bottom: 30px;">

                    <!--Bottone preferiti-->

                    <v-btn :style="{ marginRight: display && display.mdAndUp.value ? '10px' : '0' }" icon
                      @click="removeFromFavorites(index)" :color="isPlaying(radio) ? 'blue' : 'error'">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>

                    <v-btn :style="{ margin: '0 10px' }" icon @click="togglePlayPause(favorite)"
                      :color="isPlaying(favorite) ? 'blue' : ''">
                      <v-icon v-if="isPlaying(favorite)">mdi-pause</v-icon>
                      <v-icon v-else>mdi-play</v-icon>
                    </v-btn>

                    <v-btn :style="{ marginLeft: display && display.mdAndUp.value ? '10px' : '0' }" icon
                      @click="stopRadio(favorite)" :color="isPlaying(favorite) ? 'blue' : ''">
                      <v-icon>mdi-stop</v-icon>
                    </v-btn>









                  </div>
                </v-card-text>
              </v-col>

              <v-col cols="4">
                <a href="favorite.homepage" target="_blank">
                  <v-img :src="getFaviconUrl(favorite)" aspect-ratio="1/1" style="margin: 10px;"></v-img>
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
export default {
  name: 'FavoritesPage',
  data() {
    return {
      favorites: [],
      filteredFavorites: [],
      search: ''
    }
  },
  methods: {
    removeFromFavorites(index) {
      console.log('Rimozione dalla lista dei preferiti:', this.favorites[index].name);
      this.favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
      this.filterFavorites(); // Aggiorna i preferiti filtrati dopo la rimozione
    },
    filterFavorites() {
      const searchText = this.search.toLowerCase();
      this.filteredFavorites = this.favorites.filter(favorite => {
        return favorite.name.toLowerCase().includes(searchText) || 
               favorite.tags.toLowerCase().includes(searchText) || 
               favorite.country.toLowerCase().includes(searchText);
      });
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
    getFaviconUrl(favorite) {
      return favorite.favicon || '/default_favicon.png';
    },
    playRadio(favorite) {
      console.log('Avvio riproduzione di:', favorite.name);
    },
  },
  created() {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites'));
    this.favorites = storedFavorites ? storedFavorites : [];
  },
  mounted() {
    this.filterFavorites(); // Filtra le preferenze all'avvio della pagina
  }
}
</script>


<style>
.radio-card {
  height: 200px;
  /* Altezza desiderata per le card */
}
</style>
