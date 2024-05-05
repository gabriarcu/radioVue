<template>
  <div class="map-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'MapsView',
  mounted() {
    this.init();
    this.fetchRadioData();
    this.animate();
  },
  methods: {
    fetchRadioData() {
      fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
        .then(response => response.json())
        .then(data => {
          const italianRadioStations = data.filter(radio => radio.countrycode === 'IT');
          italianRadioStations.forEach(station => {
            const longitude = station.geo_long;
            const latitude = station.geo_lat;
            this.addMarker(longitude, latitude, 0.01);
          });
          this.addItalyMarker();
        })
        .catch(error => {
          console.error('Error fetching radio station data:', error);
        });
    },
    init() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 2;
      this.renderer = new THREE.WebGLRenderer({ canvas: this.$refs.canvas });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const texture = new THREE.TextureLoader().load('8k_earth_daymap.jpg');
      const material = new THREE.MeshBasicMaterial({ map: texture });
      this.earth = new THREE.Mesh(geometry, material);
      this.scene.add(this.earth);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(5, 3, 5);
      this.scene.add(directionalLight);
    },
    addMarker(longitude, latitude, markerSize = 0.05) {
      const geometry = new THREE.SphereGeometry(markerSize, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(geometry, material);
      const phi = THREE.Math.degToRad(90 - latitude);
      const theta = THREE.Math.degToRad(longitude + 338);
      marker.position.x = Math.sin(phi) * Math.cos(theta);
      marker.position.y = Math.cos(phi);
      marker.position.z = Math.sin(phi) * Math.sin(theta);
      this.scene.add(marker);
    },
    addItalyMarker() {
      const markerGeometry = new THREE.SphereGeometry(0.01, 32, 32);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(0, 0, 0); // Coordinate approssimative per l'Italia
      this.scene.add(marker);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
    }
  }
}
</script>

<style>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
