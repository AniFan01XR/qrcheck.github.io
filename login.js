// login.js

document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay sesión, redirige directamente
    if (sessionStorage.authenticated) {
      window.location.href = 'welcome.html';
      return;
    }
  
    const form        = document.getElementById('login-form');
    const errorEl     = document.getElementById('login-error');
    const forgotUser  = document.getElementById('forgot-user-link');
    const forgotPass  = document.getElementById('forgot-pass-link');
  
    // Maneja el envío del formulario
    form.addEventListener('submit', e => {
      e.preventDefault();
      const user = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value.trim();
  
      // Validación simple
      if (user === 'QR_Support' && pass === 'QRsupport@adminmode') {
        sessionStorage.authenticated = 'true';
        sessionStorage.username      = user;
        window.location.href         = 'welcome.html';
      } else {
        errorEl.textContent = 'Usuario o contraseña incorrectos';
        errorEl.style.display = 'block';
      }
    });
  
    // Links "olvidé usuario"/"olvidé contraseña"
    const notify = msg => alert(msg);
  
    forgotUser.addEventListener('click', e => {
      e.preventDefault();
      notify('Funcionalidad "Olvidé usuario" en desarrollo.');
    });
  
    forgotPass.addEventListener('click', e => {
      e.preventDefault();
      notify('Funcionalidad "Olvidé contraseña" en desarrollo.');
    });
  });
  