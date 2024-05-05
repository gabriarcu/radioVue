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
  mounted() {
    this.init();
  },
  methods: {
    init() {
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

      // Create a marker and position it based on longitude and latitude
      const markerGeometry = new THREE.SphereGeometry(0.01, 32, 32);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(
        Math.cos(41.87194 * Math.PI / 180) * Math.cos(16.56738 * Math.PI / 180),
        Math.sin(41.87194 * Math.PI / 180),
        Math.cos(41.87194 * Math.PI / 180) * Math.sin(16.56738 * Math.PI / 180)
      );

      scene.add(marker);

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luce ambientale per illuminare uniformemente la scena
      scene.add(ambientLight);

      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(5, 3, 5); // Posizione modificata per illuminare uniformemente il mondo
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
};
</script>

<style>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
