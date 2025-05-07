(() => {
    const audio = new Audio('assets/sound/toque.mp3'); audio.volume=.5;
    document.addEventListener('click', e=>{
      if (e.target.closest('button, a')){
        audio.cloneNode().play().catch(()=>{});
      }
    });
  })();
  