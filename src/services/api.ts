import axios from 'axios';
import { MovieResponse, MovieDetails, Movie } from '../types/movie';

//* On prépare la connexion au site TMDB
const API_KEY = '2dca580c2a14b55200e784d157207b4d';
const BASE_URL = 'https://api.themoviedb.org/3';

//* Pour parler avec le site de TMDB tu dois utiliser ce URL + cette PWD + cette language
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'fr-FR', 
  },
});



export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/trending/movie/day');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

// Get popular movies
export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

// Films les mieux notés
export const getTopRatedMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/movie/top_rated');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

// Films à venir
export const getUpcomingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/movie/upcoming');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

// Détails d’un film
export const getMovieDetails = async (id: string): Promise<MovieDetails | null> => {
  try {
    const response = await tmdbApi.get<MovieDetails>(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie ${id} details:`, error);
    return null;
  }
};

// Search movies
export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  
  try {
    const response = await tmdbApi.get<MovieResponse>('/search/movie', {
      params: { query },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

// Suggestions de films
export const getMovieRecommendations = async (id: string): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get<MovieResponse>(`/movie/${id}/recommendations`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching recommendations for movie ${id}:`, error);
    return [];
  }
};


export const getImageUrl = (path: string, size: 'poster' | 'backdrop' = 'poster'): string => {
  if (!path) return '';
  
  const baseUrl = 'https://image.tmdb.org/t/p';
  
  const sizes = {
    poster: {
      small: 'w185',
      medium: 'w342',
      large: 'w500',
      original: 'original',
    },
    backdrop: {
      small: 'w300',
      medium: 'w780',
      large: 'w1280',
      original: 'original',
    },
  };
     //Genrer l4URL final 
  return `${baseUrl}/${sizes[size].medium}${path}`;
};


//? Lien de l’image
//*path : la partie specifique de l'URL qui est unique pour chaque image
//*siez : 'poster' | 'backdrop' : il peut prendre soit opster (piur l'affiche de film) soit backdrop (pour l'arriere-plan u film)  
//* si ce parametere n'est pas specifie lors de l'apple de la fonction il prend par defaut poster  
//*:string : cela signifie que la fonction retourne un string cad un texte dans ce cas une URL

//?Si tu appeles la fonction comme ceci :  getImageUrl('/abc123.jpg', 'poster');
//?l'URL générée  : https://image.tmdb.org/t/p/w342/abc123.jpg



//*ce code utile pour afficher des images de film dans une application
//*avec un controle facile sur la taille de ces images !


