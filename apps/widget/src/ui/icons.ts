// Minimal inline SVG line-icons (no dependencies). Each inherits `currentColor`.

function svg(inner: string, size = 16): string {
  return (
    `<svg class="rv-icon" width="${size}" height="${size}" viewBox="0 0 24 24" ` +
    `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
  );
}

export const icons = {
  pencil: (s?: number) =>
    svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>', s),
  check: (s?: number) => svg('<path d="M20 6 9 17l-5-5"/>', s),
  chat: (s?: number) =>
    svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', s),
  alert: (s?: number) =>
    svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>', s),
  thumbsUp: (s?: number) =>
    svg(
      '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
      s
    ),
  x: (s?: number) => svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', s),
  paperclip: (s?: number) =>
    svg(
      '<path d="M13.234 20.252 21 12.3a3.5 3.5 0 0 0-4.95-4.95l-9.193 9.193a5 5 0 0 0 7.071 7.07L19.95 16.6"/>',
      s
    ),
  chevronLeft: (s?: number) => svg('<path d="m15 18-6-6 6-6"/>', s),
  chevronRight: (s?: number) => svg('<path d="m9 18 6-6-6-6"/>', s),
};
