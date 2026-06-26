import { useState, useEffect } from 'react';
import { useStores, useUpdateWidgetSettings } from '../hooks/useStores.js';
import { storesApi } from '../api/stores.js';
import { Spinner } from '../components/ui/Spinner.js';
import { Icon }    from '../components/ui/Icon.js';
import type { WidgetSettings } from '@reviews/types';

export function Settings() {
  const { data: stores, isLoading: storesLoading } = useStores();
  const [selectedStoreId, setSelectedStoreId]       = useState('');
  const [settings, setSettings]                     = useState<WidgetSettings | null>(null);
  const [loadingSettings, setLoadingSettings]       = useState(false);
  const [saved, setSaved]                           = useState(false);
  const [snippetCopied, setSnippetCopied]           = useState(false);

  const updateSettings = useUpdateWidgetSettings();

  // Load settings when store is selected
  useEffect(() => {
    if (!selectedStoreId) { setSettings(null); return; }
    setLoadingSettings(true);
    storesApi.getSettings(selectedStoreId)
      .then(setSettings)
      .finally(() => setLoadingSettings(false));
  }, [selectedStoreId]);

  // Auto-select first store
  useEffect(() => {
    if (stores?.length && !selectedStoreId) {
      setSelectedStoreId(stores[0]!.id);
    }
  }, [stores]);

  const handleSave = async () => {
    if (!settings || !selectedStoreId) return;
    await updateSettings.mutateAsync({
      id: selectedStoreId,
      payload: {
        theme_color:          settings.theme_color,
        auto_approve:         settings.auto_approve,
        require_email:        settings.require_email,
        show_verified_badge:  settings.show_verified_badge,
        max_media_per_review: settings.max_media_per_review,
        reviews_per_page:     settings.reviews_per_page,
        allow_video:          settings.allow_video,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = <K extends keyof WidgetSettings>(key: K, val: WidgetSettings[K]) => {
    setSettings((prev) => prev ? { ...prev, [key]: val } : prev);
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(widgetSnippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const widgetSnippet = selectedStoreId && stores
    ? `<div
  id="reviews-widget"
  data-api-key="${stores.find((s) => s.id === selectedStoreId)?.api_key ?? ''}"
  data-product-id="{{ product.id }}"
  data-product-handle="{{ product.handle }}"
  data-product-title="{{ product.title | escape }}"
  data-theme-color="${settings?.theme_color ?? '#000000'}"
  data-require-email="${settings?.require_email ?? true}"
  data-allow-video="${settings?.allow_video ?? true}"
  data-max-media="${settings?.max_media_per_review ?? 3}"
  data-reviews-per-page="${settings?.reviews_per_page ?? 5}"
></div>
<script src="https://reviews-cdn.yourdomain.com/widget.js" defer></script>`
    : '';

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-10">
      <div className="mb-6">
        <h1 className="page-title">Widget Settings</h1>
        <p className="page-subtitle">Configure the review widget per store</p>
      </div>

      {/* Store selector */}
      <div className="mb-6">
        <label className="label">Store</label>
        {storesLoading ? <Spinner size="sm" /> : (
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="input w-full sm:w-72"
          >
            {stores?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {loadingSettings ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : settings ? (
        <div className="space-y-6">
          {/* Settings form */}
          <div className="card divide-y divide-neutral-100 p-0 dark:divide-neutral-800">
            {/* Theme color */}
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Theme Color</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Applied to buttons and accents in the widget</div>
              </div>
              <div className="flex items-center gap-3">
                <code className="text-xs text-neutral-400 dark:text-neutral-500">{settings.theme_color}</code>
                <label
                  className="h-9 w-9 cursor-pointer rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-700"
                  style={{ background: settings.theme_color }}
                >
                  <input
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => set('theme_color', e.target.value)}
                    className="h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>

            {/* Toggles */}
            {([
              { key: 'auto_approve',        label: 'Auto-approve reviews',  desc: 'Publish reviews immediately without manual approval' },
              { key: 'require_email',        label: 'Require email',         desc: 'Email address is mandatory in the review form' },
              { key: 'show_verified_badge',  label: 'Show verified badge',   desc: 'Display "Verified Purchase" badge on eligible reviews' },
              { key: 'allow_video',          label: 'Allow video uploads',   desc: 'Customers can attach videos to their reviews' },
            ] as const).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => set(key, !settings[key])}
                  role="switch"
                  aria-checked={settings[key]}
                  className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    settings[key] ? 'bg-brand-600' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings[key] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}

            {/* Number inputs */}
            <div className="grid gap-6 p-5 sm:grid-cols-2">
              <div>
                <label className="label">Max Media Per Review</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={settings.max_media_per_review}
                  onChange={(e) => set('max_media_per_review', Number(e.target.value))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Reviews Per Page</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.reviews_per_page}
                  onChange={(e) => set('reviews_per_page', Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={updateSettings.isPending} className="btn-primary">
              {updateSettings.isPending ? 'Saving…' : 'Save Settings'}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Icon name="check" size={16} /> Settings saved
              </span>
            )}
          </div>

          {/* Widget snippet */}
          <div className="card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Shopify Embed Snippet</h3>
              <button
                onClick={copySnippet}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 transition hover:text-brand-700"
              >
                {snippetCopied
                  ? <><Icon name="check" size={13} /> Copied</>
                  : <><Icon name="copy" size={13} /> Copy Snippet</>}
              </button>
            </div>
            <pre className="scrollbar-thin overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-200 dark:bg-neutral-950 dark:ring-1 dark:ring-neutral-800">
              {widgetSnippet}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
