import type { ReviewWithMedia } from '@reviews/types';
import type { WidgetConfig } from '../types.js';
import { fetchReviews } from '../api.js';
import { escHtml, formatDate, staticStarsHtml } from '../utils.js';
import { voteHelpful } from '../api.js';
import { icons } from './icons.js';

interface ListState {
  loading: boolean;
  error: string | null;
  reviews: ReviewWithMedia[];
  total: number;
  page: number;
  total_pages: number;
}

export function createReviewsList(
  config: WidgetConfig
): { el: HTMLElement; refresh: () => Promise<void> } {
  const el = document.createElement('div');
  el.className = 'rv-list';

  const state: ListState = {
    loading: true,
    error: null,
    reviews: [],
    total: 0,
    page: 1,
    total_pages: 1,
  };

  function render() {
    el.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'rv-list__header';
    header.innerHTML = `
      <div class="rv-list__title">
        Reviews${state.total > 0 ? ` (${state.total})` : ''}
      </div>
    `;
    el.appendChild(header);

    if (state.loading) {
      el.insertAdjacentHTML('beforeend', `
        <div class="rv-list__state">
          <div class="rv-spinner" style="margin-bottom:14px"></div>
          <div>Loading reviews…</div>
        </div>
      `);
      return;
    }

    if (state.error) {
      el.insertAdjacentHTML('beforeend', `
        <div class="rv-list__state">
          <div class="rv-list__state-icon">${icons.alert(22)}</div>
          <div>${escHtml(state.error)}</div>
        </div>
      `);
      return;
    }

    if (state.reviews.length === 0) {
      el.insertAdjacentHTML('beforeend', `
        <div class="rv-list__state">
          <div class="rv-list__state-icon">${icons.chat(22)}</div>
          <div>No reviews yet. Be the first!</div>
        </div>
      `);
      return;
    }

    const list = document.createElement('div');
    state.reviews.forEach((review) => {
      list.appendChild(createReviewCard(review, config));
    });
    el.appendChild(list);

    if (state.total_pages > 1) {
      el.appendChild(createPagination(state, loadPage));
    }
  }

  async function loadPage(page: number) {
    state.loading = true;
    state.page = page;
    render();

    try {
      const result = await fetchReviews(config, page);
      state.reviews    = result.reviews;
      state.total      = result.total;
      state.total_pages = result.total_pages;
      state.error      = null;
    } catch {
      state.error = 'Could not load reviews. Please try again.';
    } finally {
      state.loading = false;
      render();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function refresh() {
    await loadPage(1);
  }

  // Initial load
  loadPage(1);

  return { el, refresh };
}

function createReviewCard(review: ReviewWithMedia, config: WidgetConfig): HTMLElement {
  const card = document.createElement('div');
  card.className = 'rv-review';

  // Top row: avatar + name + stars
  const top = document.createElement('div');
  top.className = 'rv-review__top';

  const ident = document.createElement('div');
  ident.className = 'rv-review__ident';

  const avatar = document.createElement('div');
  avatar.className = 'rv-review__avatar';
  avatar.textContent = review.reviewer_name.trim()[0] ?? '?';
  avatar.setAttribute('aria-hidden', 'true');

  const info = document.createElement('div');
  info.className = 'rv-review__info';
  info.innerHTML = `
    <span class="rv-review__name">${escHtml(review.reviewer_name)}</span>
    <span class="rv-review__date">${formatDate(review.created_at)}</span>
    ${review.verified_purchase ? `<span class="rv-review__verified">${icons.check(13)} Verified Purchase</span>` : ''}
  `;

  ident.appendChild(avatar);
  ident.appendChild(info);

  const starsEl = document.createElement('div');
  starsEl.innerHTML = staticStarsHtml(review.rating);

  top.appendChild(ident);
  top.appendChild(starsEl);
  card.appendChild(top);

  // Title
  if (review.title) {
    const title = document.createElement('div');
    title.className = 'rv-review__title';
    title.textContent = review.title;
    card.appendChild(title);
  }

  // Body
  const body = document.createElement('div');
  body.className = 'rv-review__body';
  body.textContent = review.body;
  card.appendChild(body);

  // Media
  if (review.media?.length) {
    const mediaRow = document.createElement('div');
    mediaRow.className = 'rv-review__media';

    review.media.forEach((m) => {
      const thumb = document.createElement('div');
      thumb.className = 'rv-review__media-thumb';

      if (m.type === 'image') {
        const img = document.createElement('img');
        img.src = m.url;
        img.alt = 'Review image';
        img.loading = 'lazy';
        thumb.appendChild(img);
      } else {
        const vid = document.createElement('video');
        vid.src = m.thumbnail_url ?? m.url;
        vid.muted = true;
        thumb.appendChild(vid);
      }

      thumb.addEventListener('click', () => openLightbox(m.url, m.type));
      mediaRow.appendChild(thumb);
    });

    card.appendChild(mediaRow);
  }

  // Footer: helpful vote
  const footer = document.createElement('div');
  footer.className = 'rv-review__footer';

  const helpfulBtn = document.createElement('button');
  helpfulBtn.className = 'rv-vote-btn';
  helpfulBtn.innerHTML = `${icons.thumbsUp(14)} Helpful${review.helpful_count > 0 ? ` (${review.helpful_count})` : ''}`;
  helpfulBtn.addEventListener('click', async () => {
    helpfulBtn.disabled = true;
    await voteHelpful(config, review.id, 'helpful').catch(() => null);
    helpfulBtn.innerHTML = `${icons.check(14)} Thanks!`;
  });

  footer.appendChild(helpfulBtn);
  card.appendChild(footer);

  // Owner reply
  if (review.reply) {
    const reply = document.createElement('div');
    reply.className = 'rv-review__reply';
    reply.innerHTML = `
      <div class="rv-review__reply-label">Store Response</div>
      <div class="rv-review__reply-body">${escHtml(review.reply.body)}</div>
    `;
    card.appendChild(reply);
  }

  return card;
}

function createPagination(
  state: ListState,
  onPage: (page: number) => void
): HTMLElement {
  const nav = document.createElement('div');
  nav.className = 'rv-pagination';

  const prev = document.createElement('button');
  prev.className = 'rv-btn rv-btn--ghost rv-btn--sm';
  prev.innerHTML = `${icons.chevronLeft(15)} Prev`;
  prev.disabled = state.page <= 1;
  prev.addEventListener('click', () => onPage(state.page - 1));

  const info = document.createElement('span');
  info.className = 'rv-pagination__info';
  info.textContent = `Page ${state.page} of ${state.total_pages}`;

  const next = document.createElement('button');
  next.className = 'rv-btn rv-btn--ghost rv-btn--sm';
  next.innerHTML = `Next ${icons.chevronRight(15)}`;
  next.disabled = state.page >= state.total_pages;
  next.addEventListener('click', () => onPage(state.page + 1));

  nav.appendChild(prev);
  nav.appendChild(info);
  nav.appendChild(next);
  return nav;
}

function openLightbox(url: string, type: 'image' | 'video') {
  const overlay = document.createElement('div');
  overlay.className = 'rv-lightbox';

  let media: HTMLElement;

  if (type === 'image') {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'rv-lightbox__media';
    img.alt = 'Review image';
    media = img;
  } else {
    const vid = document.createElement('video');
    vid.src = url;
    vid.className = 'rv-lightbox__media';
    vid.controls = true;
    vid.autoplay = true;
    media = vid;
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'rv-lightbox__close';
  closeBtn.innerHTML = icons.x(18);
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.removeChild(overlay);
  });

  overlay.addEventListener('click', () => document.body.removeChild(overlay));
  media.addEventListener('click', (e) => e.stopPropagation());

  overlay.appendChild(media);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}