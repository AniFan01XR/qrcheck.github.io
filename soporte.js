document.addEventListener('DOMContentLoaded',()=>{
    const form = document.getElementById('ticket-form');
    const toast= document.getElementById('notification');
  
    const notify = msg => {toast.textContent=msg;toast.style.display='block';
                           setTimeout(()=>toast.style.display='none',2500);};
  
    form.addEventListener('submit',e=>{
      e.preventDefault();
      // 👉 aquí llamarías a tu backend; de momento solo simulamos éxito
      notify('Ticket enviado, ¡gracias!');
      form.reset();
    });
  });
  