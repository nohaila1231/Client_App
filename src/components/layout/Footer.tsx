import { Link } from "react-router-dom"
import {
  Film,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Heart,
  ArrowRight,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  Users,
  Star,
} from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Liste des genres pour la section catégories
  const genres = [
    "Action",
    "Aventure",
    "Animation",
    "Comédie",
    "Crime",
    "Documentaire",
    "Drame",
    "Fantastique",
    "Horreur",
    "Romance",
    "Science-Fiction",
    "Thriller",
  ]

  // Sélection de quelques genres pour affichage dans le footer
  const featuredGenres = genres.slice(0, 6)

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-900">
      <div className="container mx-auto px-4">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo et Description */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-red-600 to-red-800 p-2 rounded-full">
                <Film size={24} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">
                  <span className="text-red-600">Ciné</span>
                  <span className="text-white">Soul</span>
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm mb-6">
              Découvrez, explorez et partagez votre passion pour le cinéma avec CinéSoul. Notre plateforme vous offre
              une expérience cinématographique immersive et personnalisée.
            </p>

            <div className="flex space-x-3">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
              >
                <Twitter size={16} className="text-gray-300" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
              >
                <Facebook size={16} className="text-gray-300" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
              >
                <Instagram size={16} className="text-gray-300" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
              >
                <Globe size={16} className="text-gray-300" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative inline-block">
              Navigation
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-red-600"></span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center text-sm"
                >
                  <ArrowRight size={14} className="mr-2 text-red-600" />
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center text-sm"
                >
                  <ArrowRight size={14} className="mr-2 text-red-600" />
                  Ma Liste
                </Link>
              </li>
              <li>
                <Link
                  to="/TopRatedMoviesPage"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center text-sm"
                >
                  <ArrowRight size={14} className="mr-2 text-red-600" />
                  Top Films
                </Link>
              </li>
              <li>
                <Link
                  to="/nouveautes"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center text-sm"
                >
                  <ArrowRight size={14} className="mr-2 text-red-600" />
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link
                  to="/a-propos"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center text-sm"
                >
                  <ArrowRight size={14} className="mr-2 text-red-600" />À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center text-sm"
                >
                  <ArrowRight size={14} className="mr-2 text-red-600" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative inline-block">
              Genres
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-red-600"></span>
            </h3>
            <ul className="space-y-2">
              {featuredGenres.map((genre, index) => (
                <li key={index}>
                  <Link
                    to={`/genre/${genre.toLowerCase()}`}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center text-sm"
                  >
                    <ArrowRight size={14} className="mr-2 text-red-600" />
                    {genre}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/genres"
                  className="text-red-500 hover:text-red-400 transition-colors duration-300 flex items-center text-sm mt-1"
                >
                  <span>Tous les genres</span>
                  <ChevronRight size={14} className="ml-1" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative inline-block">
              Contact
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-red-600"></span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-400 text-sm">contact@cinesoul.com</span>
              </li>
              <li className="flex items-start">
                <Phone size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-400 text-sm">Paris, France</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-white text-sm font-medium mb-3">Légal</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/confidentialite"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 text-xs flex items-center"
                >
                  <Shield size={12} className="mr-1 text-red-600" />
                  Confidentialité
                </Link>
                <Link
                  to="/conditions"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 text-xs flex items-center"
                >
                  <FileText size={12} className="mr-1 text-red-600" />
                  Conditions
                </Link>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 text-xs flex items-center"
                >
                  <HelpCircle size={12} className="mr-1 text-red-600" />
                  FAQ
                </Link>
                <Link
                  to="/equipe"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 text-xs flex items-center"
                >
                  <Users size={12} className="mr-1 text-red-600" />
                  Équipe
                </Link>
              </div>
            </div>
          </div>
        </div>


        {/* Copyright */}
        <div className="border-t border-gray-900 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {currentYear} CinéSoul. Tous droits réservés.</p>
          <p className="text-gray-500 text-sm flex items-center">
            Conçu avec <Heart size={12} className="text-red-600 mx-1" fill="currentColor" /> par l'équipe CinéSoul
          </p>
        </div>

        {/* TMDB Attribution */}
        <div className="text-center mt-6">
        <p className="text-xs text-gray-600">
             Un projet cinéphile signé Nohaila Lourak 🎥  
             <br />
             Les films et séries sont proposés grâce à l’API de TMDB.
        </p>

        </div>
      </div>
    </footer>
  )
}

export default Footer
