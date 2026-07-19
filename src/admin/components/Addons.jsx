import { useEffect, useState } from 'react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';
import AddonCard from './AddonCard';
import AddonSettings from './AddonSettings';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'integration', label: 'Integrations' },
  { id: 'communication', label: 'Communication' },
  { id: 'seo', label: 'SEO' },
  { id: 'trust', label: 'Trust' },
  { id: 'crm', label: 'CRM' },
  { id: 'automation', label: 'Automation' },
];

const isPro = window.tsreview_settings?.is_pro || false;

export default function Addons() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [configuringAddon, setConfiguringAddon] = useState(null);

  useEffect(() => {
    fetchData('tsreview/addons/get', (response) => {
      if (response?.success && response.data) {
        const list = Object.values(response.data);
        setAddons(list);
      }
      setLoading(false);
    });
  }, []);

  const handleToggle = (addonId, newState) => {
    setAddons((prev) => prev.map((a) => a.id === addonId ? { ...a, is_active: newState } : a));
  };

  const filteredAddons = addons.filter((addon) => {
    if (activeCategory !== 'all' && addon.category !== activeCategory) return false;
    if (search && !addon.name.toLowerCase().includes(search.toLowerCase()) && !addon.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const freeAddons = filteredAddons.filter((a) => !a.is_pro);
  const proAddons = filteredAddons.filter((a) => a.is_pro);

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Integrations
            </span>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Addons</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Extend your review system with third-party integrations and premium features.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search addons…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-64"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Loading addons…</div>
      ) : (
        <>
          {/* Free Addons */}
          {freeAddons.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-foreground">Free Addons</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {freeAddons.map((addon) => (
                  <AddonCard key={addon.id} addon={addon} isPro={isPro} onToggle={handleToggle} onConfigure={setConfiguringAddon} />
                ))}
              </div>
            </div>
          )}

          {/* Pro Addons */}
          {proAddons.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-bold text-foreground">Pro Addons</h2>
                {!isPro && (
                  <a href="https://themespell.com/ts-review-showcase" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-white hover:bg-amber-600">
                    Upgrade to Pro
                  </a>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {proAddons.map((addon) => (
                  <AddonCard key={addon.id} addon={addon} isPro={isPro} onToggle={handleToggle} onConfigure={setConfiguringAddon} />
                ))}
              </div>
            </div>
          )}

          {filteredAddons.length === 0 && (
            <div className="py-20 text-center text-sm text-muted-foreground">No addons found.</div>
          )}
        </>
      )}

      {configuringAddon && (
        <AddonSettings addon={configuringAddon} onClose={() => setConfiguringAddon(null)} />
      )}
    </>
  );
}
