import React from 'react';
import { ChevronRight , TrendingUp } from 'lucide-react';
import MovieCard from './MovieCard';
import { Link } from 'react-router-dom';
import { MovieSectionProps } from '../../types/movie';




const MovieSection: React.FC<MovieSectionProps> = ({ 
  title, 
  movies, 
  viewAllLink,
  isLoading = false
}) => {
  // Render loading skeletons if data is loading
  if (isLoading) {
    return (
      
        <section className="bg-dark-100 py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                  <h2 className="text-3xl font-bold text-white">{title}</h2>
             </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {Array(8).fill(0).map((_, index) => (
                <div key={index} className="rounded-lg overflow-hidden bg-dark-700 animate-pulse">
                  <div className="aspect-[2/3] w-full bg-dark-600"></div>
                  <div className="p-4">
                    <div className="h-5 bg-dark-600 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-dark-600 rounded w-1/2 mb-3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
    );
  }

  // When no movies are available
  if (!movies || movies.length === 0) {
    return (
      <section className="bg-dark-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
          <TrendingUp className="w-8 h-8 text-red-600" />
            <h2 className="text-3xl font-bold text-white">{title}</h2>
          </div>
          <div className="bg-dark-300 rounded-lg p-6 text-center">
            <p className="text-light-300">Aucun film disponible dans cette catégorie pour le moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-dark-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-red-600" />
                      <h2 className="text-3xl font-bold text-white">{title}</h2>
                    </div>
            {viewAllLink && (
                   <Link 
                     to={viewAllLink} 
                     className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/10 to-black hover:from-red-600/20 hover:to-black transition-all duration-300"
                   >
                     <span className="text-gray-200 group-hover:text-white transition-colors">Voir tous</span>
                     <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-transform group-hover:translate-x-1" />
                   </Link>
                 )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.slice(0, 12).map((movie, index) => (
           <div 
           key={movie.id} 
           className="group relative rounded-lg overflow-hidden bg-dark-800 hover:shadow-lg hover:shadow-red-600 transition-shadow duration-300"
         >
            <MovieCard key={movie.id} movie={movie} priority={index < 4} />
            </div>
          ))}
       
        </div>
      </div>
    </section>
  );
};

export default MovieSection;