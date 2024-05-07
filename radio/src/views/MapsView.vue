<template>
  <div ref="container"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default {
  name: 'ThreeJsScene',
  data() {
    return {
      camera: null,
      renderer: null,
      controls: null,
      earthRadius: 1, // Radius of the Earth model
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      markers: [], // Array to store marker meshes
      audio: null // Audio element for radio playback
    };
  },
  mounted() {
    this.init();
    this.animate();
    this.setupEventListeners();
    this.fetchRadioData();
    this.audio = new Audio(); // Create new audio element
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  },
  methods: {
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
    addMarker(longitude, latitude, markerSize = 0.05, data) {
      const phi = (90 - latitude) * (Math.PI / 180);
      const theta = (longitude + 180) * (Math.PI / 180);
      const x = -this.earthRadius * Math.sin(phi) * Math.cos(theta);
      const y = this.earthRadius * Math.cos(phi);
      const z = this.earthRadius * Math.sin(phi) * Math.sin(theta);

      const geometry = new THREE.SphereGeometry(markerSize, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);

      // Attach data to marker object
      marker.userData = { longitude, latitude, data };

      this.markers.push(marker);
      this.scene.add(marker);
    },
    onCanvasClick(event) {
      // Calculate mouse position in normalized device coordinates
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.markers);

      if (intersects.length > 0) {
        // Handle marker click
        const marker = intersects[0].object;
        const data = marker.userData.data;
        console.log('Marker clicked:', data);
        // Avvia la riproduzione della stazione radio associata al marker
        this.playRadio(data.url);
      }
    },
    playRadio(url) {
      // Interrompi la riproduzione se già in corso
      this.audio.pause();
      // Imposta la nuova sorgente audio
      this.audio.src = url;
      // Avvia la riproduzione
      this.audio.play();
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
