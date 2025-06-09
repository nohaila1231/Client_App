import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [rememberMe, setRememberMe] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [auth, setAuth] = useState(null);

  // Initialisation de Firebase
  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyDkSqyff-396R7sLcH-jT6_SdXtjYxRyaw",
      authDomain: "recommendationffilm.firebaseapp.com",
      projectId: "recommendationffilm",
      storageBucket: "recommendationffilm.appspot.com",
      messagingSenderId: "1070862765035",
      appId: "1:1070862765035:web:cbcde6514ebf34e385e7ae",
      measurementId: "G-LTP0P71S3S"
    };

    try {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setAuth(authInstance);
      
      // Vérifier si l'utilisateur revient d'une redirection
      getRedirectResult(authInstance)
        .then(async (result) => {
          if (result?.user) {
            try {
              // L'utilisateur s'est connecté avec succès via la redirection
              const user = result.user;
              const idToken = await user.getIdToken();
              const backendResponse = await authenticateWithBackend({
                idToken: idToken
              });

              if (!backendResponse.success) {
                throw new Error(backendResponse.message);
              }
              
              setSuccess(true);
              setTimeout(() => {
                window.location.href = '/';
              }, 1500);
            } catch (err) {
              console.error("Erreur après redirection:", err);
              setError(err.message || "Une erreur est survenue lors de la connexion");
            } finally {
              setIsLoading(false);
            }
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération du résultat de redirection:", err);
          if (err.code !== 'auth/credential-already-in-use') {
            setError("Erreur lors de la récupération du résultat: " + err.message);
          }
        });
    } catch (error) {
      console.error("Erreur d'initialisation Firebase:", error);
      setError("Erreur lors de l'initialisation de Firebase. Veuillez réessayer plus tard.");
    }
  }, []);

  // Gestion de la connexion avec email/mot de passe
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase n'est pas initialisé");
      }
      
      // Authentification avec Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtenir le token d'ID pour le backend
      const idToken = await user.getIdToken();

      // Authentification avec le backend
      const backendResponse = await authenticateWithBackend({
        idToken: idToken
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || "Erreur d'authentification avec le backend");
      }

      // Connexion réussie
      setSuccess(true);
      
      // Enregistrer l'email dans le localStorage si "Remember me" est coché
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Redirection après un court délai
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(getFirebaseErrorMessage(err) || "Identifiants incorrects. Veuillez réessayer.");
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour traduire les erreurs Firebase
  const getFirebaseErrorMessage = (error) => {
    const errorCode = error.code;
    switch (errorCode) {
      case 'auth/user-not-found':
        return "Aucun compte trouvé avec cette adresse email.";
      case 'auth/wrong-password':
        return "Mot de passe incorrect.";
      case 'auth/invalid-email':
        return "Adresse email invalide.";
      case 'auth/user-disabled':
        return "Ce compte a été désactivé.";
      case 'auth/too-many-requests':
        return "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
      default:
        return error.message;
    }
  };

  // Authentification avec le backend Flask
  const authenticateWithBackend = async (userData) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/signin',
        userData,
        {
          withCredentials: true, 
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      const data = response.data;
  
      // Stockage du token s'il existe
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token stocké avec succès dans localStorage');
      } else {
        console.error('Erreur : Token non reçu');
      }
  
      return { success: true, data };
    } catch (error) {
      console.error("Erreur backend:", error);
      
      // Axios met l’erreur dans error.response
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur d'authentification avec le backend";
  
      return { success: false, message };
    }
  };

  // Fonction pour l'authentification Google
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!auth) {
        throw new Error("Firebase n'est pas initialisé");
      }
      
      const provider = new GoogleAuthProvider();
      
      // Ajout de scopes supplémentaires si nécessaire
      provider.addScope('profile');
      provider.addScope('email');
      
      // Connexion avec popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user) {
        // Obtenir le token d'ID pour le backend
        const idToken = await user.getIdToken();
        
        // Authentification avec le backend
        const backendResponse = await authenticateWithBackend({
          idToken: idToken
        });

        if (!backendResponse.success) {
          throw new Error(backendResponse.message);
        }
      }
  
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de l'authentification Google:", err);
      
      // Si le popup est bloqué, essayer avec la redirection
      if (err.code === 'auth/popup-blocked') {
        try {
          if (!auth) {
            throw new Error("Firebase n'est pas initialisé");
          }
          
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
          // La suite de l'authentification se fera au rechargement de la page
        } catch (redirectErr) {
          setError("Erreur lors de la redirection Google: " + redirectErr.message);
        }
      } else {
        setError("Erreur lors de l'authentification Google: " + err.message);
      }
      
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour l'authentification Apple
  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!auth) {
        throw new Error("Firebase n'est pas initialisé");
      }
      
      const provider = new OAuthProvider('apple.com');
      
      // Connexion avec popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user) {
        // Obtenir le token d'ID pour le backend
        const idToken = await user.getIdToken();
        
        // Authentification avec le backend
        const backendResponse = await authenticateWithBackend({
          idToken: idToken
        });

        if (!backendResponse.success) {
          throw new Error(backendResponse.message);
        }
      }
  
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de l'authentification Apple:", err);
      
      // Si le popup est bloqué, essayer avec la redirection
      if (err.code === 'auth/popup-blocked') {
        try {
          if (!auth) {
            throw new Error("Firebase n'est pas initialisé");
          }
          
          const provider = new OAuthProvider('apple.com');
          await signInWithRedirect(auth, provider);
          // La suite de l'authentification se fera au rechargement de la page
        } catch (redirectErr) {
          setError("Erreur lors de la redirection Apple: " + redirectErr.message);
        }
      } else {
        setError("Erreur lors de l'authentification Apple: " + err.message);
      }
      
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez entrer votre adresse email pour réinitialiser votre mot de passe");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!auth) {
        throw new Error("Firebase n'est pas initialisé");
      }
      
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError('');
    } catch (err) {
      console.error("Erreur de réinitialisation:", err);
      setError(getFirebaseErrorMessage(err) || "Impossible d'envoyer l'email de réinitialisation. Vérifiez votre adresse email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger email mémorisé
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Génération de la classe du conteneur principal selon le thème
  const getContainerClasses = () => {
    const baseClasses = "w-full max-w-md mx-auto overflow-hidden shadow-2xl rounded-xl relative z-20";
    
    if (currentTheme === 'dark') {
      return `${baseClasses} bg-gradient-to-br from-gray-900 to-black`;
    }
    return `${baseClasses} bg-white`;
  };

  // Classes pour le texte basées sur le thème
  const getTextClasses = (isDark = true) => {
    return isDark ? "text-white" : "text-gray-900";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-1000 ease-in-out"
             style={{backgroundImage: `url("/api/placeholder/1920/1080")`}}></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 z-10"></div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600 rounded-full opacity-10 blur-3xl animate-pulse z-0"></div>
      
      <div className={`${getContainerClasses()} mt-20`}>
        <div className="absolute inset-0 p-0.5 rounded-xl bg-gradient-to-r from-black via-red-700 to-black opacity-70"></div>
        
        <div className="relative p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <h2 className={`text-2xl font-semibold ${getTextClasses()}`}>
              {resetPasswordMode ? 'Réinitialiser le mot de passe' : 'Connexion'}
            </h2>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-white flex items-center">
              <div className="mr-3 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-700/50 text-white flex items-center">
              <div className="mr-3 text-green-500">
                <Check className="h-5 w-5" />
              </div>
              <p>Connexion réussie! Redirection en cours...</p>
            </div>
          )}

          {resetEmailSent && (
            <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-700/50 text-white flex items-center">
              <div className="mr-3 text-blue-500">
                <Check className="h-5 w-5" />
              </div>
              <p>Un email de réinitialisation a été envoyé à votre adresse.</p>
            </div>
          )}
          
          {resetPasswordMode ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className={`block text-sm font-medium ${getTextClasses()} mb-1`}>
                    Adresse email
                  </label>
                  <div className="relative mt-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 text-white bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || resetEmailSent}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white ${resetEmailSent ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 text-sm font-medium`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : resetEmailSent ? (
                    <>
                      <Check size={18} className="mr-2" />
                      <span>Email envoyé</span>
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setResetPasswordMode(false)}
                  className={`text-sm ${getTextClasses()} hover:text-red-500 transition-colors duration-200`}
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${getTextClasses()} mb-1`}>
                    Adresse email
                  </label>
                  <div className="relative mt-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 text-white bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={`block text-sm font-medium ${getTextClasses()} mb-1`}>
                    Mot de passe
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 text-white bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-white focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-600 border-gray-700 rounded"
                  />
                  <label htmlFor="remember-me" className={`ml-2 block text-sm ${getTextClasses()}`}>
                    Se souvenir de moi
                  </label>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setResetPasswordMode(true)}
                    className="font-medium text-sm text-red-600 hover:text-red-500 transition-colors duration-200"
                  >
                    Mot de passe oublié?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white ${success ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 text-sm font-medium`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : success ? (
                    <>
                      <Check size={18} className="mr-2" />
                      <span>Connexion réussie!</span>
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} ${getTextClasses()}`}>
                    Ou continuer avec
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="py-2.5 px-4 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  className="py-2.5 px-4 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className={`text-sm ${getTextClasses()}`}>
              Vous n'avez pas de compte?{' '}
              <a href="/signup" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
                S'inscrire
              </a>
            </p>
          </div>
          
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-full p-1.5 bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200"
            >
              {currentTheme === 'dark' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}