import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { Movie } from '../types/movie';
import MovieCard from '../components/movie/MovieCard';
import { Search, Loader, AlertTriangle } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update search input when URL query changes
    setSearchTerm(query);
    
    // Only search if we have a query
    if (query) {
      fetchResults(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchMovies(searchQuery);
      setResults(data);
    } catch (err) {
      console.error('Error searching movies:', err);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-light-100 mb-8">Recherche de Films</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des films par titre..."
              className="w-full bg-dark-200 text-light-100 rounded-lg py-4 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-300" />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition"
            >
              Rechercher
            </button>
          </div>
          
          {/* Search Tips */}
          <div className="mt-2 text-sm text-light-400">
            <p>Conseils: Entrez le titre complet ou partiel d'un film. Exemple: "Matrix", "Star Wars", etc.</p>
          </div>
        </form>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-primary" />
            <span className="ml-3 text-light-200">Recherche en cours...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-light-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle size={20} className="text-red-500 mr-2" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Results */}
        {!loading && !error && (
          <>
            {query && (
              <h2 className="text-xl text-light-200 mb-6">
                {results.length === 0
                  ? `Aucun résultat trouvé pour "${query}"`
                  : `${results.length} résultat${results.length > 1 ? 's' : ''} pour "${query}"`}
              </h2>
            )}
            
            {results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
            
            {query && results.length === 0 && !loading && (
              <div className="bg-dark-200 rounded-lg p-8 text-center">
                <p className="text-light-300 mb-4">
                  Aucun film ne correspond à votre recherche. Essayez avec des termes différents.
                </p>
                <p className="text-light-400 text-sm">
                  Suggestions: vérifiez l'orthographe, utilisez moins de mots-clés ou essayez des termes plus généraux.
                </p>
              </div>
            )}
          </>
        )}
        
        {/* Initial State - No Search Yet */}
        {!query && !loading && (
          <div className="bg-dark-200 rounded-lg p-8 text-center">
            <p className="text-light-200 mb-4">
              Entrez le titre d'un film dans la barre de recherche pour commencer.
            </p>
            <p className="text-light-400 text-sm">
              Vous pouvez rechercher par titre complet ou partiel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;