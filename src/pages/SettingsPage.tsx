import React, { useState, useEffect } from 'react';
import { Bell, Globe, Lock, Shield, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false
  });
  
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showActivity: true,
    allowRecommendations: true
  });
  
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [language, setLanguage] = useState('fr');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('notifications');

  // Animation states
  const [animateIn, setAnimateIn] = useState(true);
  
  // Initial animation
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    setSaving(true);
    setError('');
    setSuccess('');

    // Simuler une sauvegarde
    setTimeout(() => {
      setSuccess('Paramètres mis à jour avec succès!');
      setSaving(false);
    }, 1500);
  };
  
  const setSection = (section) => {
    setAnimateIn(true);
    setTimeout(() => {
      setActiveSection(section);
      setAnimateIn(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-24 pb-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-red-700 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-red-800 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-red-900 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-red-600 blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
      </div>
      
      {/* Particle background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-red-500 rounded-full animate-float"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 8}s`,
              opacity: Math.random() * 0.5
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
     

        {/* Navigation pills */}
        <div className="flex justify-center mb-10">
          <div className="bg-black bg-opacity-50 backdrop-blur-lg rounded-full p-1 flex space-x-1 border border-red-900/30">
            <button 
              onClick={() => setSection('notifications')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center ${activeSection === 'notifications' ? 'bg-gradient-to-r from-red-800 to-red-600 text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white'}`}
            >
              <Bell size={16} className="mr-2" />
              Notifications
            </button>
            <button 
              onClick={() => setSection('language')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center ${activeSection === 'language' ? 'bg-gradient-to-r from-red-800 to-red-600 text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white'}`}
            >
              <Globe size={16} className="mr-2" />
              Langue
            </button>
            <button 
              onClick={() => setSection('privacy')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center ${activeSection === 'privacy' ? 'bg-gradient-to-r from-red-800 to-red-600 text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white'}`}
            >
              <Shield size={16} className="mr-2" />
              Confidentialité
            </button>
            <button 
              onClick={() => setSection('password')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center ${activeSection === 'password' ? 'bg-gradient-to-r from-red-800 to-red-600 text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white'}`}
            >
              <Lock size={16} className="mr-2" />
              Mot de passe
            </button>
          </div>
        </div>

        {/* Messages de succès/erreur */}
        {(success || error) && (
          <div className={`mb-8 p-4 rounded-2xl backdrop-blur-md transition-all duration-500 ${success ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'}`}>
            <div className="flex items-center">
              <AlertCircle size={20} className={success ? 'text-green-500' : 'text-red-500'} />
              <span className="ml-2 text-white">{success || error}</span>
            </div>
          </div>
        )}

        <div className={`transition-all duration-300 transform ${animateIn ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {/* NOTIFICATIONS SECTION */}
          {activeSection === 'notifications' && (
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-900/20 shadow-xl shadow-red-900/5">
              <div className="flex items-center mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-red-800 to-red-600 mr-4 shadow-lg shadow-red-900/30">
                  <Bell size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Notifications</h2>
              </div>
              
              <div className="space-y-6">
                <label className="flex items-center justify-between p-4 rounded-xl bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group border border-red-900/10">
                  <div>
                    <span className="text-white font-medium">Notifications par email</span>
                    <p className="text-gray-400 text-sm mt-1">Recevez des mises à jour importantes par email</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${notifications.email ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gray-800'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${notifications.email ? 'translate-x-6 shadow-lg' : 'translate-x-0'} group-hover:shadow-md`}></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 rounded-xl bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group border border-red-900/10">
                  <div>
                    <span className="text-white font-medium">Notifications push</span>
                    <p className="text-gray-400 text-sm mt-1">Soyez alerté instantanément sur votre appareil</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${notifications.push ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gray-800'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${notifications.push ? 'translate-x-6 shadow-lg' : 'translate-x-0'} group-hover:shadow-md`}></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 rounded-xl bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group border border-red-900/10">
                  <div>
                    <span className="text-white font-medium">Newsletter</span>
                    <p className="text-gray-400 text-sm mt-1">Recevez nos actualités et offres spéciales</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.newsletter}
                      onChange={(e) => setNotifications({...notifications, newsletter: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${notifications.newsletter ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gray-800'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${notifications.newsletter ? 'translate-x-6 shadow-lg' : 'translate-x-0'} group-hover:shadow-md`}></div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* LANGUE SECTION */}
          {activeSection === 'language' && (
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-900/20 shadow-xl shadow-red-900/5">
              <div className="flex items-center mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-red-800 to-red-600 mr-4 shadow-lg shadow-red-900/30">
                  <Globe size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Langue</h2>
              </div>
              
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none bg-black/50 border border-red-900/30 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                >
                  <option value="fr" className="bg-gray-900">Français</option>
                  <option value="en" className="bg-gray-900">English</option>
                  <option value="es" className="bg-gray-900">Español</option>
                  <option value="de" className="bg-gray-900">Deutsch</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${language === 'fr' ? 'bg-gradient-to-br from-red-800/30 to-red-600/30 border-red-600/50' : 'bg-black/30 border-red-900/10 hover:bg-black/40'}`} onClick={() => setLanguage('fr')}>
                  <div className="font-bold text-lg text-white mb-1">FR</div>
                  <div className="text-gray-400 text-xs">Français</div>
                </div>
                <div className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${language === 'en' ? 'bg-gradient-to-br from-red-800/30 to-red-600/30 border-red-600/50' : 'bg-black/30 border-red-900/10 hover:bg-black/40'}`} onClick={() => setLanguage('en')}>
                  <div className="font-bold text-lg text-white mb-1">EN</div>
                  <div className="text-gray-400 text-xs">English</div>
                </div>
                <div className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${language === 'es' ? 'bg-gradient-to-br from-red-800/30 to-red-600/30 border-red-600/50' : 'bg-black/30 border-red-900/10 hover:bg-black/40'}`} onClick={() => setLanguage('es')}>
                  <div className="font-bold text-lg text-white mb-1">ES</div>
                  <div className="text-gray-400 text-xs">Español</div>
                </div>
                <div className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${language === 'de' ? 'bg-gradient-to-br from-red-800/30 to-red-600/30 border-red-600/50' : 'bg-black/30 border-red-900/10 hover:bg-black/40'}`} onClick={() => setLanguage('de')}>
                  <div className="font-bold text-lg text-white mb-1">DE</div>
                  <div className="text-gray-400 text-xs">Deutsch</div>
                </div>
              </div>
            </div>
          )}

          {/* CONFIDENTIALITÉ SECTION */}
          {activeSection === 'privacy' && (
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-900/20 shadow-xl shadow-red-900/5">
              <div className="flex items-center mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-red-800 to-red-600 mr-4 shadow-lg shadow-red-900/30">
                  <Shield size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Confidentialité</h2>
              </div>
              
              <div className="space-y-6">
                <label className="flex items-center justify-between p-4 rounded-xl bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group border border-red-900/10">
                  <div>
                    <span className="text-white font-medium">Profil public</span>
                    <p className="text-gray-400 text-sm mt-1">Permettre aux autres utilisateurs de voir votre profil</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={privacy.profilePublic}
                      onChange={(e) => setPrivacy({...privacy, profilePublic: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${privacy.profilePublic ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gray-800'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${privacy.profilePublic ? 'translate-x-6 shadow-lg' : 'translate-x-0'} group-hover:shadow-md`}></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 rounded-xl bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group border border-red-900/10">
                  <div>
                    <span className="text-white font-medium">Afficher mon activité</span>
                    <p className="text-gray-400 text-sm mt-1">Montrer votre statut et votre activité récente</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={privacy.showActivity}
                      onChange={(e) => setPrivacy({...privacy, showActivity: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${privacy.showActivity ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gray-800'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${privacy.showActivity ? 'translate-x-6 shadow-lg' : 'translate-x-0'} group-hover:shadow-md`}></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 rounded-xl bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group border border-red-900/10">
                  <div>
                    <span className="text-white font-medium">Autoriser les recommandations</span>
                    <p className="text-gray-400 text-sm mt-1">Personnaliser votre expérience avec des recommandations</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={privacy.allowRecommendations}
                      onChange={(e) => setPrivacy({...privacy, allowRecommendations: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${privacy.allowRecommendations ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gray-800'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${privacy.allowRecommendations ? 'translate-x-6 shadow-lg' : 'translate-x-0'} group-hover:shadow-md`}></div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* MOT DE PASSE SECTION */}
          {activeSection === 'password' && (
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-900/20 shadow-xl shadow-red-900/5">
              <div className="flex items-center mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-red-800 to-red-600 mr-4 shadow-lg shadow-red-900/30">
                  <Lock size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Changer le mot de passe</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative group">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={password.current}
                      onChange={(e) => setPassword({...password, current: e.target.value})}
                      className="w-full bg-black/50 border border-red-900/30 rounded-xl py-4 px-5 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all group-hover:bg-black/60"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative group">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={password.new}
                      onChange={(e) => setPassword({...password, new: e.target.value})}
                      className="w-full bg-black/50 border border-red-900/30 rounded-xl py-4 px-5 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all group-hover:bg-black/60"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {password.new && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Force du mot de passe</span>
                        <span className="text-xs font-medium text-gray-300">
                          {password.new.length < 6 ? 'Faible' : password.new.length < 10 ? 'Moyen' : 'Fort'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            password.new.length < 6 
                              ? 'bg-red-600 w-1/4' 
                              : password.new.length < 10 
                                ? 'bg-yellow-600 w-2/4' 
                                : 'bg-gradient-to-r from-green-600 to-green-400 w-full'
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative group">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={password.confirm}
                      onChange={(e) => setPassword({...password, confirm: e.target.value})}
                      className="w-full bg-black/50 border border-red-900/30 rounded-xl py-4 px-5 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all group-hover:bg-black/60"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Passwords match indicator */}
                  {password.confirm && (
                    <div className="mt-2 flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${password.new === password.confirm ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-gray-400">
                        {password.new === password.confirm ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="group relative px-8 py-4 overflow-hidden rounded-xl bg-gradient-to-r from-red-800 to-red-600 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-900/30"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-900 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        .animate-float {
          animation: float 15s infinite;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;