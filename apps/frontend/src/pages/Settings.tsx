import { useState, useEffect } from 'react';
import { useStores, useUpdateWidgetSettings } from '../hooks/useStores.js';
import { storesApi } from '../api/stores.js';
import { Spinner } from '../components/ui/Spinner.js';
import type { WidgetSettings } from '@reviews/types';

export function Settings() {
  const { data: stores, isLoading: storesLoading } = useStores();
  const [selectedStoreId, setSelectedStoreId]       = useState('');
  const [settings, setSettings]                     = useState<WidgetSettings | null>(null);
  const [loadingSettings, setLoadingSettings]       = useState(false);
  const [saved, setSaved]                           = useState(false);

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
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Widget Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure the review widget per store</p>
      </div>

      {/* Store selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Store</label>
        {storesLoading ? <Spinner size="sm" /> : (
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            {stores?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {loadingSettings ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : settings ? (
        <div className="space-y-6">
          {/* Settings form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

            {/* Theme color */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Theme Color</div>
                <div className="text-xs text-gray-500">Applied to buttons and accents in the widget</div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ background: settings.theme_color }}
                />
                <input
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => set('theme_color', e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer border border-gray-300"
                />
              </div>
            </div>

            <hr />

            {/* Toggles */}
            {([
              { key: 'auto_approve',        label: 'Auto-approve reviews',  desc: 'Publish reviews immediately without manual approval' },
              { key: 'require_email',        label: 'Require email',         desc: 'Email address is mandatory in the review form' },
              { key: 'show_verified_badge',  label: 'Show verified badge',   desc: 'Display "Verified Purchase" badge on eligible reviews' },
              { key: 'allow_video',          label: 'Allow video uploads',   desc: 'Customers can attach videos to their reviews' },
            ] as const).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <button
                  onClick={() => set(key, !settings[key])}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings[key] ? 'bg-slate-800' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${
                    settings[key] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}

            <hr />

            {/* Number inputs */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Max Media Per Review
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={settings.max_media_per_review}
                  onChange={(e) => set('max_media_per_review', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Reviews Per Page
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.reviews_per_page}
                  onChange={(e) => set('reviews_per_page', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Settings saved</span>
            )}
          </div>

          {/* Widget snippet */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Shopify Embed Snippet</h3>
              <button
                onClick={() => navigator.clipboard.writeText(widgetSnippet)}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Copy Snippet
              </button>
            </div>
            <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto text-gray-700 leading-relaxed">
              {widgetSnippet}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}