import { useState, useEffect } from 'react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';

const FIELD_LABELS = {
  api_key: 'API Key',
  place_id: 'Place ID',
  review_count: 'Number of Reviews',
  sync_interval: 'Sync Interval',
  display: 'Display Location',
  include_rating: 'Include Rating',
  include_review_count: 'Include Review Count',
  feed_slug: 'Feed Slug',
  position: 'Position',
  style: 'Style',
  show_rating: 'Show Rating',
  show_count: 'Show Count',
  list_id: 'Audience / List ID',
  double_optin: 'Double Opt-in',
  tags: 'Tags',
  webhook_url: 'Webhook URL',
  events: 'Events',
  channel: 'Channel',
  mention: 'Mention',
};

const SYNC_INTERVALS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'manual', label: 'Manual Only' },
];

const DISPLAY_OPTIONS = [
  { value: 'product_page', label: 'Product Page' },
  { value: 'sidebar', label: 'Sidebar Widget' },
  { value: 'both', label: 'Both' },
];

const POSITION_OPTIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
];

const STYLE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const EVENT_OPTIONS = [
  { value: 'new_review', label: 'New Review' },
  { value: 'review_replied', label: 'Review Replied' },
  { value: 'low_rating', label: 'Low Rating (1-2 stars)' },
];

function FieldRenderer({ fieldKey, value, onChange }) {
  const label = FIELD_LABELS[fieldKey] || fieldKey;

  if (typeof value === 'boolean') {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{label}</div>
        </div>
        <button type="button" onClick={() => onChange(!value)} className={`tsreview-switch ${value ? 'is-active' : ''}`}>
          <span className="tsreview-switch__thumb" />
        </button>
      </div>
    );
  }

  if (fieldKey === 'sync_interval') {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
        <select value={value || 'weekly'} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
          {SYNC_INTERVALS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  if (fieldKey === 'display') {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
        <select value={value || 'product_page'} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
          {DISPLAY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  if (fieldKey === 'position') {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
        <select value={value || 'bottom-right'} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
          {POSITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  if (fieldKey === 'style') {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
        <select value={value || 'light'} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
          {STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  if (fieldKey === 'events') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
        <div className="space-y-2">
          {EVENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={selected.includes(opt.value)} onChange={(e) => {
                if (e.target.checked) onChange([...selected, opt.value]);
                else onChange(selected.filter((v) => v !== opt.value));
              }} className="rounded border-border" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (fieldKey === 'review_count') {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
        <input type="number" value={value || 10} min={1} max={50} onChange={(e) => onChange(parseInt(e.target.value, 10) || 10)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
      </div>
    );
  }

  if (fieldKey === 'feed_slug') {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="product-feed" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
        <p className="mt-1 text-xs text-muted-foreground">Your feed URL: <code>/?feed={value || 'product-feed'}</code></p>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
    </div>
  );
}

export default function AddonSettings({ addon, onClose }) {
  const [settings, setSettings] = useState(addon.settings || {});
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    fetchData('tsreview/addons/save_settings', (response) => {
      setSaving(false);
      if (response?.success) {
        toastNotification('success', 'Settings saved', `${addon.name} settings updated.`);
        onClose();
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Failed to save settings.');
      }
    }, { addon_id: addon.id, settings: JSON.stringify(settings) });
  };

  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{addon.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-foreground">{addon.name}</h2>
              <p className="text-xs text-muted-foreground">Addon Settings</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <FieldRenderer key={key} fieldKey={key} value={value} onChange={(v) => updateField(key, v)} />
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">Cancel</button>
          <button type="button" disabled={saving} onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
