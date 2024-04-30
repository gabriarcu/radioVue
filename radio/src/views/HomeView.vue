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
        <v-card>
          <v-card-title>{{ radio.name }}</v-card-title>
          <v-card-text>
            <!-- Aggiungi altri dettagli della radio se necessario -->
            <p>{{ radio.codec }}</p>
            <p>{{ radio.bitrate }}</p>
            <!-- E così via -->
          </v-card-text>
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
  },
  created() {
    this.getRadios();
  },
}
</script>
