"use client"

import type React from "react"
import { Shield, Eye, Lock, Users, Database, Mail, FileText, AlertTriangle } from "lucide-react"


const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <Shield size={20} />,
    },
    {
      id: "data-collection",
      title: "Collecte des données",
      icon: <Database size={20} />,
    },
    {
      id: "data-usage",
      title: "Utilisation des données",
      icon: <Eye size={20} />,
    },
    {
      id: "data-sharing",
      title: "Partage des données",
      icon: <Users size={20} />,
    },
    {
      id: "data-security",
      title: "Sécurité des données",
      icon: <Lock size={20} />,
    },
    {
      id: "user-rights",
      title: "Vos droits",
      icon: <FileText size={20} />,
    },
    {
      id: "contact",
      title: "Contact",
      icon: <Mail size={20} />,
    },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header avec navigation */}
      <header className="bg-gradient-to-r from-black to-gray-900 border-b border-red-900/30 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                {/* <CinemaIcon size={20} /> */}
              </div>
              <span className="text-xl font-bold">
                Ciné<span className="text-red-500">Soul</span>
              </span>
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">
                Accueil
              </a>
              <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                À propos
              </a>
              <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText size={20} className="mr-2 text-red-500" />
                  Sommaire
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-red-900/20 transition-all duration-200 flex items-center group"
                    >
                      <span className="text-red-500 mr-3 group-hover:scale-110 transition-transform">
                        {section.icon}
                      </span>
                      <span className="text-sm">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl mb-6 shadow-2xl">
                <Shield size={40} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Politique de Confidentialité
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Votre vie privée est notre priorité. Découvrez comment nous protégeons et utilisons vos données sur{" "}
                <span className="text-red-500 font-semibold">CinéSoul</span>.
              </p>
              <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                <span>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl p-8 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Shield size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Introduction</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Bienvenue sur <strong className="text-red-500">CinéSoul</strong>, votre guide cinéma personnel.
                      Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et
                      protégeons vos informations personnelles lorsque vous utilisez notre plateforme de recommandation
                      de films.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      En utilisant CinéSoul, vous acceptez les pratiques décrites dans cette politique. Nous nous
                      engageons à respecter votre vie privée et à protéger vos données conformément au Règlement Général
                      sur la Protection des Données (RGPD) et aux lois applicables.
                    </p>
                  </div>
                </div>
              </section>

              {/* Collecte des données */}
              <section id="data-collection" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl p-8 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Database size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Collecte des données</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-black/50 rounded-lg p-6 border border-red-900/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Données que nous collectons :</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>
                            <strong>Informations de compte :</strong> nom, adresse e-mail, photo de profil
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>
                            <strong>Préférences cinéma :</strong> films aimés, watchlist, commentaires, notes
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>
                            <strong>Données d'utilisation :</strong> pages visitées, temps passé, interactions
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>
                            <strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Utilisation des données */}
              <section id="data-usage" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl p-8 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Eye size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Utilisation des données</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/50 rounded-lg p-6 border border-red-900/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Recommandations personnalisées</h3>
                      <p className="text-gray-300 text-sm">
                        Nous analysons vos goûts cinématographiques pour vous proposer des films qui correspondent à vos
                        préférences.
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-6 border border-red-900/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Amélioration du service</h3>
                      <p className="text-gray-300 text-sm">
                        Nous utilisons les données d'usage pour optimiser notre plateforme et développer de nouvelles
                        fonctionnalités.
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-6 border border-red-900/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Communication</h3>
                      <p className="text-gray-300 text-sm">
                        Nous pouvons vous envoyer des notifications sur de nouveaux films ou des mises à jour du
                        service.
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-6 border border-red-900/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Sécurité</h3>
                      <p className="text-gray-300 text-sm">
                        Nous surveillons l'activité pour détecter et prévenir les utilisations frauduleuses ou
                        malveillantes.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Partage des données */}
              <section id="data-sharing" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl p-8 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Users size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Partage des données</h2>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-3">
                      <AlertTriangle size={20} className="text-red-500 mr-2" />
                      <span className="font-semibold text-red-400">Engagement de confidentialité</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      <strong>Nous ne vendons jamais vos données personnelles</strong> à des tiers. Vos informations ne
                      sont partagées que dans les cas suivants :
                    </p>
                  </div>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">•</span>
                      <span>
                        <strong>Avec votre consentement explicite</strong> pour des fonctionnalités spécifiques
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">•</span>
                      <span>
                        <strong>Prestataires de services</strong> (hébergement, analytics) sous contrat strict
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">•</span>
                      <span>
                        <strong>Obligations légales</strong> en cas de demande judiciaire ou administrative
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Sécurité des données */}
              <section id="data-security" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl p-8 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Lock size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Sécurité des données</h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-black/50 rounded-lg border border-red-900/20">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock size={20} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Chiffrement</h3>
                      <p className="text-gray-400 text-sm">SSL/TLS pour toutes les communications</p>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg border border-red-900/20">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield size={20} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Protection</h3>
                      <p className="text-gray-400 text-sm">Pare-feu et systèmes de détection d'intrusion</p>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg border border-red-900/20">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Database size={20} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Sauvegarde</h3>
                      <p className="text-gray-400 text-sm">Sauvegardes régulières et sécurisées</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Vos droits */}
              <section id="user-rights" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl p-8 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <FileText size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Vos droits</h2>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Droit d'accès", desc: "Consulter les données que nous détenons sur vous" },
                      { title: "Droit de rectification", desc: "Corriger ou mettre à jour vos informations" },
                      { title: "Droit à l'effacement", desc: "Supprimer vos données personnelles" },
                      { title: "Droit à la portabilité", desc: "Récupérer vos données dans un format lisible" },
                      { title: "Droit d'opposition", desc: "Vous opposer au traitement de vos données" },
                      { title: "Droit de limitation", desc: "Limiter l'utilisation de vos données" },
                    ].map((right, index) => (
                      <div key={index} className="bg-black/50 rounded-lg p-4 border border-red-900/20">
                        <h3 className="font-semibold text-red-400 mb-2">{right.title}</h3>
                        <p className="text-gray-300 text-sm">{right.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-500/30 rounded-xl p-8 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Mail size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Contact</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-red-400 mb-4">Questions sur vos données ?</h3>
                      <p className="text-gray-300 mb-4">
                        Pour exercer vos droits ou pour toute question concernant cette politique de confidentialité,
                        contactez-nous :
                      </p>
                      <div className="space-y-2 text-gray-300">
                        <p>
                          <strong>Email :</strong> privacy@cinesoul.com
                        </p>
                        <p>
                          <strong>Délégué à la protection des données :</strong> dpo@cinesoul.com
                        </p>
                        <p>
                          <strong>Temps de réponse :</strong> 30 jours maximum
                        </p>
                      </div>
                    </div>
                    <div className="bg-black/50 rounded-lg p-6 border border-red-900/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Réclamation</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès
                        de la CNIL :
                      </p>
                      <a
                        href="https://www.cnil.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors text-sm underline"
                      >
                        www.cnil.fr
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer de la page */}
            <div className="mt-12 text-center py-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                Cette politique de confidentialité peut être mise à jour. Nous vous informerons de tout changement
                important.
              </p>
              <div className="mt-4">
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  {/* <CinemaIcon size={20} className="mr-2" /> */}
                  Retour à CinéSoul
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
