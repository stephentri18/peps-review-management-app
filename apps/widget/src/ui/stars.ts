export function createInteractiveStars(
  initialRating: number,
  onChange: (rating: number) => void
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'rv-stars rv-stars--interactive';
  wrapper.setAttribute('role', 'radiogroup');
  wrapper.setAttribute('aria-label', 'Select rating');

  let current = initialRating;
  const stars: HTMLSpanElement[] = [];

  function updateDisplay(hovered: number) {
    stars.forEach((star, idx) => {
      const isOn = idx + 1 <= (hovered || current);
      star.className = `rv-star${isOn ? ' rv-star--filled' : ''}`;
    });
  }

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = `rv-star${i <= current ? ' rv-star--filled' : ''}`;
    star.textContent = '★';
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-label', `${i} star${i !== 1 ? 's' : ''}`);
    star.tabIndex = 0;

    star.addEventListener('mouseenter', () => updateDisplay(i));
    star.addEventListener('mouseleave', () => updateDisplay(0));

    star.addEventListener('click', () => {
      current = i;
      onChange(i);
      updateDisplay(0);
    });

    star.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        current = i;
        onChange(i);
        updateDisplay(0);
      }
    });

    stars.push(star);
    wrapper.appendChild(star);
  }

  return wrapper;
}