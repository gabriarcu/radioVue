<template>
  <v-container>
    <h1>Homepage</h1>
    <v-row>
      <v-col
        v-for="(radio, index) in radios"
        :key="index"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="radio-card">
          <v-row no-gutters>
            <v-col cols="8">
              <v-card-title>{{ radio.name }}</v-card-title>
              <v-card-text>
                <!-- Aggiungi altri dettagli della radio se necessario -->
                <p>{{ radio.codec }}</p>
                <p>{{ radio.bitrate }}</p>
                <!-- E così via -->
              </v-card-text>
            </v-col>
            <v-col cols="4">
              <v-img :src="getFaviconUrl(radio)" aspect-ratio="1/1"></v-img>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <div class="text-center">
                <v-btn
                  color="primary"
                  @click="playRadio(radio)"
                >
                  Play
                </v-btn>
                <v-btn
                  color="error"
                  @click="stopRadio"
                >
                  Stop
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
  name: 'HomeView',
  data() {
    return {
      radios: [],
      audio: null,
    }
  },
  methods: {
    getRadios() {
      fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
        .then(response => response.json())
        .then(data => {
          this.radios = data;
          console.log(data);
        });
    },
    getFaviconUrl(radio) {
      return radio.favicon || '/radio.png'; // Restituisce il percorso dell'immagine predefinita se favicon non è disponibile
    },
    playRadio(radio) {
      if (this.audio) {
        this.stopRadio();
      }
      this.audio = new Audio(radio.url_resolved);
      this.audio.play();
    },
    stopRadio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
    }
  },
  created() {
    this.getRadios();
  },
}
</script>

<style>
.radio-card {
  height: 200px; /* Altezza desiderata per le card */
}
</style>


