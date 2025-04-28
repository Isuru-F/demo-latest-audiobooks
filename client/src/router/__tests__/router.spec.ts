import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import router from '../index'

describe('Router', () => {
  it('redirects /audiobooks to home route', () => {
    // Create a new router instance with the same routes
    const testRouter = createRouter({
      history: createWebHistory(),
      routes: router.options.routes
    })
    
    // Find the /audiobooks route
    const audiobooksRoute = testRouter.options.routes.find(route => route.path === '/audiobooks')
    
    // Check if it redirects to /
    expect(audiobooksRoute).toBeDefined()
    expect(audiobooksRoute?.redirect).toBe('/')
  })
  
  it('maps root path to AudiobooksView', () => {
    const homeRoute = router.options.routes.find(route => route.path === '/')
    expect(homeRoute).toBeDefined()
    expect(homeRoute?.name).toBe('home')
  })
  
  it('maps /latest-music to HomeView', () => {
    const musicRoute = router.options.routes.find(route => route.path === '/latest-music')
    expect(musicRoute).toBeDefined()
    expect(musicRoute?.name).toBe('latestMusic')
  })
})