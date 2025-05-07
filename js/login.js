/* js/login.js */
import { getUsers } from './users-api.js';

document.addEventListener('DOMContentLoaded', () => {
  const f   = document.getElementById('loginForm');
  const msg = document.getElementById('msg');

  f.onsubmit = e => {
    e.preventDefault();
    const u = f.u.value.trim();
    const p = f.p.value.trim();

    const usr = getUsers().find(x => x.user === u && x.pass === p);
    if (!usr) {
      msg.textContent = 'Credenciales incorrectas';
      return;
    }
    /* guarda sesión y redirige */
    sessionStorage.setItem('authenticated', true);
    sessionStorage.setItem('username', usr.user);
    sessionStorage.setItem('role', usr.rol);
    location.href = 'welcome.html';
  };

  /* enlaces “olvidé…” aún sin funcionalidad */
  document.getElementById('forgot-user-link')
          .addEventListener('click', e => { e.preventDefault(); alert('Solicita a QR_Support'); });
  document.getElementById('forgot-pass-link')
          .addEventListener('click', e => { e.preventDefault(); alert('Solicita a QR_Support'); });
});
