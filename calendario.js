// calendario.js  – ahora sube la imagen al endpoint /api/calendar/parse
document.addEventListener('DOMContentLoaded', () => {

  const input  = document.getElementById('img-input');
  const img    = document.getElementById('preview-img');
  const canvas = document.getElementById('hidden-canvas');
  const ctx    = canvas.getContext('2d');
  const tbody  = document.querySelector('#events-table tbody');
  const btnGen = document.getElementById('generate-btn');
  const calBox = document.getElementById('html-calendar');
  const toast  = document.getElementById('notification');

  const cfg   = JSON.parse(localStorage.getItem('qr_config')||'{}');
  const voice = cfg.voice !== false;

  /* ---------- helpers ---------- */
  const speak  = m=>{ if(voice&&'speechSynthesis'in window) speechSynthesis.speak(new SpeechSynthesisUtterance(m)); };
  const notify = m=>{ toast.textContent=m;toast.style.display='block';speak(m);setTimeout(()=>toast.style.display='none',2400); };

  /* ---------- subir al backend ---------- */
  async function sendToCloud(file){
    const fd = new FormData(); fd.append('file', file);
    const r  = await fetch('/api/calendar/parse',{method:'POST',body:fd});
    if(!r.ok) throw new Error('cloud');
    return r.json();               // [{color,texto,dias[]},…]
  }

  /* ---------- input ---------- */
  input.addEventListener('change', async e=>{
    const file = e.target.files[0]; if(!file) return;

    // preview HD
    img.src = URL.createObjectURL(file);
    img.onload = ()=>{
      canvas.width = img.naturalWidth;
      canvas.height= img.naturalHeight;
      ctx.drawImage(img,0,0);
    };

    try{
      notify('Procesando en la nube…');
      const eventos = await sendToCloud(file);
      tbody.innerHTML='';
      eventos.forEach(ev=>addRow(ev.color, ev.texto, ev.dias));
      notify('✔️ Procesado');
    }catch(err){
      console.error(err);
      notify('❌ Falló el servicio remoto');
    }
  });

  /* ---------- tabla ---------- */
  function addRow(hex,desc='Descripción…',dias='—'){
    if([...tbody.querySelectorAll('.color-box')].some(b=>b.style.background===hex)) return;
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td><div class="color-box" style="background:${hex}"></div></td>
      <td contenteditable="true">${desc}</td>
      <td contenteditable="true">${Array.isArray(dias)?dias.join(', '):dias}</td>
      <td><button class="delete-btn">&times;</button></td>`;
    tbody.appendChild(tr);
  }
  tbody.addEventListener('click',e=>{
    if(e.target.classList.contains('delete-btn')) e.target.closest('tr').remove();
  });

  /* ---------- mini-calendar demo se mantiene ---------- */
  btnGen.addEventListener('click',()=>{
    calBox.style.display = calBox.style.display==='none' ? 'block' : 'none';
    if(calBox.style.display==='block'){
      calBox.innerHTML = buildMini();
      btnGen.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar calendario';
    }else{
      btnGen.innerHTML = '<i class="fas fa-calendar-plus"></i> Generar / Mostrar calendario';
    }
  });

  function buildMini(){
    const d=new Date(), y=d.getFullYear(), m=d.getMonth();
    const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
    let h='<table class="mini-cal" style="width:100%;max-width:600px"><thead><tr>'+
      ['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(x=>`<th>${x}</th>`).join('')+
      '</tr></thead><tbody><tr>';
    let col=0; for(let i=0;i<first;i++){h+='<td></td>';col++;}
    for(let i=1;i<=days;i++){ if(col===7){h+='</tr><tr>';col=0;} h+=`<td>${i}</td>`;col++; }
    while(col<7){h+='<td></td>';col++;} return h+'</tr></tbody></table>';
  }
});
