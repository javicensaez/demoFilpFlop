(() => {
  const stage = document.getElementById('simulation');
  const button = document.getElementById('fullscreen');
  if (!stage.requestFullscreen) { button.hidden = true; return; }
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch {
      stage.scrollIntoView({block: 'start'});
    }
  });
  document.addEventListener('fullscreenchange', () => {
    button.textContent = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa';
  });
})();
