export function createInteractiveStars(
  initialRating: number,
  onChange: (rating: number) => void
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'rv-stars rv-stars--interactive';
  wrapper.setAttribute('role', 'radiogroup');
  wrapper.setAttribute('aria-label', 'Select rating');

  let current = initialRating;

  const render = (hovered: number) => {
    wrapper.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      const isOn = i <= (hovered || current);
      star.className = `rv-star${isOn ? ' rv-star--filled' : ''}`;
      star.textContent = '★';
      star.setAttribute('role', 'radio');
      star.setAttribute('aria-checked', String(i === current));
      star.setAttribute('aria-label', `${i} star${i !== 1 ? 's' : ''}`);
      star.tabIndex = 0;

      star.addEventListener('mouseenter', () => render(i));
      star.addEventListener('mouseleave', () => render(0));
      star.addEventListener('click', () => {
        current = i;
        onChange(i);
        render(0);
      });
      star.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          current = i;
          onChange(i);
          render(0);
        }
      });

      wrapper.appendChild(star);
    }
  };

  render(0);
  return wrapper;
}