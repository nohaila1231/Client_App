import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { UserProvider } from './context/UserContext.tsx'; // adapte le chemin selon ton projet
import './index.css'; // ou ./main.css

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
