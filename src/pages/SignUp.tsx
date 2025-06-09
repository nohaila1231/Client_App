import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Loader2, Check } from 'lucide-react';

// Import Firebase properly
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
 
  // Validation en temps réel
  const [emailValid, setEmailValid] = useState(null);
  const [nameValid, setNameValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(null);

  // Firebase config and initialization
  const firebaseConfig = {
    apiKey: "AIzaSyDkSqyff-396R7sLcH-jT6_SdXtjYxRyaw",
    authDomain: "recommendationffilm.firebaseapp.com",
    projectId: "recommendationffilm",
    storageBucket: "recommendationffilm.appspot.com",
    messagingSenderId: "1070862765035",
    appId: "1:1070862765035:web:cbcde6514ebf34e385e7ae",
    measurementId: "G-LTP0P71S3S"
  };

  // Initialize Firebase properly
  useEffect(() => {
    try {
      initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setError("Erreur d'initialisation de Firebase. Veuillez rafraîchir la page.");
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const checkPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  useEffect(() => {
    if (email) {
      setEmailValid(validateEmail(email));
    }
    if (name) {
      setNameValid(validateName(name));
    }
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    }
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [email, name, password, confirmPassword]);

  // Fonction pour enregistrer l'utilisateur dans le backend
  const saveUserToBackend = async (userData) => {
    try {
      // Vérifier que le backend est accessible
      console.log("Envoi des données au backend:", userData);
      
      // Utiliser l'URL complète de votre serveur backend
      // CORRECTION: Assurez-vous que cette URL est correcte et que le serveur est en cours d'exécution
      const backendUrl = 'http://localhost:5000/api/users/signup';
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        // credentials: 'include'
      });

      console.log("Statut de la réponse:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur serveur:", errorData);
        throw new Error(errorData.message || 'Erreur lors de l\'enregistrement dans la base de données.');
      }

      const data = await response.json();
      console.log('Utilisateur enregistré dans PostgreSQL avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur détaillée lors de l\'envoi des données au backend:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    setIsLoading(true);

    try {
      // Get auth instance properly
      const auth = getAuth();
      
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Utilisateur créé dans Firebase avec succès:", userCredential.user.uid);
      
      // Update profile using Firebase v9 syntax
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      
      // CORRECTION: Envoyer les données structurées correctement au backend Flask
      // S'assurer que les noms des champs correspondent à ce que le backend attend
      try {
        await saveUserToBackend({
          fullname: name,
          email: email,
          password: password,  
          confirm_password: confirmPassword, 
          uid: userCredential.user.uid  
        });
        
        console.log("Enregistrement dans PostgreSQL réussi");
        setSuccess(true);
        
        // Après le succès, attendez un peu pour montrer l'animation de succès
        setTimeout(() => {
          // Redirection vers la page de connexion
          window.location.href = '/signin';
        }, 2000);
      } catch (backendError) {
        console.error("Erreur spécifique PostgreSQL:", backendError);
        setError(`Inscription Firebase réussie, mais échec de l'enregistrement dans la base de données: ${backendError.message}`);
      }
    } catch (err) {
      console.error('Erreur d\'inscription Firebase:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Fond vidéo avec effet cinématographique */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Simulation d'une vidéo d'arrière-plan */}
        <div className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-1000 ease-in-out"
             style={{backgroundImage: `url("/api/placeholder/1920/1080")`}}></div>
        
        {/* Overlay à gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 z-10"></div>
      </div>
      
      {/* Effet de spotlight */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600 rounded-full opacity-10 blur-3xl animate-pulse z-0"></div>
      
      {/* Conteneur principal avec effet de verre */}
      <div className={`${getContainerClasses()} mt-20`}>
        {/* Effet de bordure brillante */}
        <div className="absolute inset-0 p-0.5 rounded-xl bg-gradient-to-r from-black via-red-700 to-black opacity-70"></div>
        
        {/* Conteneur du formulaire */}
        <div className="relative p-8 backdrop-blur-sm">
          {/* En-tête avec logo */}
          <div className="flex flex-col items-center mb-8">
            <h2 className={`text-2xl font-semibold ${getTextClasses()}`}>Inscription</h2>
          </div>
          
          {/* Messages d'erreur ou de succès */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-white flex items-center">
              <div className="mr-3 text-red-500">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-700/50 text-white flex items-center">
              <div className="mr-3 text-green-500">
                <Check className="h-5 w-5" />
              </div>
              <p>Inscription réussie! Redirection en cours...</p>
            </div>
          )}
          
          {/* Formulaire d'inscription */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Champ nom */}
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${getTextClasses()} mb-1`}>
                  Nom complet
                </label>
                <div className="relative mt-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className={`${nameValid === false ? 'text-red-500' : nameValid === true ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 text-white bg-gray-900/80 border ${nameValid === false ? 'border-red-500' : nameValid === true ? 'border-green-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 ${nameValid === false ? 'focus:ring-red-500' : 'focus:ring-red-600'} focus:border-transparent transition-all duration-200`}
                    placeholder="Jean Dupont"
                  />
                  
                  {/* Indicateur de validation pour le nom */}
                  {name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {nameValid === true && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {nameValid === false && (
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {nameValid === false && (
                  <p className="mt-1 text-sm text-red-500">Veuillez entrer un nom valide.</p>
                )}
              </div>
              
              {/* Champ email */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${getTextClasses()} mb-1`}>
                  Adresse email
                </label>
                <div className="relative mt-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className={`${emailValid === false ? 'text-red-500' : emailValid === true ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 text-white bg-gray-900/80 border ${emailValid === false ? 'border-red-500' : emailValid === true ? 'border-green-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 ${emailValid === false ? 'focus:ring-red-500' : 'focus:ring-red-600'} focus:border-transparent transition-all duration-200`}
                    placeholder="vous@exemple.com"
                  />
                  
                  {/* Indicateur de validation pour l'email */}
                  {email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailValid === true && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {emailValid === false && (
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {emailValid === false && (
                  <p className="mt-1 text-sm text-red-500">Veuillez entrer une adresse email valide.</p>
                )}
              </div>

              {/* Champ mot de passe */}
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
                    autoComplete="new-password"
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
                
                {/* Indicateur de force du mot de passe */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Force du mot de passe:</span>
                      <span className={`text-xs ${
                        passwordStrength === 'weak' ? 'text-red-500' : 
                        passwordStrength === 'medium' ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {passwordStrength === 'weak' ? 'Faible' : 
                         passwordStrength === 'medium' ? 'Moyen' : 
                         'Fort'}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          passwordStrength === 'weak' ? 'w-1/3 bg-red-500' : 
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : 
                          'w-full bg-green-500'
                        } transition-all duration-300`}
                      ></div>
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Minimum 8 caractères avec au moins 1 chiffre et 1 caractère spécial
                </p>
              </div>
              
              {/* Champ confirmation mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${getTextClasses()} mb-1`}>
                  Confirmer le mot de passe
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className={`${passwordsMatch === false ? 'text-red-500' : passwordsMatch === true ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 text-white bg-gray-900/80 border ${passwordsMatch === false ? 'border-red-500' : passwordsMatch === true ? 'border-green-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-white focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {passwordsMatch === false && (
                  <p className="mt-1 text-sm text-red-500">Les mots de passe ne correspondent pas.</p>
                )}
              </div>
            </div>
            
            {/* Acceptation des conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-red-600 focus:ring-red-600 border-gray-700 rounded"
              />
              <label htmlFor="terms" className={`ml-2 block text-sm ${getTextClasses()}`}>
                J'accepte les{' '}
                <a href="#" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
                  conditions d'utilisation
                </a>
                {' '}et la{' '}
                <a href="#" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
                  politique de confidentialité
                </a>
              </label>
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
                    <span>Inscription en cours...</span>
                  </>
                ) : success ? (
                  <>
                    <Check size={18} className="mr-2" />
                    <span>Inscription réussie!</span>
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
            
            {/* Séparateur élégant */}
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
          </form>
          
          {/* Pied de page */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${getTextClasses()}`}>
              Vous avez déjà un compte?{' '}
              <a href="/signin" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
                Se connecter
              </a>
            </p>
          </div>
          
          {/* Changeur de thème */}
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