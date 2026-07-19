import { useState } from 'react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';

const CATEGORY_LABELS = {
  integration: 'Integration',
  communication: 'Communication',
  seo: 'SEO',
  trust: 'Trust',
  crm: 'CRM',
  automation: 'Automation',
};

const CATEGORY_COLORS = {
  integration: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  communication: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  seo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  trust: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  crm: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  automation: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function AddonCard({ addon, isPro, onToggle, onConfigure }) {
  const [toggling, setToggling] = useState(false);

  const canToggle = addon.is_core ? false : (addon.is_pro ? isPro : true);

  const handleToggle = () => {
    if (!canToggle) return;
    setToggling(true);
    fetchData('tsreview/addons/toggle', (response) => {
      setToggling(false);
      if (response?.success) {
        onToggle(addon.id, !addon.is_active);
        toastNotification('success', 'Addon updated', `${addon.name} has been ${!addon.is_active ? 'enabled' : 'disabled'}.`);
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Failed to toggle addon.');
      }
    }, { addon_id: addon.id, active: addon.is_active ? '0' : '1' });
  };

  return (
    <div className={`bento-card relative overflow-hidden transition ${addon.is_active ? 'ring-2 ring-primary/20' : ''}`}>
      {addon.is_pro && !isPro && (
        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">PRO</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
          {addon.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{addon.name}</h3>
            {addon.is_core && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">CORE</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{addon.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[addon.category] || 'bg-muted text-muted-foreground'}`}>
              {CATEGORY_LABELS[addon.category] || addon.category}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3">
        {!addon.is_core ? (
          <button
            type="button"
            disabled={!canToggle || toggling}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              addon.is_active ? 'bg-primary' : 'bg-muted'
            } ${!canToggle ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${addon.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        ) : null}
        <span className="text-xs font-medium text-muted-foreground">
          {addon.is_core ? 'Always Active' : (addon.is_active ? 'Active' : 'Inactive')}
        </span>

        {addon.settings && Object.keys(addon.settings).length > 0 && (
          <button
            type="button"
            disabled={!canToggle}
            onClick={() => onConfigure(addon)}
            className={`ml-auto rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted ${!canToggle ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            Configure
          </button>
        )}
      </div>
    </div>
  );
}
