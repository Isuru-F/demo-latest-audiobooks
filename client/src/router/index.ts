import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GenresView from '../views/GenresView.vue'
import AudiobooksView from '../views/AudiobooksView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AudiobooksView,
    },
    {
      path: '/latest-music',
      name: 'latestMusic',
      component: HomeView,
    },
    {
      path: '/genres',
      name: 'genres',
      component: GenresView,
    },
    // Redirect /audiobooks to home since it's now the main page
    {
      path: '/audiobooks',
      redirect: '/' 
    },
  ],
})

export default router
