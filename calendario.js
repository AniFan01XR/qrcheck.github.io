// calendario.js  – Asistente 2-click  (color + OCR región)
document.addEventListener('DOMContentLoaded', () => {

    /* refs */
    const input  = document.getElementById('img-input');
    const img    = document.getElementById('preview-img');
    const canvas = document.getElementById('hidden-canvas');
    const ctx    = canvas.getContext('2d');
    const tbody  = document.querySelector('#events-table tbody');
    const btnGen = document.getElementById('generate-btn');
    const calBox = document.getElementById('html-calendar');
    const toast  = document.getElementById('notification');
  
    /* lupa flotante y caja OCR */
    const loupe = document.createElement('canvas');
    loupe.id='loupe'; loupe.width=loupe.height=90; document.body.appendChild(loupe);
    const lCtx  = loupe.getContext('2d');
    const ocrBox = document.createElement('div');
    ocrBox.className='ocr-box'; document.body.appendChild(ocrBox);
  
    const notify = m=>{toast.textContent=m;toast.style.display='block';
                       setTimeout(()=>toast.style.display='none',2200);};
  
    let ready=false, waitingText=false, currentRow=null;
  
    /*──────── 1. cargar imagen HD ───────*/
    input.addEventListener('change',e=>{
      const f=e.target.files[0]; if(!f) return;
      img.src=URL.createObjectURL(f);
      img.onload=()=>{
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.drawImage(img,0,0);
        tbody.innerHTML='';
        ready=true;
        notify('Imagen cargada. ① Clic en un color ② Doble-clic en su texto.');
      };
    });
  
    /*──────── 2. lupa pixelada ───────*/
    img.addEventListener('mousemove',e=>{
      if(!ready) return;
      const r=img.getBoundingClientRect();
      const x=(e.clientX-r.left)*img.naturalWidth /r.width,
            y=(e.clientY-r.top )*img.naturalHeight/r.height;
      lCtx.drawImage(canvas,x-7,y-7,14,14,0,0,90,90);
      loupe.style.left=e.pageX+15+'px';
      loupe.style.top =e.pageY+15+'px';
      loupe.style.display='block';
    });
    img.addEventListener('mouseleave',()=>loupe.style.display='none');
  
    /*──────── 3. primer clic = color ───────*/
    img.addEventListener('click',e=>{
      if(!ready) return;
      const {hex,sat,max} = sampleColor(e);
      if(sat<15||max>240) return notify('Color gris/blanco descartado');
      currentRow = addRow(hex);
      waitingText=true;
      notify('Ahora doble-clic en el texto de la leyenda');
    });
  
    /*──────── 4. doble-clic = OCR texto ─────*/
    img.addEventListener('dblclick',async e=>{
      if(!waitingText||!currentRow) return;
      const r=img.getBoundingClientRect();
      const scaleX=img.naturalWidth /r.width,
            scaleY=img.naturalHeight/r.height;
      const x=(e.clientX-r.left)*scaleX,
            y=(e.clientY-r.top )*scaleY,
            w=260*scaleX, h=45*scaleY;      // área aproximada
  
      /* marco visual */
      ocrBox.style.cssText=`left:${e.pageX-5}px;top:${e.pageY-5}px;width:${w/scaleX}px;height:${h/scaleY}px;display:block`;
  
      /* recorte + OCR */
      const crop=ctx.getImageData(x,y,w,h);
      const tmp=document.createElement('canvas');
      tmp.width=w;tmp.height=h;
      tmp.getContext('2d').putImageData(crop,0,0);
      const {data:{text}}=await Tesseract.recognize(tmp,'spa',{logger:()=>{}});
      ocrBox.style.display='none';
      currentRow.children[1].textContent=text.trim()||'Descripción…';
      waitingText=false; currentRow=null;
    });
  
    /*──────── 5. tabla dinámica ───────*/
    function addRow(hex){
      if([...tbody.querySelectorAll('.color-box')].some(b=>b.style.background===hex)) return null;
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td><div class="color-box" style="background:${hex}"></div></td>
        <td contenteditable="true">Descripción…</td>
        <td contenteditable="true">—</td>
        <td><button class="delete-btn">&times;</button></td>`;
      tbody.appendChild(tr);
      return tr;
    }
    tbody.addEventListener('click',e=>{
      if(e.target.classList.contains('delete-btn')) e.target.closest('tr').remove();
    });
  
    /*──────── 6. mini-cal demo ───────*/
    btnGen.addEventListener('click',()=>{
      if(calBox.style.display==='none'){
        calBox.innerHTML=miniCal();
        calBox.style.display='block';
        btnGen.innerHTML='<i class="fas fa-eye-slash"></i> Ocultar calendario';
      }else{
        calBox.style.display='none';
        btnGen.innerHTML='<i class="fas fa-calendar-plus"></i> Generar / Mostrar calendario';
      }
    });
  
    function miniCal(){
      const d=new Date(),y=d.getFullYear(),m=d.getMonth();
      const f=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
      let h='<table class="mini-cal" style="width:100%;max-width:600px"><thead><tr>'+
        ['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(x=>`<th>${x}</th>`).join('')+
        '</tr></thead><tbody><tr>';
      let col=0;
      for(let i=0;i<f;i++){h+='<td></td>';col++;}
      for(let i=1;i<=days;i++){
        if(col===7){h+='</tr><tr>';col=0;}
        h+=`<td>${i}</td>`;col++;
      }
      while(col<7){h+='<td></td>';col++;}
      return h+'</tr></tbody></table>';
    }
  
    /* util para muestrear */
    function sampleColor(ev){
      const r=img.getBoundingClientRect();
      const scaleX=img.naturalWidth /r.width,
            scaleY=img.naturalHeight/r.height;
      const x=Math.floor((ev.clientX-r.left)*scaleX),
            y=Math.floor((ev.clientY-r.top )*scaleY);
      const [R,G,B]=ctx.getImageData(x,y,1,1).data;
      const max=Math.max(R,G,B),min=Math.min(R,G,B),
            sat=max===0?0:(max-min)/max*100;
      return {hex:'#'+[R,G,B].map(v=>v.toString(16).padStart(2,'0')).join(''),sat,max};
    }
  });
  