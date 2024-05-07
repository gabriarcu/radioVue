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

      </div>
    </div>
  </div>
</template>


<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
      selectedRadio: null // Data for the selected radio
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
    // Quando l'audio inizia a riprodursi, aggiorna lo stato dell'audio e l'icona del pulsante
    this.audioPlaying = true;
  },
  handleAudioPause() {
    // Quando l'audio viene messo in pausa, aggiorna lo stato dell'audio e l'icona del pulsante
    this.audioPlaying = false;
  },
    init() {
      // Create a camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 5;

      // Create a renderer
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.container.appendChild(this.renderer.domElement);

      // Add OrbitControls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;

      // Create a scene
      this.scene = new THREE.Scene();

      // Create a more accurate Earth model
      const geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64); // Increase segments for smoother surface
      const texture = new THREE.TextureLoader().load(`${process.env.BASE_URL}8k_earth_daymap.jpg`);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const earth = new THREE.Mesh(geometry, material);
      this.scene.add(earth);

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      // Add directional light
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
            this.addMarker(longitude, latitude, 0.01, station); // Adjust marker size as needed
          });
        })
        .catch(error => {
          console.error('Error fetching radio station data:', error);
        });
    },
    
    addMarker(longitude, latitude, markerSize = 0.02, data) {
  // Converti le coordinate in radianti
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  // Calcola la posizione del marker sulla sfera della Terra con un offset verticale
  const radius = this.earthRadius; // Utilizza direttamente il raggio della Terra
  const offset = 0.01; // Offset verticale per spostare il marker sopra la superficie
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = (radius + offset) * Math.cos(phi); // Aggiungi l'offset verticale
  const z = radius * Math.sin(phi) * Math.sin(theta);

  // Crea il marker come pallino
  const geometry = new THREE.SphereGeometry(markerSize, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Colore bianco di default
  const marker = new THREE.Mesh(geometry, material);
  marker.position.set(x, y, z); // Imposta la posizione del marker sulla sfera

  // Allega i dati del marker
  marker.userData = { longitude, latitude, data };

  // Aggiungi eventi per effetti di hover
  marker.onmouseenter = () => {
    marker.material.color.set(0xff0000); // Cambia il colore in rosso quando si passa sopra
  };
  marker.onmouseleave = () => {
    marker.material.color.set(0xffffff); // Ripristina il colore bianco quando non si passa sopra
  };

  // Aggiungi il marker alla scena
  this.markers.push(marker);
  this.scene.add(marker);
},

    
    onCanvasClick(event) {
      // Calculate mouse position in normalized device coordinates
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.markers);

      if (intersects.length > 0) {
        // Handle marker click
        const marker = intersects[0].object;
        const data = marker.userData.data;
        this.selectedRadio = data; // Set radio details to show modal window
      }
    },
    toggleRadio() {
  if (this.selectedRadio && this.selectedRadio.url) {
    if (this.audio.paused) {
      // Se l'audio è in pausa, carica e avvia la riproduzione dell'URL della radio selezionata
      this.audio.src = this.selectedRadio.url;
      this.audio.play();
    } else {
      // Se l'audio è in riproduzione, mettilo in pausa
      this.audio.pause();
    }
  }
},
    closeModal() {
      // Close the modal window
      this.selectedRadio = null;
      // Pause audio when closing modal
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
