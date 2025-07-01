import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Assuming you'll add a basic CSS file
import App from './App'; // Import your main App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
