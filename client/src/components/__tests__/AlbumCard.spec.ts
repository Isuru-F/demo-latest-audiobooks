import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AlbumCard from '../AlbumCard.vue'
import type { Album } from '@/types/spotify'

describe('AlbumCard', () => {
  const mockAlbum: Album = {
    id: '1',
    name: 'Test Album',
    album_type: 'album',
    artists: [
      {
        id: 'artist1',
        name: 'Test Artist',
        type: 'artist',
        uri: 'spotify:artist:artist1',
        href: 'https://api.spotify.com/v1/artists/artist1',
        external_urls: {
          spotify: 'https://open.spotify.com/artist/artist1'
        }
      }
    ],
    available_markets: ['US'],
    external_urls: {
      spotify: 'https://open.spotify.com/album/1'
    },
    href: 'https://api.spotify.com/v1/albums/1',
    images: [
      {
        url: 'https://example.com/image.jpg',
        height: 300,
        width: 300
      }
    ],
    release_date: '2023-01-01',
    release_date_precision: 'day',
    total_tracks: 10,
    type: 'album',
    uri: 'spotify:album:1'
  }

  it('renders album information correctly', () => {
    const wrapper = mount(AlbumCard, {
      props: {
        album: mockAlbum
      }
    })

    // Album name
    expect(wrapper.find('.album-title').text()).toBe(mockAlbum.name)
    
    // Artist name
    expect(wrapper.find('.album-artists').text().trim()).toBe(mockAlbum.artists[0].name)
    
    // Image src should match the album image URL
    expect(wrapper.find('img').attributes('src')).toBe(mockAlbum.images[0].url)
    
    // Link to Spotify should be correct
    expect(wrapper.find('.album-link').attributes('href')).toBe(mockAlbum.external_urls.spotify)
  })

  it('shows a placeholder when no image is available', () => {
    // Create a copy of the mock album without images
    const albumWithoutImages = { ...mockAlbum, images: [] }
    
    const wrapper = mount(AlbumCard, {
      props: {
        album: albumWithoutImages
      }
    })
    
    // Should not render img element
    expect(wrapper.find('img').exists()).toBe(false)
    
    // Should show the no-image div instead
    expect(wrapper.find('.no-image').exists()).toBe(true)
    expect(wrapper.find('.no-image').text()).toBe('No Image')
  })
})