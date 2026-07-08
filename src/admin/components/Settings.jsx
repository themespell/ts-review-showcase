import { useEffect, useMemo, useState } from 'react';
import { Bell, CircleHelp, Save, ShieldCheck, Store } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';

const sectionLinks = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
  { id: 'support', label: 'Help', icon: CircleHelp },
];

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showcases, setShowcases] = useState([]);
  const [formState, setFormState] = useState({
    default_showcase: '',
    show_review_form: true,
    email_notifications: true,
    notification_email: '',
    require_purchase: false,
    auto_approve: true,
  });

  useEffect(() => {
    let completed = 0;
    const finish = () => {
      completed += 1;
      if (completed === 2) {
        setLoading(false);
      }
    };

    fetchData('tsreview/settings/get', (response) => {
      if (response?.success && response.data) {
        setFormState((current) => ({
          ...current,
          default_showcase: response.data.default_showcase ? String(response.data.default_showcase) : '',
          show_review_form: response.data.show_review_form === '1',
        }));
      }
      finish();
    });

    fetchData('tsreview/review_showcase/fetch', (response) => {
      if (response?.success && Array.isArray(response.data)) {
        setShowcases(response.data);
      }
      finish();
    });
  }, []);

  const showcaseOptions = useMemo(
    () => showcases.map((showcase) => ({ label: showcase.title, value: String(showcase.post_id) })),
    [showcases]
  );

  const handleSave = () => {
    setSaving(true);
    fetchData('tsreview/settings/save', (response) => {
      setSaving(false);
      if (response?.success) {
        toastNotification('success', 'Settings saved', 'Display settings updated successfully.');
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Failed to save settings.');
      }
    }, {
      default_showcase: formState.default_showcase,
      show_review_form: formState.show_review_form ? '1' : '',
    });
  };

  const setField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const ToggleRow = ({ field, title, description }) => (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => setField(field, !formState[field])}
        aria-pressed={formState[field]}
        className={`tsreview-switch ${formState[field] ? 'is-active' : ''}`}
      >
        <span className="tsreview-switch__thumb" />
      </button>
    </div>
  );

  const SectionCard = ({ id, icon: Icon, title, description, children }) => (
    <section id={id} className="bento-card">
      <div className="mb-5 flex items-start gap-3 border-b border-border pb-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </section>
  );

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Configuration
            </span>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Configure how reviews appear on product pages, notifications, and moderation rules.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="bento-card !p-2 h-fit lg:sticky lg:top-24">
          {sectionLinks.map(({ id, label, icon: Icon }, index) => (
            <a
              key={id}
              href={`#${id}`}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                index === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
        </aside>

        <div className="space-y-5">
          <SectionCard
            id="general"
            icon={Store}
            title="General Settings"
            description="Choose the default showcase and control review form visibility."
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Default Review Showcase</label>
              <select
                disabled={loading}
                value={formState.default_showcase}
                onChange={(event) => setField('default_showcase', event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              >
                <option value="">Select a showcase…</option>
                {showcaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">This showcase renders below every product page.</p>
            </div>

            <ToggleRow
              field="show_review_form"
              title="Show Review Form"
              description="Display the review form below reviews on product pages."
            />
          </SectionCard>

          <SectionCard
            id="notifications"
            icon={Bell}
            title="Notifications"
            description="Stay in the loop when customers submit reviews."
          >
            <ToggleRow
              field="email_notifications"
              title="Email me on new reviews"
              description="Get an instant email when a review is submitted."
            />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Notification email</label>
              <input
                value={formState.notification_email}
                onChange={(event) => setField('notification_email', event.target.value)}
                placeholder="you@store.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </SectionCard>

          <SectionCard
            id="moderation"
            icon={ShieldCheck}
            title="Moderation"
            description="Keep quality high with smart moderation rules."
          >
            <ToggleRow
              field="require_purchase"
              title="Require verified purchase"
              description="Only customers who purchased the product can submit a review."
            />
            <ToggleRow
              field="auto_approve"
              title="Auto-approve reviews"
              description="Publish reviews immediately without manual approval."
            />
          </SectionCard>

          <SectionCard
            id="support"
            icon={CircleHelp}
            title="Help"
            description="Need help with setup or migration?"
          >
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Documentation, tutorials, and support tickets are available from the Support page.
            </div>
            <a
              href="?page=ts-review-showcase&path=support"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Open Support
            </a>
          </SectionCard>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
