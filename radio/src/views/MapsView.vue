<template>
  <div ref="container">
    <!-- Altri contenuti come il mappamondo -->

    <!-- Finestra modale -->
    <div class="modal-wrapper" v-if="selectedRadio" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ selectedRadio.name }}</h2>
        <!-- Aggiunta del pulsante di riproduzione/pausa -->
        <v-btn icon @click="togglePlayPause(selectedRadio)" :color="selectedRadio.isPlaying ? 'white' : ''" style="margin-right: 5px;">
    <v-icon>{{ selectedRadio.isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
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
import Hls from 'hls.js';

export default {
    name: 'ThreeJsScene',
    data() {
        return {
            camera: null,
            renderer: null,
            controls: null,
            earthRadius: 1,
            radios: [],
            selectedRadio: null,
            defaultImage: process.env.BASE_URL + '8k_earth_daymap.jpg', // Utilizzo dell'immagine dalla cartella "public"
        };
    },
    mounted() {
        this.init();
        this.animate();
        this.getRadios();
        window.addEventListener('resize', this.handleWindowResize);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        window.addEventListener('click', this.onDocumentMouseClick);

    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('click', this.onDocumentMouseClick);

    },
    methods: {
      init() {
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.$refs.container.appendChild(this.renderer.domElement);

    // Inizializza i controlli della fotocamera (OrbitControls)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Imposta la distanza minima e massima dei controlli della fotocamera
    this.controls.minDistance = 3; // Imposta la distanza minima
    this.controls.maxDistance = 9; // Imposta la distanza massima

    // Inizializza la scena e aggiungi la sfera (es. terra)
    const scene = new THREE.Scene();
    const geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
    const texture = new THREE.TextureLoader().load(this.defaultImage);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Aggiungi luci alla scena
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    this.scene = scene;

    // Inizializza raycaster e mouse
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Aggiungi un listener per gli eventi del mouse sulla finestra
    window.addEventListener('click', this.onDocumentMouseClick, false);
},

closeModal() {
  if (this.selectedRadio && this.selectedRadio.audioPlayer) {
    this.selectedRadio.audioPlayer.pause(); // Interrompi la riproduzione dell'audio
  }
  this.selectedRadio = null; // Chiudi la finestra modale
},



        onDocumentMouseClick(event) {
            event.preventDefault();
            this.mouse.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
            this.mouse.y = -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);

            if (intersects.length > 0) {
                console.log('Clicked on:', intersects[0].object.userData);
                this.handleMarkerClick(intersects[0]);
            }
        },
        handleMarkerClick(intersectedObject) {
            // Gestisci il click sull'oggetto intersecato
            if (intersectedObject.object.onClick) {
                intersectedObject.object.onClick();
                const previousRadio = this.selectedRadio;
                this.selectedRadio = intersectedObject.object.userData;
                this.$nextTick(() => {
                    if (this.selectedRadio.url_resolved || this.selectedRadio.url) {
                        this.lazyLoadAudio(this.selectedRadio);
                        if (previousRadio && previousRadio !== this.selectedRadio) {
                            this.pauseRadio(previousRadio);
                        }
                    }
                });
            }
        },

        lazyLoadAudio(radio) {
            console.log('Lazy loading audio for:', radio);
            if (!radio.audioPlayer) {
                console.log('Creating new audio player');
                radio.audioPlayer = new Audio(radio.url_resolved || radio.url);
                console.log('Audio player:', radio.audioPlayer);
                radio.audioPlayer.onloadeddata = () => {
                    console.log('Audio loaded');
                };
                radio.audioPlayer.onerror = () => {
                    console.error('Error loading audio');
                };
            }
            else {
                console.log('Audio player already exists');
            }
        },
        addMarker(longitude, latitude, radio) {
            if (longitude !== null && latitude !== null) {
                const phi = (90 - latitude) * (Math.PI / 180);
                const theta = (longitude + 180) * (Math.PI / 180);
                const x = -this.earthRadius * Math.sin(phi) * Math.cos(theta);
                const y = this.earthRadius * Math.cos(phi);
                const z = this.earthRadius * Math.sin(phi) * Math.sin(theta);

                const geometry = new THREE.SphereGeometry(0.01, 32, 32);
                const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const marker = new THREE.Mesh(geometry, material);
                marker.position.set(x, y, z);
                marker.userData = radio;
                marker.onClick = () => {
                    console.log('Clicked on marker:', marker.userData);
                };
                this.scene.add(marker);

                const invisibleSphereGeometry = new THREE.SphereGeometry(0.015, 32, 32);
                const invisibleSphereMaterial = new THREE.MeshBasicMaterial({ visible: false });
                const invisibleSphere = new THREE.Mesh(invisibleSphereGeometry, invisibleSphereMaterial);
                invisibleSphere.position.set(x, y, z);
                invisibleSphere.userData = radio;
                invisibleSphere.onClick = marker.onClick;
                this.scene.add(invisibleSphere);
            } else {
                console.error('Longitude or latitude is null');
            }
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
        },
        async fetchRadios() {
            const response = await fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&has_geo_info=true&hidebroken=true&order=clickcount&reverse=true');
            const data = await response.json();
            return data;
        },
        async getRadios() {
            try {
                this.radios = await this.fetchRadios();
                this.radios.forEach(radio => {
                    this.addMarker(radio.geo_long, radio.geo_lat, radio);
                    radio.playing = false;
                    radio.audioPlayer = new Audio();
                });
                this.retrieveFavorites();
            } catch (error) {
                console.error('Error fetching radios:', error);
            }
        },
        togglePlayPause(radio) {
    if (radio.isPlaying) {
        this.pauseRadio(radio);
        radio.isPlaying = false; // Aggiorna lo stato della riproduzione
    } else {
        this.pauseAllRadios(); // Pausa tutte le altre radio
        this.playRadio(radio);
        radio.isPlaying = true; // Aggiorna lo stato della riproduzione
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

    // Aggiornamento dell'icona del pulsante in base allo stato di riproduzione dell'audio
    this.audioPlaying = !this.audio.paused;
  }
},

        playRadio(radio) {

            const audioUrl = radio.url_resolved || radio.url;
            if (audioUrl.includes('m3u8')) {
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(audioUrl);
                    hls.attachMedia(radio.audioPlayer);
                } else {
                    console.error('HLS is not supported in this browser.');
                }
            } else {
                radio.audioPlayer.src = audioUrl;
            }
            radio.audioPlayer.play()
                .catch(error => {
                    console.error('Error playing audio:', error);
                    if (error.name === 'NotAllowedError') {
                        console.error('Please ensure that the audio playback is allowed in your browser settings.');
                    }
                });
            radio.playing = true;
        },

        pauseRadio(radio) {
            radio.audioPlayer.pause();
            radio.playing = false;
        },
        pauseAllRadios() {
            this.radios.forEach(radio => {
                if (radio.playing) {
                    this.pauseRadio(radio);
                }
            });
        },
        toggleFavorite(radio) {
            radio.favorite = !radio.favorite;
            if (!radio.favorite) {
                this.removeFavorite(radio);
            } else {
                this.saveFavorites();
            }
        },
        saveFavorites() {
            const favorites = this.radios.map(radio => ({ changeuuid: radio.changeuuid, favorite: radio.favorite }));
            localStorage.setItem('favorites', JSON.stringify(favorites));
        },
        removeFavorite(radio) {
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favorites = favorites.filter(fav => fav.changeuuid !== radio.changeuuid);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        },
        retrieveFavorites() {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            this.radios.forEach(radio => {
                const fav = favorites.find(f => f.changeuuid === radio.changeuuid);
                radio.favorite = fav ? fav.favorite : false;
            });
        },
        created() {
            this.getRadios();
            this.retrieveFavorites();
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