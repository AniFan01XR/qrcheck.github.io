/* click-sound.js  –  dispara un “toque” en cada interacción */

(() => {
    // ① Carga el audio una sola vez
    const baseSound = new Audio('assets/sound/toque.mp3');
    baseSound.volume = 0.5;               // ⇠ ajusta volumen 0-1
  
    // ② Cada click: si es <button> o <a> (cualquier enlace), suena
    document.addEventListener('click', e => {
      const el = e.target.closest('button, a');
      if (!el) return;
  
      // Clonamos el objeto audio para poder superponer clics rápidos
      const snd = baseSound.cloneNode();
      snd.play().catch(() => {/* silence autoplay errors */});
    });
  })();
  