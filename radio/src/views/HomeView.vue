<template>
  <v-container>
    <h1>Radio</h1>
    <v-row>
      <v-col v-for="(radio, index) in radios" :key="index" cols="12" sm="6" md="4">
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
                <v-btn :style="{ marginRight: display.mdAndUp.value ? '5px' : '0' }" icon @click="playRadio(radio)">
                  <v-icon>mdi-play</v-icon>
                </v-btn>

                <v-btn :style="{ marginLeft: display.mdAndUp.value ? '5px' : '0' }" icon @click="stopRadio">
                  <v-icon>mdi-stop</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bottom sheet -->
    <v-bottom-sheet inset v-model="sheet">
      <v-sheet v-if="selectedRadio && audio"
        style="position: fixed; bottom: 0; width: 100%; background-color: rgba(255, 255, 255, 0.9);">
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ selectedRadio.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ selectedRadio.name }}</v-list-item-subtitle>
            <template v-slot:append>
              <!-- Bottone per mettere in pausa/riprendere la riproduzione -->
              <!--<v-btn :style="{ marginRight: display.mdAndUp.value ? '5px' : '0' }" icon="mdi-pause" variant="text" @click="toggleAudioPlayback"></v-btn>-->
              <!-- Bottone per fermare la riproduzione -->
              <v-btn :style="{ marginLeft: display.mdAndUp.value ? '5px' : '0' }" icon="mdi-stop" variant="text"
                @click="stopRadio"></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-bottom-sheet>



  </v-container>
</template>

<script>
import { useDisplay } from 'vuetify';

export default {
  name: 'HomeView',
  data() {
    return {
      radios: [],
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
      this.sheet = true; // Attiva il bottom sheet quando viene avviata la riproduzione
      this.selectedRadio = radio; // Imposta la stazione radio selezionata
    },
    stopRadio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
        this.sheet = false; // Disattiva il bottom sheet quando viene interrotta la riproduzione
      }
    }
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
.radio-card {
  height: 200px;
  /* Altezza desiderata per le card */
}
</style>
