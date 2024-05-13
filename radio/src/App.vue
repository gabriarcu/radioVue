
import { RouterLink } from 'vue-router';
<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">Preferiti🌟</router-link> |
    <router-link to="/Maps">Mappa</router-link>
  </nav>
  <router-view/>
</template>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: rgb(3, 162, 202);
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: white;
;
}

nav a.router-link-exact-active {
  color: rgb(3, 162, 202);
}
</style>
