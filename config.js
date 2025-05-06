/* config.js – versión final */
document.addEventListener('DOMContentLoaded', () => {
    /* ── referencias ─────────────────────────────────────── */
    const darkChk  = document.getElementById('dark-toggle');
    const voiceChk = document.getElementById('voice-toggle');
    const geoInput = document.getElementById('geo-radius');
    const resetBtn = document.getElementById('reset-btn');
    const toast    = document.getElementById('notification');
  
    /* ── helpers de configuración ────────────────────────── */
    const getCfg = () => JSON.parse(localStorage.getItem('qr_config') || '{}');
    const setCfg = cfg => localStorage.setItem('qr_config', JSON.stringify(cfg));
  
    /* ── estado inicial ──────────────────────────────────── */
    const cfg = getCfg();
    darkChk.checked  = !!cfg.dark;
    voiceChk.checked = cfg.voice !== false;        // por defecto true
    geoInput.value   = cfg.geo || 500;
    document.documentElement.classList.toggle('dark', darkChk.checked);
  
    /* ── notificador ─────────────────────────────────────── */
    const notify = msg => {
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => (toast.style.display = 'none'), 2200);
    };
  
    /* ── listeners ───────────────────────────────────────── */
    darkChk.addEventListener('change', () => {
      cfg.dark = darkChk.checked;
      setCfg(cfg);
      document.documentElement.classList.toggle('dark', cfg.dark);
    });
  
    voiceChk.addEventListener('change', () => {
      cfg.voice = voiceChk.checked;
      setCfg(cfg);
      notify('Preferencia de voz guardada');
    });
  
    geoInput.addEventListener('change', () => {
      const v = Math.max(100, parseInt(geoInput.value, 10) || 500);
      geoInput.value = v;
      cfg.geo = v;
      setCfg(cfg);
      localStorage.setItem('qr_totalGeofence', v); // leído por pase-lista
      notify('Radio de geocerca actualizado');
    });
  
    resetBtn.addEventListener('click', () => {
      if (confirm('Esto eliminará TODOS los datos locales. ¿Continuar?')) {
        localStorage.clear();
        location.reload();
      }
    });
  });
  