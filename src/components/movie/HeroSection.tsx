import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../../services/api';
import { Movie } from '../../types/movie';
import { Play, Plus, Check, Star, Clock, Calendar, ChevronRight, ChevronLeft, Volume2, VolumeX, Info, Award, Users, Eye } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSectionProps {
  movies: Movie[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useUser();
  
  const currentMovie = movies[currentIndex];
  const AUTOPLAY_DURATION = 7000;

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (isHovering || showDetails) return;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(0);
    
    const updateInterval = 50;
    const incrementPerUpdate = (updateInterval / AUTOPLAY_DURATION) * 100;
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + incrementPerUpdate;
        if (newProgress >= 100) {
          setCurrentIndex(prevIndex => (prevIndex + 1) % movies.length);
          return 0;
        }
        return newProgress;
      });
    }, updateInterval);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, isHovering, showDetails, movies.length]);

  // Video handling
  useEffect(() => {
    setIsVideoReady(false);
    
    if (videoRef.current) {
      const handleVideoReady = () => {
        setIsVideoReady(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {
            console.log("Autoplay prevented");
          });
        }
      };
      
      videoRef.current.addEventListener('canplaythrough', handleVideoReady);
      
      return () => {
        videoRef.current?.removeEventListener('canplaythrough', handleVideoReady);
      };
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(0);
    setCurrentIndex(prev => (prev + 1) % movies.length);
  };

  const handlePrev = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(0);
    setCurrentIndex(prev => (prev - 1 + movies.length) % movies.length);
  };

  const handleWatchlistClick = () => {
    if (isInWatchlist(currentMovie.id)) {
      removeFromWatchlist(currentMovie.id);
    } else {
      addToWatchlist(currentMovie);
    }
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Interactive cursor effect - Rouge */}
      <div 
        className="fixed pointer-events-none z-50 w-4 h-4 rounded-full border border-red-500/50 transition-all duration-300 ease-out mix-blend-difference"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: isHovering ? 'scale(3)' : 'scale(1)',
        }}
      />

      {/* Geometric background pattern - Rouge et Noir */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-red-950/20 to-black" />
        
        {/* Animated geometric shapes - Rouge */}
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 opacity-10"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="w-full h-full border border-red-500/30 rotate-45 rounded-3xl" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 left-20 w-64 h-64 opacity-10"
          animate={{ 
            rotate: -360,
            y: [-20, 20, -20],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="w-full h-full border border-red-500/30 rounded-full" />
          <div className="absolute inset-8 border border-red-400/20 rounded-full" />
        </motion.div>
      </div>

      {/* Main background with advanced layering - Rouge */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie?.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2 }}
          >
            {/* Video layer */}
            {currentMovie?.video_url && isVideoReady && (
              <video 
                ref={videoRef}
                className="absolute w-full h-full object-cover opacity-40"
                muted={isMuted}
                loop
                playsInline
              >
                <source src={currentMovie?.video_url} type="video/mp4" />
              </video>
            )}
            
            {/* Image layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{
                backgroundImage: `url(${getImageUrl(currentMovie?.backdrop_path, 'backdrop')})`,
              }}
            />
            
            {/* Dynamic overlay - Rouge et Noir */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-gray-900/90 to-black/95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Layout - Split Design */}
      <div className="relative z-20 min-h-screen flex">
        {/* Left Panel - Movie Info */}
        <div className="flex-1 flex items-center justify-start p-8 lg:p-16">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie?.id}
                initial={{ opacity: 0, y: 40, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -40, rotateX: -15 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Category Badge - Rouge */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 mb-6"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse" />
                  <span className="text-red-400 font-medium tracking-widest uppercase text-sm">
                    {currentMovie?.genres?.[0]?.name || 'Film'}
                  </span>
                  {currentMovie?.is_premium && (
                    <>
                      <div className="w-1 h-1 bg-white/50 rounded-full" />
                      <span className="text-yellow-400 font-bold text-sm">PREMIUM</span>
                    </>
                  )}
                </motion.div>

                {/* Movie Title with Kinetic Typography - Rouge */}
                <h1 className="text-6xl lg:text-8xl font-black text-white mb-6 leading-none">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    {currentMovie?.title.split(' ').map((word, index) => (
                      <motion.span
                        key={index}
                        className="inline-block mr-4"
                        initial={{ y: 100, opacity: 0, rotateX: -90 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        transition={{ 
                          delay: 0.5 + index * 0.15,
                          duration: 0.8,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        style={{
                          textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fecaca 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                    
                    {/* Decorative underline - Rouge */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.2, duration: 1 }}
                      className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 origin-left rounded-full mt-4"
                    />
                  </motion.div>
                </h1>

                {/* Enhanced Stats Row - Rouge */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap items-center gap-8 mb-8"
                >
                  <div className="flex items-center space-x-3 bg-red-950/30 backdrop-blur-xl px-4 py-2 rounded-full border border-red-500/20">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600">
                      <Star size={16} className="text-white" fill="currentColor" />
                    </div>
                    <span className="text-white font-semibold">{currentMovie?.vote_average?.toFixed(1)}</span>
                    <span className="text-white/60 text-sm">/10</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-red-950/30 backdrop-blur-xl px-4 py-2 rounded-full border border-red-500/20">
                    <Clock size={16} className="text-red-400" />
                    <span className="text-white font-medium">{formatRuntime(currentMovie?.runtime)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-red-950/30 backdrop-blur-xl px-4 py-2 rounded-full border border-red-500/20">
                    <Calendar size={16} className="text-red-300" />
                    <span className="text-white font-medium">
                      {new Date(currentMovie?.release_date || '').getFullYear()}
                    </span>
                  </div>
                </motion.div>

                {/* Overview with Typography Focus */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mb-10"
                >
                  <p className="text-xl text-white/80 font-light leading-relaxed mb-4">
                    {currentMovie?.overview?.length > 160
                      ? `${currentMovie.overview.slice(0, 160).trim()}...`
                      : currentMovie?.overview}
                  </p>
                  
                  <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="group flex items-center space-x-2 text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    <span>Plus de détails</span>
                    <motion.div
                      animate={{ rotate: showDetails ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight size={16} />
                    </motion.div>
                  </button>
                </motion.div>

                {/* Action Buttons - Rouge et Noir */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-wrap gap-4"
                >
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-500 flex items-center shadow-2xl shadow-red-500/25 hover:shadow-red-500/40"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                    
                    <div className="relative z-10 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Play size={18} className="text-white fill-white ml-0.5" />
                      </div>
                      <span>Regarder</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleWatchlistClick}
                    className="group relative overflow-hidden bg-gray-900/70 backdrop-blur-xl hover:bg-gray-800/70 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center border border-red-500/30 hover:border-red-400/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-red-950/50 flex items-center justify-center">
                        {isInWatchlist(currentMovie?.id) ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Plus size={18} className="text-red-400" />
                        )}
                      </div>
                      <span>
                        {isInWatchlist(currentMovie?.id) ? 'Ajouté' : 'Ma Liste'}
                      </span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="group relative overflow-hidden bg-gray-900/70 backdrop-blur-xl hover:bg-gray-800/70 text-white p-4 rounded-2xl transition-all duration-300 border border-red-500/30 hover:border-red-400/50"
                  >
                    {isMuted ? (
                      <VolumeX size={20} className="text-red-400" />
                    ) : (
                      <Volume2 size={20} className="text-red-400" />
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Movie Poster with Advanced Effects - Rouge */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-16">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie?.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative group"
              >
                {/* Floating poster container */}
                <motion.div
                  animate={{ 
                    y: [-8, 8, -8],
                    rotateX: [2, -2, 2],
                    rotateY: [-1, 1, -1],
                  }}
                  transition={{ 
                    duration: 12, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                  }}
                  className="relative w-96 h-[580px] rounded-3xl overflow-hidden shadow-2xl"
                >
                  {/* Poster image */}
                  <img 
                    src={getImageUrl(currentMovie?.poster_path, 'poster')} 
                    alt={currentMovie?.title} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Holographic overlay - Rouge */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-red-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Light reflection - Rouge */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-300/30 via-transparent to-transparent opacity-30"
                    animate={{ 
                      background: [
                        'linear-gradient(45deg, rgba(248,113,113,0.3) 0%, transparent 30%, transparent 100%)',
                        'linear-gradient(225deg, rgba(248,113,113,0.3) 0%, transparent 30%, transparent 100%)',
                        'linear-gradient(45deg, rgba(248,113,113,0.3) 0%, transparent 30%, transparent 100%)'
                      ]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                </motion.div>
                
                {/* Ambient glow - Rouge */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 via-red-500/30 to-red-700/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                
                {/* Floating info cards - Rouge */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="absolute -right-8 top-20 bg-red-950/70 backdrop-blur-xl p-4 rounded-2xl border border-red-500/30"
                >
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-red-400" />
                    <span className="text-white text-sm font-medium">8.5K vues</span>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7 }}
                  className="absolute -right-8 bottom-32 bg-red-950/70 backdrop-blur-xl p-4 rounded-2xl border border-red-500/30"
                >
                  <div className="flex items-center space-x-2">
                    <Award size={16} className="text-yellow-400" />
                    <span className="text-white text-sm font-medium">Primé</span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Rouge et Noir */}
      <div className="absolute bottom-8 left-0 right-0 z-30 px-8">
        <div className="flex justify-between items-end">
          {/* Progress indicators - Rouge */}
          <div className="flex items-center space-x-3">
            {movies.map((movie, idx) => (
              <button
                key={movie.id}
                onClick={() => setCurrentIndex(idx)}
                className="relative group"
              >
                <div className={`h-1 rounded-full transition-all duration-500 ${
                  idx === currentIndex 
                    ? 'w-12 bg-gradient-to-r from-red-500 to-red-600' 
                    : 'w-6 bg-white/20 hover:bg-red-400/40'
                }`}>
                  {idx === currentIndex && (
                    <div 
                      className="h-1 bg-red-300/70 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* Navigation controls - Rouge */}
          <div className="flex space-x-3">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-red-950/50 backdrop-blur-xl hover:bg-red-900/50 flex items-center justify-center transition-all duration-300 border border-red-500/30"
            >
              <ChevronLeft size={20} className="text-red-400" />
            </button>
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-red-950/50 backdrop-blur-xl hover:bg-red-900/50 flex items-center justify-center transition-all duration-300 border border-red-500/30"
            >
              <ChevronRight size={20} className="text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Extended details panel - Rouge et Noir */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-x-0 bottom-0 z-40 bg-gray-950/95 backdrop-blur-xl border-t border-red-500/20 p-8"
          >
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Synopsis complet</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{currentMovie?.overview}</p>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentMovie?.genres?.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-red-950/50 border border-red-500/30 rounded-full text-white/80 text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Informations</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Date de sortie</span>
                      <span className="text-white">{new Date(currentMovie?.release_date || '').toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Note</span>
                      <span className="text-white">{currentMovie?.vote_average?.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;