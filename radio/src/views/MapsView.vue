<template>
  <div ref="container">
    <!-- Altri contenuti come il mappamondo -->

    <!-- Finestra modale -->
    <div class="modal-wrapper" v-if="selectedRadio" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ selectedRadio.name }}</h2>
        <!-- Aggiunta del pulsante di riproduzione/pausa -->
        <v-btn icon @click="toggleRadio" :color="audioPlaying ? '' : ''" style="margin-right: 5px;">
          <v-icon>{{ audioPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
        <!-- Nome della canzone -->
        <p v-if="currentSong" class="song-name">{{ currentSong }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import $ from 'jquery';

export default {
  name: 'ThreeJsScene',
  data() {
    return {
      audioPlaying: false,
      camera: null,
      renderer: null,
      controls: null,
      earthRadius: 1, // Radius of the Earth model
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      markers: [], // Array to store marker meshes
      audio: new Audio(), // Audio element for radio playback
      selectedRadio: null, // Data for the selected radio
      currentSong: null // Add currentSong property
    };
  },

  mounted() {
    this.init();
    this.animate();
    this.setupEventListeners();
    this.fetchRadioData();
    this.audio.addEventListener('play', this.handleAudioPlay);
    this.audio.addEventListener('pause', this.handleAudioPause);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    this.audio.removeEventListener('play', this.handleAudioPlay);
    this.audio.removeEventListener('pause', this.handleAudioPause);
  },
  methods: {
    handleAudioPlay() {
      this.audioPlaying = true;
    },
    handleAudioPause() {
      this.audioPlaying = false;
    },
    init() {
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 5;

      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;

      this.scene = new THREE.Scene();

      const geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
      const texture = new THREE.TextureLoader().load(`${process.env.BASE_URL}8k_earth_daymap.jpg`);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const earth = new THREE.Mesh(geometry, material);
      this.scene.add(earth);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1).normalize();
      this.scene.add(directionalLight);
    },
    setupEventListeners() {
      window.addEventListener('resize', this.handleWindowResize);
      this.renderer.domElement.addEventListener('click', this.onCanvasClick);
    },
    fetchRadioData() {
      fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
        .then(response => response.json())
        .then(data => {
          const italianRadioStations = data.filter(radio => radio.countrycode === 'IT');
          italianRadioStations.forEach(station => {
            const longitude = station.geo_long;
            const latitude = station.geo_lat;
            this.addMarker(longitude, latitude, 0.01, station);
          });
        })
        .catch(error => {
          console.error('Error fetching radio station data:', error);
        });
    },
    addMarker(longitude, latitude, markerSize = 0.02, data) {
      const phi = (90 - latitude) * (Math.PI / 180);
      const theta = (longitude + 180) * (Math.PI / 180);

      const radius = this.earthRadius;
      const offset = 0.01;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = (radius + offset) * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const geometry = new THREE.SphereGeometry(markerSize, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);

      marker.userData = { longitude, latitude, data };

      marker.onmouseenter = () => {
        marker.material.color.set(0xff0000);
      };
      marker.onmouseleave = () => {
        marker.material.color.set(0xffffff);
      };

      this.markers.push(marker);
      this.scene.add(marker);
    },
    onCanvasClick(event) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.markers);

      if (intersects.length > 0) {
        const marker = intersects[0].object;
        const data = marker.userData.data;
        this.selectedRadio = data;

        this.toggleRadio();
      }
    },
    parseAudioUrlFromHtml(html) {
      const audioUrlRegex = /<audio[^>]*src=['"](.*?)['"][^>]*>/;
      const match = html.match(audioUrlRegex);
      if (match) {
        return match[1];
      } else {
        throw new Error('Audio URL not found in HTML');
      }
    },
    toggleRadio() {
      if (this.selectedRadio && this.selectedRadio.url) {
        if (this.audio.paused) {
          this.audio.src = this.selectedRadio.url;
          this.audio.play();

          this.getRadioAudioUrl(this.selectedRadio.url)
            .then(audioUrl => {
              this.identifySong(audioUrl);
            })
            .catch(error => {
              console.error('Error fetching radio audio URL:', error);
            });
        } else {
          this.audio.pause();
        }
      }
    },
    getRadioAudioUrl(radioUrl) {
      return fetch(radioUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(html => {
          const audioUrl = this.parseAudioUrlFromHtml(html);
          return audioUrl;
        });
    },
    identifySong(audioUrl) {
      const data = {
        'url': audioUrl,
        'return': 'apple_music,spotify',
        'api_token': 'test'
      };

      $.getJSON('https://api.audd.io/?jsonp=?', data)
        .done((result) => {
          console.log(result);
          if (result && result.title) {
            this.currentSong = result.result.title;
          } else {
            this.currentSong = "Canzone sconosciuta";
          }
        })
        .fail((error) => {
          console.error('Error identifying song:', error);
          this.currentSong = "Errore nell'identificazione della canzone";
        });
    },
    closeModal() {
      this.selectedRadio = null;
      this.audio.pause();
    },
    animate() {
      requestAnimationFrame(this.animate);

      if (this.controls) {
        this.controls.update();
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },
    handleWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
};
</script>

<style>
/* Modal style */
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Slightly transparent dark background */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
}
</style>
