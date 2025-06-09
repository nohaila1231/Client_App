import type { Movie } from "../types/movie"
import { getPopularMovies, searchMovies } from "./api"

// Type pour les messages du chat
type ChatMessage = {
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: Date
  movies?: Movie[]
}

// Génère un ID de message aléatoire
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

// Classe pour maintenir le contexte de la conversation
class ConversationContext {
  private messages: ChatMessage[] = []
  private maxContextSize = 12

  constructor(initialMessages: ChatMessage[] = []) {
    this.messages = initialMessages
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message)
    if (this.messages.length > this.maxContextSize) {
      this.messages.shift()
    }
  }

  getContext(): ChatMessage[] {
    return [...this.messages]
  }

  getFormattedHistory(): string {
    return this.messages.map((msg) => `${msg.sender === "user" ? "Utilisateur" : "Assistant"}: ${msg.text}`).join("\n")
  }
}

// Création d'une instance de contexte persistante au niveau du module
const globalContext = new ConversationContext()

// Base de connaissances pour les réponses
const movieKnowledge = {
  genres: {
    action: ["John Wick", "Mad Max: Fury Road", "Mission Impossible", "Fast & Furious"],
    comédie: ["The Grand Budapest Hotel", "Superbad", "Anchorman", "Borat"],
    drame: ["The Shawshank Redemption", "Forrest Gump", "The Godfather", "Schindler's List"],
    horreur: ["The Conjuring", "Hereditary", "Get Out", "A Quiet Place"],
    "sci-fi": ["Blade Runner 2049", "Interstellar", "The Matrix", "Inception"],
    romance: ["The Notebook", "Titanic", "La La Land", "Before Sunset"],
  },

  responses: {
    greeting: [
      "Salut ! Je suis là pour t'aider à découvrir de super films. Qu'est-ce qui t'intéresse ?",
      "Hello ! Prêt à explorer le monde du cinéma ? Dis-moi quel genre de film tu cherches !",
      "Coucou ! Je suis ton guide cinéma personnel. Quel type de film te ferait plaisir ?",
    ],

    recommendation: [
      "Voici quelques films que je te recommande vivement :",
      "J'ai trouvé ces pépites pour toi :",
      "Ces films devraient te plaire :",
      "Voici ma sélection spéciale pour toi :",
    ],

    movieInfo: [
      "Voici ce que je peux te dire sur ce film :",
      "Laisse-moi te parler de ce film :",
      "C'est un excellent choix ! Voici les infos :",
    ],

    fallback: [
      "Hmm, peux-tu être plus précis ? Tu cherches des recommandations ou des infos sur un film ?",
      "Je ne suis pas sûr de comprendre. Tu veux que je te recommande des films ou que je te parle d'un film en particulier ?",
      "Peux-tu reformuler ? Je peux te recommander des films ou te donner des infos sur un film spécifique !",
    ],
  },
}

// Fonction pour obtenir une réponse aléatoire
const getRandomResponse = (responses: string[]): string => {
  return responses[Math.floor(Math.random() * responses.length)]
}

// Fonction pour analyser l'intention de l'utilisateur
const analyzeIntent = (message: string): { intent: string; entities: string[] } => {
  const lowerMessage = message.toLowerCase()

  // Mots-clés pour les salutations
  const greetingKeywords = ["salut", "bonjour", "hello", "coucou", "bonsoir", "hey"]

  // Mots-clés pour les recommandations
  const recommendationKeywords = [
    "recommande",
    "suggère",
    "conseil",
    "à voir",
    "regarder",
    "film",
    "movie",
    "recommend",
    "suggest",
    "watch",
    "similar",
    "comme",
    "similaire",
  ]

  // Mots-clés pour les informations
  const infoKeywords = [
    "parle-moi de",
    "info sur",
    "synopsis",
    "résumé",
    "c'est quoi",
    "tell me about",
    "what is",
    "plot",
    "about",
  ]

  // Genres de films
  const genreKeywords = Object.keys(movieKnowledge.genres)

  // Analyser l'intention
  if (greetingKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return { intent: "greeting", entities: [] }
  }

  if (recommendationKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    const detectedGenres = genreKeywords.filter((genre) => lowerMessage.includes(genre))
    return { intent: "recommendation", entities: detectedGenres }
  }

  if (infoKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    const movieTitle = extractMovieMention(message)
    return { intent: "info", entities: movieTitle ? [movieTitle] : [] }
  }

  // Vérifier si c'est une demande de genre spécifique
  const detectedGenres = genreKeywords.filter((genre) => lowerMessage.includes(genre))
  if (detectedGenres.length > 0) {
    return { intent: "recommendation", entities: detectedGenres }
  }

  return { intent: "fallback", entities: [] }
}

