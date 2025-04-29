// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Protección
  if (!sessionStorage.authenticated) {
    return location.replace('index.html');
  }
  document.body.classList.add('authenticated');

  // Saludo
  const user = sessionStorage.username || 'Usuario';
  const g    = document.getElementById('greeting');
  if (g) g.textContent = `¡Bienvenid@ ${user}!`;

  // Sidebar toggle
  document.getElementById('sidebar-toggle')
    .addEventListener('click', () => document.body.classList.toggle('sidebar-open'));

  // Logout
  document.getElementById('logout')
    .addEventListener('click', e => {
      e.preventDefault();
      sessionStorage.clear();
      location.replace('index.html');
    });
});
