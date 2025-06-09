//! c pas la peine de le voire !
import React, { useState, useEffect } from 'react';
import { getTopRatedMovies } from '../services/api';
import { Movie } from '../types/movie';
import MovieCard from '../components/movie/MovieCard';
import { Star, Loader } from 'lucide-react';

const TopRatedMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const newMovies = await getTopRatedMovies();
      setMovies(prev => [...prev, ...newMovies]);
      setHasMore(newMovies.length > 0);
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchMovies();
  };

  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen bg-dark-100 pt-24 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 text-red-600 animate-spin" />
          <span className="text-light-200">Chargement des films...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-4 mb-8">
          <Star className="w-8 h-8 text-red-600" fill="currentColor" />
          <h1 className="text-3xl font-bold text-light-100">Films les Mieux Notés</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors duration-300 flex items-center space-x-2 mx-auto"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Chargement...</span>
                </>
              ) : (
                <span>Charger plus de films</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRatedMoviesPage;