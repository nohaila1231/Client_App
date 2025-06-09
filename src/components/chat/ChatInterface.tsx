import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Film, Clock, User } from 'lucide-react';
import { processMessage } from '../../services/chatbotService';

// Types
type Movie = {
  id: string;
  title: string;
  poster: string;
  year: number;
  rating: number;
};

type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  movies?: Movie[];
};

// Carte de film professionelle et élégante
const PremiumMovieCard = ({ movie }) => {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-md border border-gray-800 hover:border-gray-700 transition-all duration-300">
      <div className="h-36 bg-gray-800 relative">
        {movie.poster ? (
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Film size={30} className="text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded">
          {movie.year}
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-white font-medium text-sm line-clamp-1">{movie.title}</h4>
        <div className="flex items-center mt-1">
          <div className="flex text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(movie.rating / 2) ? 'text-yellow-500' : 'text-gray-700'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">{movie.rating}/10</span>
        </div>
      </div>
    </div>
  );
};

const PremiumChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Bienvenue dans votre espace cinéma exclusif. Je suis votre assistant personnel dédié aux recommandations cinématographiques. Comment puis-je vous guider aujourd'hui?",
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simuler un délai pour démontrer l'état de chargement
      setTimeout(async () => {
        try {
          const botResponse = await processMessage(input);
          setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
          console.error('Error processing message:', error);
          setMessages((prev) => [
            ...prev,
            {
              id: 'error',
              sender: 'bot',
              text: "Je suis désolé, j'ai rencontré un problème lors du traitement de votre demande. Pourriez-vous reformuler ou essayer une autre question?",
              timestamp: new Date(),
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  // Exemple de données pour illustrer la présentation
  const sampleMovies = [
    {
      id: '1',
      title: 'Inception',
      poster: '/api/placeholder/160/200',
      year: 2010,
      rating: 8.8
    },
    {
      id: '2',
      title: 'The Dark Knight',
      poster: '/api/placeholder/160/200',
      year: 2008,
      rating: 9.0
    }
  ];
  
  return (
    <div className="flex flex-col h-[calc(100%-64px)] bg-gray-100">
      {/* Zone de messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-100"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center mr-2 mt-1">
                  <Film size={16} className="text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-lg p-4 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <p className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {message.text}
                </p>
                
                {/* Afficher les recommandations de films si disponibles */}
                {message.sender === 'bot' && sampleMovies && sampleMovies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium mb-2 text-gray-600">Films recommandés</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleMovies.map((movie) => (
                        <PremiumMovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={`text-xs mt-1 flex items-center justify-end ${
                  message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  <Clock size={10} className="mr-1" />
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center mr-2">
                <Film size={16} className="text-white" />
              </div>
              <div className="bg-white text-gray-800 rounded-lg p-4 max-w-[75%] shadow-sm">
                <div className="flex items-center">
                  <Loader size={14} className="animate-spin mr-2 text-gray-500" />
                  <p className="text-sm text-gray-500">En cours de recherche...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Zone de saisie */}
      <div className="p-4 bg-gray-100 border-t border-gray-200">
        <form onSubmit={handleSend} className="w-full">
          <div className="flex items-center w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question sur le cinéma..."
              className="flex-1 p-3 bg-transparent focus:outline-none text-gray-800"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`p-3 transition-colors ${isLoading ? 'bg-gray-300 text-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2 pl-1">
          Essayez "Suggérez-moi des films de Christopher Nolan" ou "Quels sont les meilleurs films de 2024?"
        </p>
      </div>
    </div>
  );
};

export default PremiumChatInterface;