import styles from './style.css';
import type { WidgetConfig } from './types.js';
import { fetchAggregate } from './api.js';
import { staticStarsHtml } from './utils.js';
import { createReviewsList } from './ui/list.js';
import { createReviewForm } from './ui/form.js';

(function () {
  const host = document.getElementById('reviews-widget');
  if (!host) return;

  const config: WidgetConfig = {
    apiKey:         host.dataset['apiKey']        ?? '',
    productId:      host.dataset['productId']     ?? '',
    productHandle:  host.dataset['productHandle'] ?? '',
    productTitle:   host.dataset['productTitle']  ?? '',
    apiBase:        process.env.API_BASE,
    themeColor:     host.dataset['themeColor']    ?? '#000000',
    requireEmail:   host.dataset['requireEmail']  !== 'false',
    allowVideo:     host.dataset['allowVideo']    !== 'false',
    maxMedia:       parseInt(host.dataset['maxMedia'] ?? '3', 10),
    reviewsPerPage: parseInt(host.dataset['reviewsPerPage'] ?? '5', 10),
  };

  if (!config.apiKey || !config.productId) {
    console.warn('[Reviews Widget] Missing required data-api-key or data-product-id.');
    return;
  }

  // ── Shadow DOM ────────────────────────────────────────────────────
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles + set theme color CSS variable
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  // Override --rv-primary with configured theme color
  const themeStyle = document.createElement('style');
  themeStyle.textContent = `:host { --rv-primary: ${config.themeColor}; }`;
  shadow.appendChild(themeStyle);

  // ── Widget root ───────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.className = 'rv-widget';
  shadow.appendChild(widget);

  // ── Aggregate rating section ──────────────────────────────────────
  const aggregateEl = document.createElement('div');
  aggregateEl.className = 'rv-aggregate';
  aggregateEl.innerHTML = `<div style="color:var(--rv-text-muted);padding:8px 0">Loading...</div>`;
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