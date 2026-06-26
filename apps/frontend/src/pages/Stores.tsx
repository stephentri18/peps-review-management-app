import { useState } from 'react';
import { useStores, useCreateStore, useRotateApiKey } from '../hooks/useStores.js';
import { Spinner } from '../components/ui/Spinner.js';
import { Icon }    from '../components/ui/Icon.js';

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

  const planCls: Record<string, string> = {
    enterprise: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-400/20',
    pro:        'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-400/20',
  };

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">{stores?.length ?? 0} registered stores</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Icon name="plus" size={16} /> Add Store
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4 p-6 animate-fade-in-up">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Register New Store</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Store Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Burnaby Peptides"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Shop Domain</label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="burnaby-peptides.myshopify.com"
                required
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createStore.isPending} className="btn-primary">
              {createStore.isPending ? 'Creating…' : 'Create Store'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Store list */}
      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {stores?.map((store) => (
            <div
              key={store.id}
              className="card flex flex-col gap-4 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <Icon name="store" size={20} />
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">{store.name}</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">{store.shop_domain}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="max-w-[14rem] truncate rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {store.api_key}
                    </code>
                    <button
                      onClick={() => copyKey(store.api_key, store.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 transition hover:text-brand-700"
                    >
                      {copiedId === store.id
                        ? <><Icon name="check" size={13} /> Copied</>
                        : <><Icon name="copy" size={13} /> Copy</>}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${
                    planCls[store.plan] ?? 'bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-400/20'
                  }`}
                >
                  {store.plan}
                </span>
                <button
                  onClick={() => handleRotate(store.id)}
                  disabled={rotateKey.isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-rose-600 disabled:opacity-50"
                >
                  <Icon name="refresh" size={14} /> Rotate Key
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
