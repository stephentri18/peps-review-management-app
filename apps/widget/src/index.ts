import styles from './style.css';
import type { WidgetConfig } from './types.js';
import { fetchAggregate, fetchSettings } from './api.js';
import { staticStarsHtml } from './utils.js';
import { createReviewsList } from './ui/list.js';
import { createReviewForm } from './ui/form.js';

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(n)) return '17, 24, 39';
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

(async function () {
  const host = document.getElementById('reviews-widget');
  if (!host) return;

  const config: WidgetConfig = {
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
  };

  if (!config.apiKey || !config.productId) {
    console.warn('[Reviews Widget] Missing required data-api-key or data-product-id.');
    return;
  }

  // ── Shadow DOM ────────────────────────────────────────────────────
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles
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

  // ── Widget root ───────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.className = 'rv-widget';
  shadow.appendChild(widget);

  // ── Aggregate rating section ──────────────────────────────────────
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

  // ── Review list ───────────────────────────────────────────────────
  const { el: listEl, refresh: refreshList } = createReviewsList(config);

  // ── Review form ───────────────────────────────────────────────────
  const formEl = createReviewForm(config, () => {
    // Refresh list + aggregate after a review is submitted
    refreshList();
    fetchAggregate(config).catch(() => null);
  });

  widget.appendChild(formEl);
  widget.appendChild(listEl);
})();