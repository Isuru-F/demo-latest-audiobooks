export interface Artist {
  id: string;
  name: string;
  type: string;
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
}

export interface Album {
  id: string;
  name: string;
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface NewReleasesResponse {
  albums: {
    href: string;
    items: Album[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface GenresResponse {
  genres: string[];
}

export interface Audiobook {
  id: string;
  name: string;
  authors: Author[];
  narrators: (string | NarratorObject)[];
  description: string;
  publisher: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  release_date: string;
  media_type: string;
  type: string;
  uri: string;
  total_chapters: number | null;
  duration_ms: number;
}

export interface NarratorObject {
  name: string;
  [key: string]: any;
}

export interface Author {
  name: string;
}

export interface AudiobooksResponse {
  audiobooks: {
    href: string;
    items: Audiobook[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}