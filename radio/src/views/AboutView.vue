<template>
  <v-container>
    <h1>Preferiti</h1>
    <v-row>
      <v-col v-for="(favorite, index) in favorites" :key="index" cols="12" sm="6" md="4">
        <v-card class="radio-card">
          <v-row no-gutters>
            <v-col cols="8">
              <v-card-title>{{ favorite.name }}</v-card-title>
              <!-- Aggiungi altri dettagli se necessario -->
            </v-col>
            <v-col cols="4">
              <v-img :src="getFaviconUrl(favorite)" aspect-ratio="1/1"></v-img>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <div class="text-center">
                <v-btn color="primary" @click="playRadio(favorite)">
                  <v-icon>mdi-play</v-icon>
                </v-btn>
                <v-btn color="error" @click="removeFromFavorites(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'FavoritesPage',
  data() {
    return {
      favorites: []
    }
  },
  methods: {
    getFaviconUrl(favorite) {
      return favorite.favicon || '/default_favicon.png'; // Aggiungi il percorso dell'immagine predefinita
    },
    playRadio(favorite) {
      // Implementa la logica per avviare la riproduzione della radio preferita
      console.log('Avvio riproduzione di:', favorite.name);
    },
    removeFromFavorites(index) {
      // Implementa la logica per rimuovere la radio preferita dall'elenco dei preferiti
      console.log('Rimozione dalla lista dei preferiti:', this.favorites[index].name);
      this.favorites.splice(index, 1);
      // Aggiorna il local storage o il backend per mantenere aggiornati i preferiti
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }
  },
  created() {
    // Recupera i preferiti dal local storage all'avvio della pagina
    const storedFavorites = JSON.parse(localStorage.getItem('favorites'));
    this.favorites = storedFavorites ? storedFavorites : [];
  }
}
</script>

<style>
.radio-card {
  height: 200px; /* Altezza desiderata per le card */
}
</style>
