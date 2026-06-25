import { useState } from 'react';
import { useStores, useCreateStore, useRotateApiKey } from '../hooks/useStores.js';
import { Spinner } from '../components/ui/Spinner.js';

export function Stores() {
  const [showForm, setShowForm]   = useState(false);
  const [domain, setDomain]       = useState('');
  const [name, setName]           = useState('');
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  const { data: stores, isLoading } = useStores();
  const createStore  = useCreateStore();
  const rotateKey    = useRotateApiKey();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStore.mutateAsync({ shop_domain: domain, name });
    setDomain(''); setName(''); setShowForm(false);
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRotate = async (id: string) => {
    if (!confirm('Rotate API key? The old key will stop working immediately.')) return;
    await rotateKey.mutateAsync(id);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {stores?.length ?? 0} registered stores
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          + Add Store
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">Register New Store</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Store Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Burnaby Peptides"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Shop Domain
              </label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="burnaby-peptides.myshopify.com"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createStore.isPending}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {createStore.isPending ? 'Creating...' : 'Create Store'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-800 text-sm px-4 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Store list */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {stores?.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">{store.name}</div>
                <div className="text-sm text-gray-500">{store.shop_domain}</div>
                <div className="mt-2 flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono truncate max-w-xs">
                    {store.api_key}
                  </code>
                  <button
                    onClick={() => copyKey(store.api_key, store.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0 transition-colors"
                  >
                    {copiedId === store.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  store.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                  store.plan === 'pro'        ? 'bg-blue-100 text-blue-700' :
                                               'bg-gray-100 text-gray-600'
                }`}>
                  {store.plan}
                </span>
                <button
                  onClick={() => handleRotate(store.id)}
                  disabled={rotateKey.isPending}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors disabled:opacity-50"
                >
                  Rotate Key
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}