// Fonction principale de traitement des messages
export const processMessage = async (userMessage: string): Promise<ChatMessage> => {
  // Ajouter le message de l'utilisateur au contexte
  const userChatMessage: ChatMessage = {
    id: generateId(),
    sender: "user",
    text: userMessage,
    timestamp: new Date(),
  }
  globalContext.addMessage(userChatMessage)

  try {
    // Analyser l'intention de l'utilisateur
    const { intent, entities } = analyzeIntent(userMessage)

    let responseText = ""
    let movies: Movie[] = []

    switch (intent) {
      case "greeting":
        responseText = getRandomResponse(movieKnowledge.responses.greeting)
        // Ajouter quelques films populaires pour commencer
        movies = (await getPopularMovies()).slice(0, 4)
        break

      case "recommendation":
        responseText = getRandomResponse(movieKnowledge.responses.recommendation)

        if (entities.length > 0) {
          // Recommandations basées sur le genre
          const genre = entities[0]
          const movieTitles = movieKnowledge.genres[genre as keyof typeof movieKnowledge.genres]

          if (movieTitles) {
            responseText += ` Voici des ${genre}s que tu vas adorer !`
            // Rechercher ces films dans l'API
            for (const title of movieTitles.slice(0, 3)) {
              try {
                const searchResults = await searchMovies(title)
                if (searchResults.length > 0) {
                  movies.push(searchResults[0])
                }
              } catch (error) {
                console.log(`Erreur lors de la recherche de ${title}:`, error)
              }
            }
          }
        }

        // Si aucun film trouvé par genre, utiliser les films populaires
        if (movies.length === 0) {
          const movieMention = extractMovieMention(userMessage)
          if (movieMention) {
            try {
              const similarMovies = await searchMovies(movieMention)
              movies = similarMovies.slice(0, 5)
              responseText += ` Basé sur "${movieMention}", voici ce que je te propose :`
            } catch (error) {
              console.log("Erreur lors de la recherche de films similaires:", error)
            }
          }

          if (movies.length === 0) {
            movies = (await getPopularMovies()).slice(0, 5)
            responseText += " Voici les films les plus populaires du moment :"
          }
        }
        break

      case "info":
        responseText = getRandomResponse(movieKnowledge.responses.movieInfo)

        if (entities.length > 0) {
          const movieTitle = entities[0]
          try {
            const movieResults = await searchMovies(movieTitle)
            if (movieResults.length > 0) {
              movies = [movieResults[0]]
              const movie = movieResults[0]
              responseText += ` "${movie.title}" est un excellent film ! ${movie.overview ? movie.overview.substring(0, 150) + "..." : "Un film à découvrir absolument !"}`
            } else {
              responseText = `Désolé, je n'ai pas trouvé d'informations sur "${movieTitle}". Peux-tu vérifier l'orthographe ?`
            }
          } catch (error) {
            console.log("Erreur lors de la recherche d'informations:", error)
            responseText = `Je n'arrive pas à récupérer les infos sur "${movieTitle}" pour le moment. Réessaie dans quelques instants !`
          }
        } else {
          responseText = "De quel film veux-tu que je te parle ? Donne-moi le titre !"
        }
        break

      default:
        responseText = getRandomResponse(movieKnowledge.responses.fallback)
        // Ajouter quelques suggestions
        movies = (await getPopularMovies()).slice(0, 3)
        break
    }

    // Créer la réponse du bot
    const botResponse: ChatMessage = {
      id: generateId(),
      sender: "bot",
      text: responseText,
      timestamp: new Date(),
      movies: movies.length > 0 ? movies : undefined,
    }

    // Ajouter la réponse au contexte
    globalContext.addMessage(botResponse)

    return botResponse
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error)

    // Réponse de secours en cas d'échec
    const errorResponse: ChatMessage = {
      id: generateId(),
      sender: "bot",
      text: "Oups ! J'ai eu un petit problème technique. Mais je peux quand même t'aider ! Dis-moi quel genre de film tu cherches ?",
      timestamp: new Date(),
    }

    globalContext.addMessage(errorResponse)
    return errorResponse
  }
}

// Fonction pour extraire une mention de film du message de l'utilisateur
function extractMovieMention(message: string): string | null {
  // Patterns pour détecter des mentions de films
  const patterns = [
    /comme "(.*?)"/i, // comme "Inception"
    /similaire à "(.*?)"/i, // similaire à "Matrix"
    /j'ai aimé "(.*?)"/i, // j'ai aimé "Interstellar"
    /infos sur "(.*?)"/i, // infos sur "Dune"
    /parle-moi de "(.*?)"/i, // parle-moi de "Avatar"
    /like "(.*?)"/i, // like "The Godfather"
    /similar to "(.*?)"/i, // similar to "Pulp Fiction"
    /information about "(.*?)"/i, // information about "Star Wars"
    /what is "(.*?)"/i, // what is "Tenet"
    /à propos de "(.*?)"/i, // à propos de "Dune"
    /sur le film "(.*?)"/i, // sur le film "Avatar"
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      // Nettoyage de base pour enlever les caractères non désirés
      return match[1].trim().replace(/[.,!?;:]$/, "")
    }
  }

  // Si aucun pattern avec guillemets, essayer sans guillemets (plus risqué)
  const simplePatterns = [
    /parle-moi de ([\w\s]+?)(?:\s|$)/i,
    /infos sur ([\w\s]+?)(?:\s|$)/i,
    /à propos de ([\w\s]+?)(?:\s|$)/i,
  ]

  for (const pattern of simplePatterns) {
    const match = message.match(pattern)
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim().replace(/[.,!?;:]$/, "")
    }
  }

  return null
}
