export interface Genre {
  id: number
  name: string
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath?: string; 
  backdrop_path: string;
  voteAverage?: number;
  releaseDate?: string;
  adult?: boolean;
  runtime?: number;
  genres?: { id: number; name: string }[]; 
  genre_ids: number[];
  popularity: number;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string;
  vote_count: number;
  budget: number;
  revenue: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Comment {
  id: number
  user_id: number
  movie_id: number
  content: string
  created_at: string
  user?: {
    id: number
    fullname: string
    email: string
    image?: string
  }
}
export interface UserInteraction {
  movieId: number;
  clicked: number;
  watched: boolean;
  liked: boolean;
  comments: CommentType[];
}

export interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
  isLoading?: boolean;
}

export interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

