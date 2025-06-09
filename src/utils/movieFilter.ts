import type { Movie } from "../types/movie"

/**
 * Filtre les films pour éliminer ceux sans poster ou avec des données incomplètes
 */
export const filterValidMovies = (movies: Movie[]): Movie[] => {
  return movies.filter((movie) => {
    // Vérifier que le poster existe et n'est pas vide
    const hasValidPoster =
      movie.poster_path &&
      movie.poster_path.trim() !== "" &&
      movie.poster_path !== "null" &&
      movie.poster_path !== "None"

    // Vérifier que le titre existe et n'est pas un titre générique
    const hasValidTitle =
      movie.title &&
      movie.title.trim() !== "" &&
      !["unknown", "inconnu", "untitled", "sans titre"].includes(movie.title.toLowerCase())

    // Vérifier que la description existe et a un minimum de contenu
    const hasValidOverview = movie.overview && movie.overview.trim() !== "" && movie.overview.length > 10

    return hasValidPoster && hasValidTitle && hasValidOverview
  })
}

/**
 * Filtre et limite le nombre de films valides
 */
export const getValidMovies = (movies: Movie[], limit: number): Movie[] => {
  const validMovies = filterValidMovies(movies)
  return validMovies.slice(0, limit)
}
