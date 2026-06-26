import type { ReviewWithMedia } from '@reviews/types';
import type { WidgetConfig } from '../types.js';
import { fetchFeatured } from '../api.js';
import { escHtml, formatDate, staticStarsHtml } from '../utils.js';
import { icons } from './icons.js';

const AUTOPLAY_MS = 4500;

export function createReviewsCarousel(config: WidgetConfig): { el: HTMLElement } {
  const el = document.createElement('div');
  el.className = 'rv-carousel';
  el.innerHTML = `
    <div class="rv-list__state">
      <div class="rv-spinner" style="margin:8px auto"></div>
    </div>
  `;

  fetchFeatured(config, 12)
    .then((result) => {
      if (!result.reviews.length) {
        el.style.display = 'none';
        return;
      }
      render(el, result.reviews, config);
    })
    .catch(() => {
      el.style.display = 'none';
    });

  return { el };
}

function render(el: HTMLElement, reviews: ReviewWithMedia[], config: WidgetConfig): void {
  el.innerHTML = `
    <div class="rv-carousel__head">
      <div class="rv-carousel__title">${escHtml(config.carouselTitle)}</div>
      <div class="rv-carousel__nav">
        <button class="rv-carousel__btn" data-dir="prev" aria-label="Previous reviews">${icons.chevronLeft(18)}</button>
        <button class="rv-carousel__btn" data-dir="next" aria-label="Next reviews">${icons.chevronRight(18)}</button>
      </div>
    </div>
    <div class="rv-carousel__viewport" tabindex="0"></div>
  `;

  const viewport = el.querySelector<HTMLElement>('.rv-carousel__viewport')!;
  reviews.forEach((r) => viewport.appendChild(card(r)));

  // ── Arrow navigation ──────────────────────────────────────────────
  const step = () => {
    const first = viewport.querySelector<HTMLElement>('.rv-carousel__card');
    const gap = 16;
    return first ? first.offsetWidth + gap : viewport.clientWidth;
  };
  const nearEnd = () =>
    viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;

  const advance = () => {
    if (nearEnd()) viewport.scrollTo({ left: 0, behavior: 'smooth' });
    else viewport.scrollBy({ left: step(), behavior: 'smooth' });
  };
  const back = () => viewport.scrollBy({ left: -step(), behavior: 'smooth' });

  el.querySelectorAll<HTMLElement>('.rv-carousel__btn').forEach((btn) => {
    btn.addEventListener('click', () => (btn.dataset['dir'] === 'next' ? advance() : back()));
  });

  // ── Autoplay (pause on hover / focus) ─────────────────────────────
  let timer: ReturnType<typeof setInterval> | null = null;
  const start = () => {
    if (timer || reviews.length < 2) return;
    timer = setInterval(advance, AUTOPLAY_MS);
  };
  const stop = () => {
    if (timer) { clearInterval(timer); timer = null; }
  };

  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);
  viewport.addEventListener('focusin', stop);
  viewport.addEventListener('focusout', start);
  start();
}

function card(review: ReviewWithMedia): HTMLElement {
  const el = document.createElement('article');
  el.className = 'rv-carousel__card';

  const product = review.product_title ?? review.product_handle ?? '';
  const initial = review.reviewer_name.trim()[0] ?? '?';

  el.innerHTML = `
    <div class="rv-carousel__stars">${staticStarsHtml(review.rating)}</div>
    ${review.title ? `<div class="rv-carousel__cardtitle">${escHtml(review.title)}</div>` : ''}
    <p class="rv-carousel__quote">${escHtml(review.body)}</p>
    <div class="rv-carousel__foot">
      <div class="rv-review__avatar" aria-hidden="true">${escHtml(initial)}</div>
      <div class="rv-carousel__meta">
        <span class="rv-carousel__name">${escHtml(review.reviewer_name)}</span>
        <span class="rv-carousel__sub">${escHtml(product || formatDate(review.created_at))}</span>
      </div>
    </div>
  `;
  return el;
}
