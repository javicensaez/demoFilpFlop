(() => {
  const buttons = document.querySelectorAll('.category-button');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }));
})();
