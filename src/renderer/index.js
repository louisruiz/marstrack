// src/renderer/index.js - Version intégrée
console.log('Script index.js chargé avec succès!');

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Modification du titre pour montrer que le script est chargé
    const h1 = document.querySelector('h1');
    if (h1) {
      h1.textContent = 'MarsTrack - Chargement...';
    }

    // Importer React directement (sans require)
    const React = window.require('react');
    const ReactDOM = window.require('react-dom/client');
    const ReactRouterDOM = window.require('react-router-dom');
    
    const { HashRouter, Routes, Route, Link } = ReactRouterDOM;
    
    console.log('Bibliothèques chargées avec succès');
    
    // Composants simples pour les différentes pages
    const Dashboard = () => React.createElement('div', null, 'Dashboard');
    const Habits = () => React.createElement('div', null, 'Page Habitudes');
    const Todo = () => React.createElement('div', null, 'Page Todo Global');
    const Planning = () => React.createElement('div', null, 'Page Planning');
    
    // Barre latérale simplifiée
    const Sidebar = () => {
      return React.createElement('div', { 
        style: { 
          width: '200px', 
          height: '100vh', 
          backgroundColor: '#f0f0f0', 
          padding: '20px' 
        } 
      }, [
        React.createElement('h2', null, 'MarsTrack'),
        React.createElement('ul', { style: { listStyle: 'none', padding: 0 } }, [
          React.createElement('li', null, React.createElement(Link, { to: '/' }, 'Dashboard')),
          React.createElement('li', null, React.createElement(Link, { to: '/habits' }, 'Habitudes')),
          React.createElement('li', null, React.createElement(Link, { to: '/todo' }, 'Todo Global')),
          React.createElement('li', null, React.createElement(Link, { to: '/planning' }, 'Planning')),
        ])
      ]);
    };
    
    // Composant App principal
    const App = () => {
      return React.createElement(HashRouter, null,
        React.createElement('div', { style: { display: 'flex' } }, [
          React.createElement(Sidebar),
          React.createElement('div', { style: { flexGrow: 1, padding: '20px' } }, [
            React.createElement(Routes, null, [
              React.createElement(Route, { path: '/', element: React.createElement(Dashboard) }),
              React.createElement(Route, { path: '/habits', element: React.createElement(Habits) }),
              React.createElement(Route, { path: '/todo', element: React.createElement(Todo) }),
              React.createElement(Route, { path: '/planning', element: React.createElement(Planning) })
            ])
          ])
        ])
      );
    };
    
    // Rendu de l'application
    const root = document.getElementById('root');
    if (root) {
      ReactDOM.createRoot(root).render(React.createElement(App));
      console.log('Application React montée avec succès');
    } else {
      console.error('Élément #root non trouvé!');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
    
    // Afficher l'erreur dans la page
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="color: red; padding: 20px; border: 1px solid red;">
          <h2>Erreur d'initialisation</h2>
          <pre>${error.message}\n${error.stack}</pre>
        </div>
      `;
    }
  }
});