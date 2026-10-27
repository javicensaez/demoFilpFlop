(() => {
  const buttons = document.querySelectorAll('.category-button');
  const selectedCategory = location.hash.slice(1);
  if ([...buttons].some(button => button.getAttribute('aria-controls') === selectedCategory)) {
    buttons.forEach(button => {
      const selected = button.getAttribute('aria-controls') === selectedCategory;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }));
})();
