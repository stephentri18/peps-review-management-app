export function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function staticStarsHtml(rating: number): string {
  return `<span class="rv-stars">${
    Array.from({ length: 5 }, (_, i) =>
      `<span class="rv-star${i < rating ? ' rv-star--filled' : ''}">★</span>`
    ).join('')
  }</span>`;
}