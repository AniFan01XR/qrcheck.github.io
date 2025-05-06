// mandar.js • Turbo-Launch + preparado para API real
document.addEventListener('DOMContentLoaded', () => {

    const sendBtn = document.getElementById('send-btn');
    const wrap    = document.getElementById('anim-wrapper');
    const toast   = document.getElementById('notification');
    const cfg     = JSON.parse(localStorage.getItem('qr_config')||'{}');
    const voice   = cfg.voice !== false;
  
    /* helpers */
    const speak = msg=>{
      if(voice&&'speechSynthesis'in window)
        speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
    };
    const notify = msg=>{
      toast.textContent=msg;toast.style.display='block';
      speak(msg); setTimeout(()=>toast.style.display='none',2600);
    };
  
    /* crear animación cada vez */
    function buildAnim(){
      wrap.innerHTML='';
      // aviones + flare + trail
      const p = (delay)=>`<i class="fas fa-paper-plane plane" style="animation:fly 3.4s ${delay}s linear forwards"></i>
                          <div class="flare" style="animation:flare 3.4s ${delay}s linear forwards"></div>
                          <div class="trail" style="animation:trail 3.4s ${delay}s linear forwards"></div>`;
      wrap.insertAdjacentHTML('beforeend', p(0) + p(.25) + p(.5));
      wrap.innerHTML += `<div class="progress"><div class="bar"></div></div>`;
    }
  
    /* confeti */
    function confetti(){
      for(let i=0;i<24;i++){
        const c=document.createElement('div');
        c.className='confetti';
        c.textContent=['🎉','✨','🎊'][Math.floor(Math.random()*3)];
        c.style.left=Math.random()*100+'%';
        c.style.animationDuration=1+Math.random()*1.4+'s';
        document.body.appendChild(c);
        setTimeout(()=>c.remove(),2200);
      }
    }
  
    /* flash pantalla */
    function flash(){
      const f=document.createElement('div');
      f.className='flash';document.body.appendChild(f);
      f.addEventListener('animationend',()=>f.remove());
    }
  
    /* botón enviar */
    let busy=false;
    sendBtn.addEventListener('click',()=>{
      if(busy) return;
      busy=true;
  
      buildAnim();
      wrap.style.visibility='visible';
      wrap.querySelector('.bar').style.width='100%';
  
      flash(); // flash inicial
      realSend().then(()=>notify('✅ ¡Datos enviados correctamente!'))
                .catch(()=>notify('❌ Error de red'))
                .finally(()=>{
                  confetti();
                  setTimeout(()=>{
                    wrap.style.visibility='hidden';
                    wrap.querySelector('.bar').style.width='0';
                    busy=false;
                  },900);
                });
    });
  
    /* FUTURO: cambia por fetch real */
    function realSend(){
      return new Promise((res)=>setTimeout(res,3400));
      /* ejemplo:
      return fetch('/api/enviar', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({records: localStorage.getItem('qr_asistencias')})
      });
      */
    }
  });
  