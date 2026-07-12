import { useEffect, useMemo, useState } from 'react';
import { Bell, CircleHelp, Save, ShieldCheck, Sparkles, Store, TicketPercent } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';

const tabs = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'review_extensions', label: 'Review Extensions', icon: Sparkles },
  { id: 'review_discount', label: 'Review Discount', icon: TicketPercent },
  { id: 'trust_badges', label: 'Trust Badges', icon: ShieldCheck },
  { id: 'review_reminder', label: 'Review Reminder', icon: Bell },
  { id: 'support', label: 'Help', icon: CircleHelp },
];

const defaultSettings = {
  general: {
    default_showcase: '',
    show_review_form: true,
    email_notifications: true,
    notification_email: '',
    require_purchase: false,
    auto_approve: true,
  },
  review_extensions: {
    enhanced_review_ui: true,
    reviews_per_page: 6,
    sort_order: 'recent',
    disable_lightbox: false,
    show_histogram: true,
    enable_schema: true,
    remove_branding: true,
    verified_owner_label: '',
    avatar_mode: 'standard',
  },
  review_discount: {
    enabled: false,
    incentivized_badge: true,
    incentivized_badge_label: 'Incentivized',
    coupon_channel: 'email',
    email_bcc: '',
    email_reply_to: '',
  },
  trust_badges: {
    enabled: false,
    badge_label: 'Trusted Reviews',
    show_average_rating: true,
    show_review_count: true,
    show_verified_claim: true,
  },
  emails: {
    from_name: '',
    from_email: '',
    reply_to: '',
    accent_color: '#575ECF',
    review_reminder_subject: 'How was your order?',
    review_reminder_body: 'Tell us what you think about your recent purchase.',
    review_discount_subject: 'Your review reward is ready',
    review_discount_body: 'Thanks for your review. Here is your discount reward.',
  },
  messages: {
    wa_review_reminder_enabled: false,
    wa_review_reminder_template: 'Hi {customer_name}, how was your order from {store_name}?',
  },
  review_reminder: {
    enabled: false,
    manual_enabled: false,
    consent_required: true,
    delay_days: 5,
    sender_name: '',
    tracking_enabled: false,
  },
};

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showcases, setShowcases] = useState([]);
  const [formState, setFormState] = useState(defaultSettings);
  const [testReminderEmail, setTestReminderEmail] = useState('');

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
        setFormState({
          ...defaultSettings,
          ...response.data,
          general: { ...defaultSettings.general, ...(response.data.general || {}) },
          review_extensions: { ...defaultSettings.review_extensions, ...(response.data.review_extensions || {}) },
          review_discount: { ...defaultSettings.review_discount, ...(response.data.review_discount || {}) },
          trust_badges: { ...defaultSettings.trust_badges, ...(response.data.trust_badges || {}) },
          emails: { ...defaultSettings.emails, ...(response.data.emails || {}) },
          messages: { ...defaultSettings.messages, ...(response.data.messages || {}) },
          review_reminder: { ...defaultSettings.review_reminder, ...(response.data.review_reminder || {}) },
        });
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

  const patchGroup = (group, field, value) => {
    setFormState((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setSaving(true);
    fetchData('tsreview/settings/save', (response) => {
      setSaving(false);
      if (response?.success) {
        toastNotification('success', 'Settings saved', 'Feature settings updated successfully.');
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Failed to save settings.');
      }
    }, {
      settings: JSON.stringify(formState),
    });
  };

  const runTestAction = (action, payload, successLabel) => {
    fetchData(action, (response) => {
      if (response?.success) {
        toastNotification('success', successLabel, response?.data?.message || 'Success');
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Request failed.');
      }
    }, payload);
  };

  const ToggleRow = ({ group, field, title, description }) => (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => patchGroup(group, field, !formState[group][field])}
        aria-pressed={!!formState[group][field]}
        className={`tsreview-switch ${formState[group][field] ? 'is-active' : ''}`}
      >
        <span className="tsreview-switch__thumb" />
      </button>
    </div>
  );

  const TextField = ({ group, field, label, placeholder = '', type = 'text', help = '' }) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
      <input
        type={type}
        value={formState[group][field] || ''}
        onChange={(event) => patchGroup(group, field, event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      {help ? <p className="mt-1.5 text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );

  const TextareaField = ({ group, field, label, rows = 4, help = '' }) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
      <textarea
        rows={rows}
        value={formState[group][field] || ''}
        onChange={(event) => patchGroup(group, field, event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      {help ? <p className="mt-1.5 text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );

  const SelectField = ({ group, field, label, options, help = '', disabled = false }) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
      <select
        disabled={disabled}
        value={formState[group][field] ?? ''}
        onChange={(event) => patchGroup(group, field, event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? <p className="mt-1.5 text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );

  const SectionCard = ({ title, description, children }) => (
    <section className="bento-card">
      <div className="mb-5 border-b border-border pb-5">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );

  const renderActiveTab = () => {
    if (activeTab === 'general') {
      return (
        <div className="space-y-5">
          <SectionCard title="General Settings" description="Core review display and moderation settings.">
            <SelectField
              group="general"
              field="default_showcase"
              label="Default Review Showcase"
              disabled={loading}
              options={[{ value: '', label: 'Select a showcase…' }, ...showcaseOptions]}
              help="This showcase renders inside the WooCommerce reviews tab."
            />
            <ToggleRow group="general" field="show_review_form" title="Show Review Form" description="Display custom review form below review showcase." />
            <ToggleRow group="general" field="require_purchase" title="Require Verified Purchase" description="Allow only customers who bought the product to submit reviews." />
            <ToggleRow group="general" field="auto_approve" title="Auto Approve Reviews" description="Publish new reviews immediately. Disable for manual moderation." />
            <ToggleRow group="general" field="email_notifications" title="Admin Email Notifications" description="Keep this setting ready for future review notification emails." />
            <TextField group="general" field="notification_email" label="Notification Email" placeholder="you@store.com" />
          </SectionCard>
        </div>
      );
    }

    if (activeTab === 'review_extensions') {
      return (
        <div className="space-y-5">
          <SectionCard title="Display Extensions" description="Enhance how reviews render on product pages.">
            <ToggleRow group="review_extensions" field="enhanced_review_ui" title="Enhanced Review UI" description="Keep showcase rendering active with advanced sorting and summary UI." />
            <ToggleRow group="review_extensions" field="show_histogram" title="Reviews Summary Bar" description="Show average rating and rating histogram above reviews." />
            <ToggleRow group="review_extensions" field="enable_schema" title="Review Schema Markup" description="Output JSON-LD review schema on WooCommerce product pages." />
            <ToggleRow group="review_extensions" field="disable_lightbox" title="Disable Lightbox" description="Reserved setting for media/gallery behavior on future image review layouts." />
            <ToggleRow group="review_extensions" field="remove_branding" title="Remove Branding" description="Store branding preference for future frontend badges and widgets." />
            <SelectField
              group="review_extensions"
              field="sort_order"
              label="Default Sorting"
              options={[
                { value: 'recent', label: 'Recent reviews first' },
                { value: 'rating_high', label: 'Highest rating first' },
                { value: 'rating_low', label: 'Lowest rating first' },
              ]}
            />
            <TextField group="review_extensions" field="reviews_per_page" label="Initial Reviews to Show" type="number" help="Controls initial review count before “Load More Reviews” appears." />
            <SelectField
              group="review_extensions"
              field="avatar_mode"
              label="Customer Avatars"
              options={[
                { value: 'standard', label: 'Standard avatar' },
                { value: 'initials', label: 'Initials avatar' },
                { value: 'hidden', label: 'Hidden' },
              ]}
            />
            <TextField group="review_extensions" field="verified_owner_label" label="Verified Owner Label" placeholder="Verified Purchase" help="Overrides default verified purchase text shown on reviews and trust badge." />
          </SectionCard>
        </div>
      );
    }

    if (activeTab === 'review_discount') {
      return (
        <div className="space-y-5">
          <SectionCard title="Review For Discount" description="Foundation settings for incentivized review flows and future coupon delivery.">
            <ToggleRow group="review_discount" field="enabled" title="Enable Review Rewards" description="Prepare discount/reward features for customers who leave reviews." />
            <ToggleRow group="review_discount" field="incentivized_badge" title="Show Incentivized Badge" description="Display a disclosure badge on incentivized reviews when review meta is present." />
            <TextField group="review_discount" field="incentivized_badge_label" label="Incentivized Badge Label" placeholder="Incentivized" />
            <SelectField
              group="review_discount"
              field="coupon_channel"
              label="Reward Channel"
              options={[
                { value: 'email', label: 'Email' },
                { value: 'wa', label: 'WhatsApp' },
              ]}
            />
            <TextField group="review_discount" field="email_bcc" label="Reward Email BCC" type="email" />
            <TextField group="review_discount" field="email_reply_to" label="Reward Email Reply-To" type="email" />
          </SectionCard>
        </div>
      );
    }

    if (activeTab === 'trust_badges') {
      return (
        <div className="space-y-5">
          <SectionCard title="Trust Badges" description="Show a compact trust summary above product reviews.">
            <ToggleRow group="trust_badges" field="enabled" title="Enable Trust Badge" description="Render trust badge summary above reviews tab content." />
            <TextField group="trust_badges" field="badge_label" label="Badge Label" placeholder="Trusted Reviews" />
            <ToggleRow group="trust_badges" field="show_average_rating" title="Show Average Rating" description="Display product average rating in the badge." />
            <ToggleRow group="trust_badges" field="show_review_count" title="Show Review Count" description="Display approved review count in the badge." />
            <ToggleRow group="trust_badges" field="show_verified_claim" title="Show Verified Claim" description="Display verified-owner text in the badge." />
          </SectionCard>
        </div>
      );
    }

    if (activeTab === 'review_reminder') {
      return (
        <div className="space-y-5">
          <SectionCard title="Review Reminder" description="Foundational settings for future reminder automation.">
            <ToggleRow group="review_reminder" field="enabled" title="Enable Automatic Reminders" description="Store global reminder enablement for future queue/scheduler work." />
            <ToggleRow group="review_reminder" field="manual_enabled" title="Enable Manual Reminders" description="Reserve manual reminder sending from orders in a later phase." />
            <ToggleRow group="review_reminder" field="consent_required" title="Customer Consent Required" description="Track whether reminder emails should require explicit customer consent." />
            <ToggleRow group="review_reminder" field="tracking_enabled" title="Email Open Tracking" description="Store tracking preference for future reminder email metrics." />
            <TextField group="review_reminder" field="delay_days" label="Reminder Delay (Days)" type="number" />
            <TextField group="review_reminder" field="sender_name" label="Reminder Sender Name" />
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-2 text-sm font-semibold text-foreground">Send Test Reminder</div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  type="email"
                  value={testReminderEmail}
                  onChange={(event) => setTestReminderEmail(event.target.value)}
                  placeholder="customer@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => runTestAction('tsreview/review_reminder/send_test', { email: testReminderEmail }, 'Reminder Sent')}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Send Test
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      );
    }

    return (
      <SectionCard title="Help" description="Current implementation status for imported features.">
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Review Extensions are wired to frontend now. Email templates now have a dedicated page. Reminder automation has an MVP backend. Reward logic still needs deeper workflow work.
        </div>
        <a href="?page=ts-review-showcase&path=support" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">
          Open Support
        </a>
      </SectionCard>
    );
  };

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
              Configure review display, extensions, trust badges, reminders, and future reward channels.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="bento-card !p-2 h-fit lg:sticky lg:top-24">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                activeTab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </aside>

        <div className="space-y-5">
          {renderActiveTab()}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Reset
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
