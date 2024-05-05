import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue' // Modifica qui
import MapsView from '../views/MapsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/favorites', // Cambia il percorso in base al tuo bisogno
    name: 'favorites',
    component: AboutView // Cambia il componente qui
  },
  {
    path: '/Maps', // Cambia il percorso in base al tuo bisogno
    name: 'Maps',
    component: MapsView // Cambia il componente qui
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
