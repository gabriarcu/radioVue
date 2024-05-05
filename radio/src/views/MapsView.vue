<template>
  <div class="map-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default {
  name: 'MapsView',
  props: {
    radioState: String // Prop per passare lo stato della radio
  },
  mounted() {
    this.init(this.radioState); // Passa lo stato della radio al metodo init
  },
  methods: {
    init(radioState) {
  // Create a scene
  const scene = new THREE.Scene();

  // Create a camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2; // Ridotto per allontanare la camera dal mondo

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ canvas: this.$refs.canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Add controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.update();

  // Create a sphere (world)
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const texture = new THREE.TextureLoader().load('8k_earth_daymap.jpg');
  const material = new THREE.MeshPhongMaterial({ map: texture });
  const earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  // Create a marker and position it based on the radio state
  const markerGeometry = new THREE.SphereGeometry(0.01, 32, 32);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);

  // Posiziona il marker in base allo stato della radio
  // Posiziona il marker in base allo stato della radio
switch (radioState) {
  case 'Abruzzo':
    marker.position.set(42.3512, 13.3986); // Coordinate per l'Abruzzo
    break;
  case 'Basilicata':
    marker.position.set(40.6431, 15.9699); // Coordinate per la Basilicata
    break;
  case 'Calabria':
    marker.position.set(38.9055, 16.1648); // Coordinate per la Calabria
    break;
  case 'Campania':
    marker.position.set(40.8396, 14.2509); // Coordinate per la Campania
    break;
  case 'Emilia-Romagna':
    marker.position.set(44.7596, 11.1951); // Coordinate per l'Emilia-Romagna
    break;
  case 'Friuli Venezia Giulia':
    marker.position.set(45.6499, 13.7681); // Coordinate per il Friuli Venezia Giulia
    break;
  case 'Lazio':
    marker.position.set(41.8928, 12.4823); // Coordinate per il Lazio
    break;
  case 'Liguria':
    marker.position.set(44.4056, 8.9463); // Coordinate per la Liguria
    break;
  case 'Lombardia':
    marker.position.set(45.4798, 9.2035); // Coordinate per la Lombardia
    break;
  case 'Marche':
    marker.position.set(43.6167, 13.5167); // Coordinate per le Marche
    break;
  case 'Molise':
    marker.position.set(41.6331, 14.6019); // Coordinate per il Molise
    break;
  case 'Piemonte':
    marker.position.set(45.0703, 7.6869); // Coordinate per il Piemonte
    break;
  case 'Puglia':
    marker.position.set(41.1256, 16.8674); // Coordinate per la Puglia
    break;
  case 'Sardegna':
    marker.position.set(39.2153, 9.1217); // Coordinate per la Sardegna
    break;
  case 'Sicilia':
    marker.position.set(37.599993, 14.015356); // Coordinate per la Sicilia
    break;
  case 'Toscana':
    marker.position.set(43.7711, 11.2486); // Coordinate per la Toscana
    break;
  case 'Trentino-Alto Adige':
    marker.position.set(46.0682, 11.1212); // Coordinate per il Trentino-Alto Adige
    break;
  case 'Umbria':
    marker.position.set(42.9384, 12.6212); // Coordinate per l'Umbria
    break;
  case 'Valle d\u2019Aosta':
    marker.position.set(45.7389, 7.4262); // Coordinate per la Valle d'Aosta
    break;
  case 'Veneto':
    marker.position.set(45.4342, 12.3387); // Coordinate per il Veneto
    break;
  default:
    console.error('Stato non supportato:', radioState);
    break;

  case '':
  marker.position.set(90, 0);
  break;
    
}


  scene.add(marker);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // Render the scene
  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  };

  animate();
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
