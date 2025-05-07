/* config.js – gestiona preferencias + mantenimiento avanzado */
document.addEventListener('DOMContentLoaded', () => {

  /* refs */
  const darkChk  = document.getElementById('dark-toggle');
  const voiceChk = document.getElementById('voice-toggle');
  const geoIn    = document.getElementById('geo-radius');
  const resetBtn = document.getElementById('reset-btn');
  const toast    = document.getElementById('notification');

  const maintRow  = document.getElementById('row-maint');
  const maintChk  = document.getElementById('maint-toggle');
  const advBox    = document.getElementById('maint-advanced');
  const msgIn     = document.getElementById('maint-msg');
  const endIn     = document.getElementById('maint-end');
  const listIn    = document.getElementById('maint-list');
  const saveBtn   = document.getElementById('maint-save');

  /* helpers cfg */
  const cfg     = JSON.parse(localStorage.qr_config || '{}');
  const saveCfg = () => localStorage.qr_config = JSON.stringify(cfg);
  const notify  = m => { toast.textContent=m; toast.style.display='block';
                         setTimeout(()=>toast.style.display='none',2200); };

  
  
  
                         /* estado inicial */
  darkChk.checked  = !!cfg.dark;
  voiceChk.checked = cfg.voice !== false;
  geoIn.value      = cfg.geo || 500;
  document.documentElement.classList.toggle('dark', cfg.dark);

  /* tema / voz / geo */
  darkChk.onchange = ()=>{ cfg.dark = darkChk.checked; saveCfg();
                           document.documentElement.classList.toggle('dark',cfg.dark); };
  voiceChk.onchange= ()=>{ cfg.voice = voiceChk.checked; saveCfg(); notify('Guardado'); };
  geoIn.onchange   = ()=>{ const v=Math.max(100,parseInt(geoIn.value,10)||500);
                           geoIn.value=v; cfg.geo=v; saveCfg(); notify('Radio actualizado'); };

  /* reset localStorage */
  resetBtn.onclick = ()=>{ if(confirm('Borrar TODOS los datos locales?')){
                             localStorage.clear(); location.reload(); } };

  /* solo ADMIN: mantenimiento avanzado */
  if (sessionStorage.role === 'ADMIN') {
    maintRow.style.display = 'flex';
    advBox .style.display = 'block';

    maintChk.checked = !!cfg.maintenance;
    maintChk.onchange = ()=>{ cfg.maintenance = maintChk.checked;
                              cfg.allowedRoles = ['ADMIN','QR_SUPPORT'];  // siempre permitir
                              saveCfg(); };

    /* precarga campos */
    msgIn.value  = cfg.maintMessage || '';
    endIn.value  = cfg.maintEnd     || '';
    listIn.value = cfg.maintTasks   || '';

    saveBtn.onclick = ()=>{
      cfg.maintMessage = msgIn.value.trim();
      cfg.maintEnd     = endIn.value;
      cfg.maintTasks   = listIn.value.trim();
      saveCfg(); notify('Aviso de mantenimiento guardado');
    };
  }
});
