// src/components/AuthChecker.tsx
import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext';

/**
 * Composant de debug pour vérifier l'état d'authentification
 * À inclure au niveau supérieur de votre application
 */
const AuthChecker: React.FC = () => {
  const { user, isLoggedIn, loading } = useUser();
  
  useEffect(() => {
    console.log('=== AUTH CHECKER STATUS ===');
    console.log('Loading:', loading);
    console.log('Is logged in:', isLoggedIn);
    console.log('User:', user);
    console.log('========================');
  }, [user, isLoggedIn, loading]);
  
  return null; // Ce composant ne rend rien à l'écran
};

export default AuthChecker;