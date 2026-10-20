/* Un mismo lienzo lógico en cualquier resolución de proyector. */
(() => {
  const stage = document.createElement('div');
  stage.className = 'projection-stage';
  for (const child of [...document.body.children]) {
    if (child.tagName !== 'SCRIPT') stage.appendChild(child);
  }
  document.body.prepend(stage);
  function fit() {
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    const enabled = w / h >= 1.5;
    document.body.classList.toggle('projection-mode', enabled);
    if (enabled) {
      const scale = Math.min(w / 1600, h / 900);
      stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    } else stage.style.removeProperty('transform');
  }
  window.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('resize', fit);
  fit();
})();
