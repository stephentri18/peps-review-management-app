import styles from './style.css';
import type { WidgetConfig } from './types.js';
import { fetchAggregate, fetchSettings } from './api.js';
import { staticStarsHtml } from './utils.js';
import { createReviewsList } from './ui/list.js';
import { createReviewForm } from './ui/form.js';
import { createReviewsCarousel } from './ui/carousel.js';

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(n)) return '17, 24, 39';
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function readConfig(host: HTMLElement): WidgetConfig {
  return {
    apiKey:            host.dataset['apiKey']        ?? '',
    productId:         host.dataset['productId']     ?? '',
    productHandle:     host.dataset['productHandle'] ?? '',
    productTitle:      host.dataset['productTitle']  ?? '',
    apiBase:           process.env.API_BASE,
    themeColor:        host.dataset['themeColor']    ?? '#000000',
    requireEmail:      host.dataset['requireEmail']  !== 'false',
    allowVideo:        host.dataset['allowVideo']    !== 'false',
    maxMedia:          parseInt(host.dataset['maxMedia'] ?? '3', 10),
    reviewsPerPage:    parseInt(host.dataset['reviewsPerPage'] ?? '5', 10),
    showVerifiedBadge: host.dataset['showVerifiedBadge'] !== 'false',
    carouselTitle:     host.dataset['carouselTitle']  ?? 'What our customers say',
  };
}

// ── Aggregate rating section (default layout only) ──────────────────
function renderAggregate(widget: HTMLElement, config: WidgetConfig): void {
  const aggregateEl = document.createElement('div');
  aggregateEl.className = 'rv-aggregate';
  aggregateEl.innerHTML = `<div class="rv-spinner" style="margin:8px auto"></div>`;
  widget.appendChild(aggregateEl);

  fetchAggregate(config).then((agg) => {
    if (agg.total === 0) {
      aggregateEl.style.display = 'none';
      return;
    }

    const avg = agg.average.toFixed(1);
    const distRows = ([5, 4, 3, 2, 1] as const).map((r) => {
      const count = agg.distribution[r];
      const pct = agg.total > 0 ? Math.round((count / agg.total) * 100) : 0;
      return `
        <div class="rv-distribution__row">
          <span class="rv-distribution__label">${r}★</span>
          <div class="rv-distribution__track">
            <div class="rv-distribution__fill" style="width:${pct}%"></div>
          </div>
          <span class="rv-distribution__pct">${pct}%</span>
        </div>
      `;
    }).join('');

    aggregateEl.innerHTML = `
      <div class="rv-aggregate__score">${avg}</div>
      <div class="rv-aggregate__right">
        <div>
          ${staticStarsHtml(Math.round(agg.average))}
          <div class="rv-aggregate__count">Based on ${agg.total} review${agg.total !== 1 ? 's' : ''}</div>
        </div>
        <div class="rv-distribution">${distRows}</div>
      </div>
    `;
  }).catch(() => {
    aggregateEl.style.display = 'none';
  });
}

async function mountWidget(host: HTMLElement): Promise<void> {
  if (host.shadowRoot) return;  // already mounted

  const config = readConfig(host);
  const layout = host.dataset['layout'] === 'carousel' ? 'carousel' : 'default';

  if (!config.apiKey) {
    console.warn('[Reviews Widget] Missing required data-api-key.');
    return;
  }
  // Carousel is store-wide, so it doesn't need a product id; the default
  // (per-product) layout does.
  if (layout === 'default' && !config.productId) {
    console.warn('[Reviews Widget] Missing required data-product-id.');
    return;
  }

  // ── Shadow DOM + styles ───────────────────────────────────────────
  const shadow = host.attachShadow({ mode: 'open' });
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  // Admin-configured widget settings are the source of truth; the data-*
  // attributes act only as fallbacks (and carry the api-key / product id).
  const settings = await fetchSettings(config).catch(() => null);
  if (settings) {
    config.themeColor        = settings.theme_color ?? config.themeColor;
    config.requireEmail      = settings.require_email;
    config.allowVideo        = settings.allow_video;
    config.maxMedia          = settings.max_media_per_review;
    config.reviewsPerPage    = settings.reviews_per_page;
    config.showVerifiedBadge = settings.show_verified_badge;
  }

  // Override --rv-primary with configured theme color (plus an RGB triplet so
  // the stylesheet can derive soft tints / focus rings via rgba()).
  const themeStyle = document.createElement('style');
  themeStyle.textContent =
    `:host { --rv-primary: ${config.themeColor}; --rv-primary-rgb: ${hexToRgb(config.themeColor)}; }`;
  shadow.appendChild(themeStyle);

  const widget = document.createElement('div');
  widget.className = 'rv-widget';
  shadow.appendChild(widget);

  // ── Carousel layout: store-wide featured reviews only ─────────────
  if (layout === 'carousel') {
    const { el } = createReviewsCarousel(config);
    widget.appendChild(el);
    return;
  }

  // ── Default layout: aggregate + submit form + per-product list ────
  renderAggregate(widget, config);

  const { el: listEl, refresh: refreshList } = createReviewsList(config);
  const formEl = createReviewForm(config, () => {
    refreshList();
    fetchAggregate(config).catch(() => null);
  });

  widget.appendChild(formEl);
  widget.appendChild(listEl);
}

(function () {
  // Mount the original #reviews-widget embed plus any number of
  // .reviews-widget elements (e.g. carousel sections), each only once.
  const hosts = new Set<HTMLElement>();
  const byId = document.getElementById('reviews-widget');
  if (byId) hosts.add(byId);
  document.querySelectorAll<HTMLElement>('.reviews-widget').forEach((el) => hosts.add(el));
  hosts.forEach((host) => { void mountWidget(host); });
})();
