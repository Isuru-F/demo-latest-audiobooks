<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="logo">
      <h1>Jukebox</h1>
    </div>
    <nav>
      <RouterLink to="/">New Releases</RouterLink>
      <RouterLink to="/genres">Genres</RouterLink>
    </nav>
  </header>

  <RouterView />

  <footer>
    <p>&copy; {{ new Date().getFullYear() }} Jukebox - A modern music discovery app</p>
  </footer>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background-color: #1a1c27;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo h1 {
  margin: 0;
  font-size: 28px;
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

nav {
  display: flex;
  gap: 30px;
}

nav a {
  text-decoration: none;
  color: #b2b5c4;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

nav a:hover {
  color: white;
}

nav a.router-link-active {
  color: white;
}

nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  border-radius: 1.5px;
}

footer {
  text-align: center;
  padding: 30px;
  margin-top: 60px;
  background-color: #1a1c27;
  color: #8a8c99;
}
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f6fa;
  color: #2a2d3e;
  line-height: 1.6;
}

html {
  scroll-behavior: smooth;
}
</style>