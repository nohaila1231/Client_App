import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
// Importe tes composants/pages ici

import HomePage from './pages/HomePage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MovieDetailPage from './pages/MovieDetailPage';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';
import ChatPage from './pages/ChatPage';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import TrendingMoviesPage from './pages/TrendingMoviesPage';
import PopularMoviesPage from './pages/PopularMoviesPage';
import TopRatedMoviesPage from './pages/TopRatedMoviesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AuthChecker from './components/AuthChecker';
import PrivacyPolicy from './pages/PrivacyPolicy';





function App() {
  return (
    <UserProvider>
         <AuthChecker/>
      <Router>
        <div className="flex flex-col min-h-screen bg-dark-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/signup" element={<SignUpPage/>} />
              <Route path="/signin" element={<SignInPage/>} />
              <Route path="/TrendingMoviesPage" element={<TrendingMoviesPage/> } />
              <Route path="/PopularMoviesPage" element={<PopularMoviesPage/>} />
              <Route path="/TopRatedMoviesPage" element={<TopRatedMoviesPage/> } />
              <Route path="/ProfilePage" element={<ProfilePage/>} />
              <Route path="/SettingsPage" element={<SettingsPage/>} />
              <Route path="/confidentialite" element={<PrivacyPolicy/>} />
            
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
