import { useEffect, useMemo, useState } from 'react';
import { Bell, CircleHelp, Mail, Save, ShieldCheck, Sparkles, Store, TicketPercent } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';

const isPro = window.tsreview_settings?.is_pro || false;
const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;
const canUsePro = isPro && !isLicenseInactive;

const PRO_FIELDS = {
  review_extensions: ['reviews_voting', 'no_branding', 'verified_owner_label', 'avatar_mode'],
  trust_badges: ['badge_style', 'floating_enabled', 'floating_type', 'floating_location'],
  emails: ['from_name', 'from_email', 'reply_to', 'bcc', 'color'],
  review_reminder: ['enable_for', 'enable_for_role', 'enable_for_guests', 'consent_text', 'shop_name', 'language'],
};

const tabs = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'review_extensions', label: 'Review Extensions', icon: Sparkles, isPro: true },
  { id: 'review_discount', label: 'Review Discount', icon: TicketPercent },
  { id: 'trust_badges', label: 'Trust Badges', icon: ShieldCheck, isPro: true },
  { id: 'emails', label: 'Emails', icon: Mail, isPro: true },
  { id: 'review_reminder', label: 'Review Reminder', icon: Bell, isPro: true },
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
    enabled: true,
    review_reminder_subject: 'How was your order?',
    review_reminder_heading: 'We value your feedback',
    review_reminder_body: 'Hi {customer_name},\n\nThank you for your recent purchase! We\'d love to hear about your experience.\n\nPlease take a moment to leave a review.\n\nBest regards,\n{shop_name}',
    review_discount_subject: 'Your review reward is ready',
    review_discount_heading: 'Thank you for your review',
    review_discount_body: 'Hi {customer_name},\n\nThank you for leaving a review! As a token of our appreciation, here is a discount coupon: {coupon_code}\n\nBest regards,\n{shop_name}',
    from_name: '',
    from_email: '',
    reply_to: '',
    bcc: '',
    color: '#7f54b3',
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
  const [proSettings, setProSettings] = useState({});

  useEffect(() => {
    let completed = 0;
    const total = canUsePro ? 3 : 2;
    const finish = () => {
      completed += 1;
      if (completed === total) setLoading(false);
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
          review_reminder: { ...defaultSettings.review_reminder, ...(response.data.review_reminder || {}) },
        });
      }
      finish();
    });

    fetchData('tsreview/review_showcase/fetch', (response) => {
      if (response?.success && Array.isArray(response.data)) setShowcases(response.data);
      finish();
    });

    if (canUsePro) {
      const body = new URLSearchParams();
      body.append('action', 'tsreviewpro_load_settings');
      body.append('nonce', window.tsreviewpro_settings?.nonce || '');
      fetch(window.tsreviewpro_settings?.ajax_url || window.tsreview_settings?.ajax_url, { method: 'POST', body })
        .then((res) => res.json())
        .then((json) => { if (json.success && json.data?.settings) setProSettings(json.data.settings); finish(); })
        .catch(() => finish());
    }
  }, []);

  const showcaseOptions = useMemo(
    () => showcases.map((s) => ({ label: s.title, value: String(s.post_id) })),
    [showcases]
  );

  const patchGroup = (group, field, value) => {
    setFormState((c) => ({ ...c, [group]: { ...c[group], [field]: value } }));
  };

  const handleSave = () => {
    if (!canUsePro) return;
    setSaving(true);
    const activeTabDef = tabs.find((t) => t.id === activeTab);
    const isProTab = activeTabDef?.isPro && canUsePro;

    if (isProTab) {
      const body = new URLSearchParams();
      body.append('action', 'tsreviewpro_save_settings');
      body.append('nonce', window.tsreviewpro_settings?.nonce || '');
      body.append('tab', activeTab);
      body.append('settings', JSON.stringify(proSettings[activeTab] || {}));
      fetch(window.tsreviewpro_settings?.ajax_url || window.tsreview_settings?.ajax_url, { method: 'POST', body })
        .then((r) => r.json())
        .then((j) => { setSaving(false); if (j.success) { setProSettings((p) => ({ ...p, [activeTab]: j.data.settings })); toastNotification('success', 'Settings saved', 'Pro feature settings updated.'); } else toastNotification('error', 'Failed', j.data?.message || 'Failed.'); })
        .catch(() => { setSaving(false); toastNotification('error', 'Failed', 'Network error.'); });
    } else {
      const toSave = { ...formState };
      const proFieldsForTab = PRO_FIELDS[activeTab] || [];
      if (proFieldsForTab.length > 0 && toSave[activeTab]) {
        const filtered = { ...toSave[activeTab] };
        proFieldsForTab.forEach((f) => delete filtered[f]);
        toSave[activeTab] = filtered;
      }
      fetchData('tsreview/settings/save', (r) => {
        setSaving(false);
        if (r?.success) toastNotification('success', 'Settings saved', 'Settings updated.');
        else toastNotification('error', 'Failed', r?.data?.message || 'Failed.');
      }, { settings: JSON.stringify(toSave) });
    }
  };

  const runTestAction = (action, payload, label) => {
    fetchData(action, (r) => {
      if (r?.success) toastNotification('success', label, r?.data?.message || 'Success');
      else toastNotification('error', 'Failed', r?.data?.message || 'Failed.');
    }, payload);
  };

  const isProField = (tabId, fieldKey) => !canUsePro && (PRO_FIELDS[tabId] || []).includes(fieldKey);
  const hasProFields = (tabId) => !canUsePro && (PRO_FIELDS[tabId] || []).length > 0;

  const ProBanner = () => (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white">PRO</span>
        <div>
          <p className="text-sm font-semibold text-foreground">Some features require Pro</p>
          <a href="https://themespell.com/ts-review-showcase" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400">Get Pro &rarr;</a>
        </div>
      </div>
    </div>
  );

  const ToggleRow = ({ group, field, title, description }) => {
    const disabled = isProField(group, field);
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-muted/30 p-4" style={disabled ? { opacity: 0.55, pointerEvents: 'none' } : undefined}>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            {title}
            {disabled && <span className="ml-2 inline-block rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white align-middle">PRO</span>}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <button type="button" onClick={() => patchGroup(group, field, !formState[group][field])} aria-pressed={!!formState[group][field]} className={`tsreview-switch ${formState[group][field] ? 'is-active' : ''}`}>
          <span className="tsreview-switch__thumb" />
        </button>
      </div>
    );
  };

  const TextField = ({ group, field, label, placeholder = '', type = 'text', help = '' }) => {
    const disabled = isProField(group, field);
    return (
      <div style={disabled ? { opacity: 0.55, pointerEvents: 'none' } : undefined}>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">
          {label}
          {disabled && <span className="ml-2 inline-block rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white align-middle">PRO</span>}
        </label>
        <input type={type} value={formState[group][field] || ''} disabled={disabled} onChange={(e) => patchGroup(group, field, e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
        {help ? <p className="mt-1.5 text-xs text-muted-foreground">{help}</p> : null}
      </div>
    );
  };

  const TextareaField = ({ group, field, label, rows = 4, help = '' }) => {
    const disabled = isProField(group, field);
    return (
      <div style={disabled ? { opacity: 0.55, pointerEvents: 'none' } : undefined}>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">
          {label}
          {disabled && <span className="ml-2 inline-block rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white align-middle">PRO</span>}
        </label>
        <textarea rows={rows} value={formState[group][field] || ''} disabled={disabled} onChange={(e) => patchGroup(group, field, e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
        {help ? <p className="mt-1.5 text-xs text-muted-foreground">{help}</p> : null}
      </div>
    );
  };

  const SelectField = ({ group, field, label, options, help = '', disabled: forcedDisabled }) => {
    const disabled = forcedDisabled || isProField(group, field);
    return (
      <div style={disabled ? { opacity: 0.55, pointerEvents: 'none' } : undefined}>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">
          {label}
          {isProField(group, field) && <span className="ml-2 inline-block rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white align-middle">PRO</span>}
        </label>
        <select disabled={disabled} value={formState[group][field] ?? ''} onChange={(e) => patchGroup(group, field, e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {help ? <p className="mt-1.5 text-xs text-muted-foreground">{help}</p> : null}
      </div>
    );
  };

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
            <SelectField group="general" field="default_showcase" label="Default Review Showcase" disabled={loading} options={[{ value: '', label: 'Select a showcase…' }, ...showcaseOptions]} help="This showcase renders inside the WooCommerce reviews tab." />
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
      if (canUsePro && window.tsReviewPro?.ReviewExtensionsTab) {
        const ProTab = window.tsReviewPro.ReviewExtensionsTab;
        return (
          <div>
            {hasProFields('review_extensions') && <ProBanner />}
            <ProTab settings={proSettings.review_extensions || {}} proFields={PRO_FIELDS.review_extensions} onChange={(k, v) => setProSettings((p) => ({ ...p, review_extensions: { ...(p.review_extensions || {}), [k]: v } }))} />
          </div>
        );
      }
      return (
        <div>
          {hasProFields('review_extensions') && <ProBanner />}
          <div className="space-y-5">
            <SectionCard title="Display Extensions" description="Enhance how reviews render on product pages.">
              <ToggleRow group="review_extensions" field="enhanced_review_ui" title="Enhanced Review UI" description="Keep showcase rendering active with advanced sorting and summary UI." />
              <ToggleRow group="review_extensions" field="show_histogram" title="Reviews Summary Bar" description="Show average rating and rating histogram above reviews." />
              <ToggleRow group="review_extensions" field="enable_schema" title="Review Schema Markup" description="Output JSON-LD review schema on WooCommerce product pages." />
              <ToggleRow group="review_extensions" field="disable_lightbox" title="Disable Lightbox" description="Reserved setting for media/gallery behavior on future image review layouts." />
              <ToggleRow group="review_extensions" field="remove_branding" title="Remove Branding" description="Store branding preference for future frontend badges and widgets." />
              <SelectField group="review_extensions" field="sort_order" label="Default Sorting" options={[{ value: 'recent', label: 'Recent reviews first' }, { value: 'rating_high', label: 'Highest rating first' }, { value: 'rating_low', label: 'Lowest rating first' }]} />
              <TextField group="review_extensions" field="reviews_per_page" label="Initial Reviews to Show" type="number" help="Controls initial review count before 'Load More Reviews' appears." />
              <SelectField group="review_extensions" field="avatar_mode" label="Customer Avatars" options={[{ value: 'standard', label: 'Standard avatar' }, { value: 'initials', label: 'Initials avatar' }, { value: 'hidden', label: 'Hidden' }]} />
              <TextField group="review_extensions" field="verified_owner_label" label="Verified Owner Label" placeholder="Verified Purchase" help="Overrides default verified purchase text shown on reviews and trust badge." />
              <ToggleRow group="review_extensions" field="reviews_voting" title="Vote for Reviews" description="Allow customers to upvote or downvote reviews." />
            </SectionCard>
          </div>
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
            <SelectField group="review_discount" field="coupon_channel" label="Reward Channel" options={[{ value: 'email', label: 'Email' }, { value: 'wa', label: 'WhatsApp' }]} />
            <TextField group="review_discount" field="email_bcc" label="Reward Email BCC" type="email" />
            <TextField group="review_discount" field="email_reply_to" label="Reward Email Reply-To" type="email" />
          </SectionCard>
        </div>
      );
    }

    if (activeTab === 'trust_badges') {
      if (canUsePro && window.tsReviewPro?.TrustBadgesTab) {
        const ProTab = window.tsReviewPro.TrustBadgesTab;
        return (
          <div>
            {hasProFields('trust_badges') && <ProBanner />}
            <ProTab settings={proSettings.trust_badges || {}} proFields={PRO_FIELDS.trust_badges} onChange={(k, v) => setProSettings((p) => ({ ...p, trust_badges: { ...(p.trust_badges || {}), [k]: v } }))} />
          </div>
        );
      }
      return (
        <div>
          {hasProFields('trust_badges') && <ProBanner />}
          <div className="space-y-5">
            <SectionCard title="Trust Badges" description="Show a compact trust summary above product reviews.">
              <ToggleRow group="trust_badges" field="enabled" title="Enable Trust Badge" description="Render trust badge summary above reviews tab content." />
              <TextField group="trust_badges" field="badge_label" label="Badge Label" placeholder="Trusted Reviews" />
              <ToggleRow group="trust_badges" field="show_average_rating" title="Show Average Rating" description="Display product average rating in the badge." />
              <ToggleRow group="trust_badges" field="show_review_count" title="Show Review Count" description="Display approved review count in the badge." />
              <ToggleRow group="trust_badges" field="show_verified_claim" title="Show Verified Claim" description="Display verified-owner text in the badge." />
              <SelectField group="trust_badges" field="badge_style" label="Badge Style" options={[{ value: 'small-light', label: 'Small Light' }, { value: 'small-dark', label: 'Small Dark' }, { value: 'wide-light', label: 'Wide Light' }, { value: 'wide-dark', label: 'Wide Dark' }]} />
              <ToggleRow group="trust_badges" field="floating_enabled" title="Floating Badge" description="Show a floating trust badge in the corner of every page." />
              <SelectField group="trust_badges" field="floating_type" label="Floating Style" options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
              <SelectField group="trust_badges" field="floating_location" label="Floating Position" options={[{ value: 'bottomright', label: 'Bottom Right' }, { value: 'bottomleft', label: 'Bottom Left' }]} />
            </SectionCard>
          </div>
        </div>
      );
    }

    if (activeTab === 'emails') {
      if (canUsePro && window.tsReviewPro?.EmailsTab) {
        const ProTab = window.tsReviewPro.EmailsTab;
        return (
          <div>
            {hasProFields('emails') && <ProBanner />}
            <ProTab settings={proSettings.emails || {}} proFields={PRO_FIELDS.emails} onChange={(k, v) => setProSettings((p) => ({ ...p, emails: { ...(p.emails || {}), [k]: v } }))} onNestedChange={(pk, ck, v) => setProSettings((p) => ({ ...p, emails: { ...(p.emails || {}), [pk]: { ...((p.emails || {})[pk] || {}), [ck]: v } } }))} />
          </div>
        );
      }
      return (
        <div>
          {hasProFields('emails') && <ProBanner />}
          <SectionCard title="Email Templates" description="Configure email templates sent to customers.">
            <ToggleRow group="emails" field="enabled" title="Enable Custom Emails" description="Use custom email templates instead of WooCommerce defaults." />

            <div className="mt-5">
              <h4 className="mb-3 text-sm font-bold text-foreground">Review Reminder Email</h4>
              <TextField group="emails" field="review_reminder_subject" label="Subject" placeholder="How was your order?" />
              <TextField group="emails" field="review_reminder_heading" label="Heading" placeholder="We value your feedback" />
              <TextareaField group="emails" field="review_reminder_body" label="Body" rows={6} help="Use {customer_name}, {shop_name}, {review_url} for variables." />
            </div>

            <div className="mt-5">
              <h4 className="mb-3 text-sm font-bold text-foreground">Review Discount Email</h4>
              <TextField group="emails" field="review_discount_subject" label="Subject" placeholder="Your review reward is ready" />
              <TextField group="emails" field="review_discount_heading" label="Heading" placeholder="Thank you for your review" />
              <TextareaField group="emails" field="review_discount_body" label="Body" rows={6} help="Use {customer_name}, {shop_name}, {coupon_code} for variables." />
            </div>

            <div className="mt-5">
              <h4 className="mb-3 text-sm font-bold text-foreground">Email Settings</h4>
              <TextField group="emails" field="from_name" label="From Name" placeholder="Store Name" />
              <TextField group="emails" field="from_email" label="From Email" placeholder="noreply@store.com" />
              <TextField group="emails" field="reply_to" label="Reply-To" placeholder="support@store.com" />
              <TextField group="emails" field="bcc" label="BCC" placeholder="admin@store.com" />
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Accent Color</label>
                <input type="color" value={formState.emails?.color || '#7f54b3'} onChange={(e) => patchGroup('emails', 'color', e.target.value)} disabled={isProField('emails', 'color')} style={isProField('emails', 'color') ? { opacity: 0.55, pointerEvents: 'none' } : undefined} />
              </div>
            </div>
          </SectionCard>
        </div>
      );
    }

    if (activeTab === 'review_reminder') {
      if (canUsePro && window.tsReviewPro?.ReviewReminderTab) {
        const ProTab = window.tsReviewPro.ReviewReminderTab;
        return (
          <div>
            {hasProFields('review_reminder') && <ProBanner />}
            <ProTab settings={proSettings.review_reminder || {}} proFields={PRO_FIELDS.review_reminder} onChange={(k, v) => setProSettings((p) => ({ ...p, review_reminder: { ...(p.review_reminder || {}), [k]: v } }))} />
          </div>
        );
      }
      return (
        <div>
          {hasProFields('review_reminder') && <ProBanner />}
          <div className="space-y-5">
            <SectionCard title="Review Reminder" description="Foundational settings for future reminder automation.">
              <ToggleRow group="review_reminder" field="enabled" title="Enable Automatic Reminders" description="Store global reminder enablement for future queue/scheduler work." />
              <ToggleRow group="review_reminder" field="manual_enabled" title="Enable Manual Reminders" description="Reserve manual reminder sending from orders in a later phase." />
              <ToggleRow group="review_reminder" field="consent_required" title="Customer Consent Required" description="Track whether reminder emails should require explicit customer consent." />
              <ToggleRow group="review_reminder" field="tracking_enabled" title="Email Open Tracking" description="Store tracking preference for future reminder email metrics." />
              <TextField group="review_reminder" field="delay_days" label="Reminder Delay (Days)" type="number" />
              <TextField group="review_reminder" field="sender_name" label="Reminder Sender Name" />
              <SelectField group="review_reminder" field="enable_for" label="Enable for" options={[{ value: 'all', label: 'All Products' }, { value: 'categories', label: 'Specific Categories' }]} />
              <SelectField group="review_reminder" field="enable_for_role" label="Enable for Roles" options={[{ value: 'all', label: 'All Roles' }, { value: 'roles', label: 'Specific Roles' }]} />
              <ToggleRow group="review_reminder" field="enable_for_guests" title="Enable for Guests" description="Send reminders to guest checkout customers." />
              <TextareaField group="review_reminder" field="consent_text" label="Customer Consent Text" />
              <TextField group="review_reminder" field="shop_name" label="Shop Name" placeholder="Auto-detect from site title" />
              <SelectField group="review_reminder" field="language" label="Language" options={[{ value: 'EN', label: 'English' }, { value: 'DE', label: 'German' }, { value: 'FR', label: 'French' }, { value: 'ES', label: 'Spanish' }]} />
            </SectionCard>
          </div>
        </div>
      );
    }

    if (activeTab === 'support') {
      return (
        <SectionCard title="Help" description="Current implementation status for imported features.">
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Review Extensions are wired to frontend now. Email templates now have a dedicated page. Reminder automation has an MVP backend. Reward logic still needs deeper workflow work.
          </div>
          <a href="?page=ts-review-showcase&path=support" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">Open Support</a>
        </SectionCard>
      );
    }

    return null;
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
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Configure review display, extensions, trust badges, reminders, and future reward channels.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="bento-card !p-2 h-fit lg:sticky lg:top-24">
          {tabs.map(({ id, label, icon: Icon, isPro: tabIsPro }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${activeTab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {tabIsPro && !canUsePro ? <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">PRO</span> : null}
            </button>
          ))}
        </aside>

        <div className="space-y-5">
          {renderActiveTab()}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => window.location.reload()} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">Reset</button>
            <button type="button" disabled={saving || !canUsePro} onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-40">
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
