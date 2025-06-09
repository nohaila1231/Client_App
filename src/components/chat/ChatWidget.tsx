"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Bot } from "lucide-react"
import { processMessage } from "../../services/chatbotService"
import type { Movie } from "../../types/movie"

// Interface for chat messages
interface ChatMessage {
  id: string | number
  role: "user" | "assistant"
  content: string
  movies?: Movie[]
}

// Chat interface component with movie recommendations
const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Salut ! Je suis ton assistant cinéma personnel. Dis-moi quel genre de film tu cherches ou demande-moi des recommandations ! 🎬",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Show typing indicator
    setIsTyping(true)

    try {
      // Process message using the chat processor
      const response = await processMessage(inputValue)

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: response.id,
        role: "assistant",
        content: response.text,
        movies: response.movies,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      // Add error message if processing fails
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Oups ! J'ai eu un petit souci technique, mais je suis toujours là pour t'aider ! Dis-moi quel genre de film tu cherches ? 😊",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      scrollToBottom()
    }
  }

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // Effect to scroll automatically on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Message area with scrolling and dynamic height */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-red-600 text-white rounded-br-none"
                  : "bg-gray-900 text-gray-100 border border-red-800 rounded-bl-none"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Movie recommendations section */}
        {messages.length > 0 &&
          messages[messages.length - 1].movies &&
          messages[messages.length - 1].movies!.length > 0 && (
            <div className="mt-4">
              <h4 className="text-gray-400 text-sm mb-2">Films recommandés:</h4>
              <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-custom">
                {messages[messages.length - 1].movies!.map((movie) => (
                  <div key={movie.id} className="flex-shrink-0 w-32">
                    <div className="bg-gray-800 rounded-lg overflow-hidden border border-red-900">
                      {movie.poster_path ? (
                        <img
                          src={
                            movie.poster_path.startsWith("http")
                              ? movie.poster_path
                              : `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                          }
                          alt={movie.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=192&width=128"
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400 text-xs text-center px-2">Pas d'image</span>
                        </div>
                      )}
                      <div className="p-2">
                        <h5 className="text-white text-sm font-medium truncate">{movie.title}</h5>
                        <p className="text-gray-400 text-xs">{movie.release_date?.split("-")[0] || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-900 text-gray-100 border border-red-800 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area with fixed but adaptive height */}
      <div className="border-t border-red-900 p-4 bg-black">
        <div className="flex items-center bg-gray-900 rounded-lg p-2 ring-2 ring-red-700">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Demande-moi des recommandations de films..."
            className="flex-1 bg-transparent text-white p-2 focus:outline-none h-10"
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 p-3 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors flex items-center justify-center"
            disabled={inputValue.trim() === ""}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Essaie : "Recommande-moi des films d'action" ou "Parle-moi de Inception"
        </div>
      </div>
    </div>
  )
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [introStep, setIntroStep] = useState(0)
  const [pulsing, setPulsing] = useState(true)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Pulsing effect to attract attention
    const pulseInterval = setInterval(() => {
      if (!isOpen) {
        setPulsing((prev) => !prev)
      }
    }, 2000)

    return () => clearInterval(pulseInterval)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      // Introduction animation in multiple steps
      setShowIntro(true)
      setIntroStep(1)

      const step1Timer = setTimeout(() => {
        setIntroStep(2)
      }, 1000)

      const endTimer = setTimeout(() => {
        setShowIntro(false)
      }, 2000)

      return () => {
        clearTimeout(step1Timer)
        clearTimeout(endTimer)
      }
    }
  }, [isOpen])

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
  }

  // Calculate optimal chatbot height based on window size
  const getChatbotHeight = () => {
    const maxHeight = 550 // Maximum desired height
    const minHeight = 300 // Minimum acceptable height
    const padding = 32 // Bottom padding (2 x 16px)

    // Calculate available height (90% of window height)
    const availableHeight = windowSize.height * 0.9

    // Choose the most appropriate height
    if (availableHeight >= maxHeight) {
      return maxHeight
    } else if (availableHeight >= minHeight) {
      return availableHeight - padding
    } else {
      return minHeight
    }
  }

  // Calculate optimal chatbot position
  const getChatbotPosition = () => {
    const chatbotHeight = getChatbotHeight()
    const defaultBottom = 32 // 8 * 4 = 32px (bottom-8)

    // If window height is too small, adjust position
    if (windowSize.height < chatbotHeight + defaultBottom + 50) {
      return 16 // Reduce bottom margin
    }
    return defaultBottom
  }

  return (
    <div
      className="fixed z-50 font-sans"
      style={{
        bottom: getChatbotPosition(),
        right: "32px", // 8 * 4 = 32px (right-8)
      }}
    >
      {/* Floating button with robot icon */}
      {!isOpen && (
        <div className="relative">
          {/* Pulsing effect */}
          <div
            className={`absolute inset-0 rounded-full bg-red-600 opacity-20 blur transition-transform duration-1000 ease-in-out ${pulsing ? "scale-150" : "scale-100"}`}
          ></div>

          <button
            onClick={toggleChatbot}
            className="relative flex items-center p-4 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none transition-all duration-300 group"
            style={{
              boxShadow: "0 4px 20px rgba(185, 28, 28, 0.4)",
            }}
          >
            <Bot size={24} className="group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Chatbot window */}
      {isOpen && (
        <>
          {/* Overlay with blur effect */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={toggleChatbot}
          ></div>

          {/* Simple introduction animation */}
          {showIntro && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-black bg-opacity-90 rounded-xl p-12 overflow-hidden relative">
                <div
                  className={`transition-all duration-700 transform ${introStep >= 1 ? "opacity-100" : "opacity-0 scale-95"}`}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center mx-auto">
                    <Bot size={40} className="text-white" />
                  </div>
                </div>

                <div
                  className={`mt-6 transition-all duration-700 delay-300 transform ${introStep >= 2 ? "opacity-100" : "opacity-0"}`}
                >
                  <h2 className="text-2xl font-bold text-red-500 text-center">ASSISTANT CINÉMA</h2>
                </div>
              </div>
            </div>
          )}

          {/* Main chatbot interface - dynamic height */}
          <div
            className="fixed bg-black rounded-lg z-50 animate-emerge flex flex-col chat-container"
            style={{
              height: `${getChatbotHeight()}px`,
              width: "384px", // 96 * 4 = 384px (w-96)
              boxShadow: "0 10px 40px rgba(185, 28, 28, 0.3)",
              bottom: getChatbotPosition(),
              right: "32px", // 8 * 4 = 32px (right-8)
            }}
          >
            {/* Header with red/black gradient */}
            <div className="bg-gradient-to-r from-red-800 to-black py-4 px-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-white font-bold">ASSISTANT CINÉMA</h3>
                  <p className="text-xs text-gray-300">Votre guide de films</p>
                </div>
              </div>
              <button
                onClick={toggleChatbot}
                className="p-2 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors duration-200"
              >
                <X size={18} className="text-gray-300" />
              </button>
            </div>

            {/* Chatbot body with interface */}
            <ChatInterface />
          </div>
        </>
      )}

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes emerge {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-emerge {
          animation: emerge 0.4s ease-out forwards;
        }
        
        /* Custom scrollbar style */
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #111111;
          border-radius: 10px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #7f1d1d;
          border-radius: 10px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  )
}

export default ChatbotWidget
