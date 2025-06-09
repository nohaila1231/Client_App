// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useUser } from "../../context/UserContext"
// import type { Movie } from "../../types/movie"
// import MovieCard from "./MovieCard"
// import { Spinner } from "../UI/spinner"

// interface RecommendedMoviesProps {
//   allMovies: Movie[]
//   title?: string
// }

// const RecommendedMovies: React.FC<RecommendedMoviesProps> = ({ allMovies, title = "Films recommandés pour vous" }) => {
//   const { getRecommendedMovies, isRecommendationsLoading, isLoggedIn } = useUser()
//   const [recommendations, setRecommendations] = useState<Movie[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchRecommendations = async () => {
//       if (!isLoggedIn) {
//         // Si l'utilisateur n'est pas connecté, afficher les films populaires
//         setRecommendations(allMovies.slice(0, 10))
//         setLoading(false)
//         return
//       }

//       try {
//         setLoading(true)
//         setError(null)

//         // Utiliser la fonction de recommandation du contexte utilisateur
//         const recommendedMovies = await getRecommendedMovies(allMovies)

//         if (recommendedMovies.length === 0) {
//           // Si aucune recommandation, afficher un message
//           setError("Aucune recommandation disponible pour le moment.")
//         } else {
//           setRecommendations(recommendedMovies)
//         }
//       } catch (err) {
//         console.error("Erreur lors de la récupération des recommandations:", err)
//         setError("Impossible de charger les recommandations.")
//         // Fallback aux films populaires
//         setRecommendations(allMovies.slice(0, 10))
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchRecommendations()
//   }, [allMovies, getRecommendedMovies, isLoggedIn])

//   if (loading || isRecommendationsLoading) {
//     return (
//       <div className="my-8">
//         <h2 className="text-2xl font-bold mb-4">{title}</h2>
//         <div className="flex justify-center items-center h-64">
//           <Spinner size="lg" />
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="my-8">
//         <h2 className="text-2xl font-bold mb-4">{title}</h2>
//         <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">{error}</div>
//       </div>
//     )
//   }

//   return (
//     <div className="my-8">
//       <h2 className="text-2xl font-bold mb-4">{title}</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//         {recommendations.map((movie) => (
//           <MovieCard key={movie.id} movie={movie} />
//         ))}
//       </div>
//     </div>
//   )
// }

// export default RecommendedMovies
