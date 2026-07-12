import { useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Send, Sparkles } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';

const defaults = {
  from_name: '',
  from_email: '',
  reply_to: '',
  accent_color: '#575ECF',
  review_reminder_subject: 'How was your order?',
  review_reminder_body: 'Hi {customer_name},\n\nWe would love your feedback on {product_name}.\nLeave your review here: {review_link}\n\nThanks,\n{store_name}',
  review_discount_subject: 'Your review reward is ready',
  review_discount_body: 'Hi {customer_name},\n\nThanks for reviewing {product_name}.\nYour reward code: {coupon_code}\n\nEnjoy,\n{store_name}',
};

const previewTokens = {
  '{store_name}': 'ThemeSpell Store',
  '{customer_name}': 'Alex',
  '{product_name}': 'Premium Headphones',
  '{review_link}': 'https://example.com/product/premium-headphones/#reviews',
  '{coupon_code}': 'TSREVIEW10',
};

function EmailTemplates() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('review_reminder');
  const [emails, setEmails] = useState(defaults);

  useEffect(() => {
    fetchData('tsreview/settings/get', (response) => {
      setLoading(false);
      if (response?.success && response.data?.emails) {
        setEmails({ ...defaults, ...response.data.emails });
      }
    });
  }, []);

  const patch = (field, value) => {
    setEmails((current) => ({ ...current, [field]: value }));
  };

  const saveEmails = () => {
    setSaving(true);
    fetchData('tsreview/settings/save', (response) => {
      setSaving(false);
      if (response?.success) {
        toastNotification('success', 'Templates Saved', 'Email templates updated successfully.');
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Could not save email templates.');
      }
    }, {
      settings: JSON.stringify({ emails }),
    });
  };

  const sendTest = (template) => {
    fetchData('tsreview/emails/send_test', (response) => {
      if (response?.success) {
        toastNotification('success', 'Test Sent', response?.data?.message || 'Email sent.');
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Could not send test email.');
      }
    }, {
      email: testEmail,
      template,
    });
  };

  const preview = useMemo(() => {
    const subject = activeTemplate === 'review_discount' ? emails.review_discount_subject : emails.review_reminder_subject;
    const body = activeTemplate === 'review_discount' ? emails.review_discount_body : emails.review_reminder_body;
    return {
      subject: Object.entries(previewTokens).reduce((text, [token, value]) => text.replaceAll(token, value), subject),
      body: Object.entries(previewTokens).reduce((text, [token, value]) => text.replaceAll(token, value), body),
    };
  }, [activeTemplate, emails]);

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Interactive
            </span>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Email Templates</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Customize sender details, subjects, and bodies with live preview and test send.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="bento-card">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">Template Editor</h3>
              <p className="text-sm text-muted-foreground">Use supported tokens: {Object.keys(previewTokens).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setActiveTemplate('review_reminder')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTemplate === 'review_reminder' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>
                Reminder
              </button>
              <button type="button" onClick={() => setActiveTemplate('review_discount')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTemplate === 'review_discount' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>
                Reward
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">From Name</label>
                <input value={emails.from_name || ''} onChange={(event) => patch('from_name', event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">From Email</label>
                <input type="email" value={emails.from_email || ''} onChange={(event) => patch('from_email', event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Reply-To</label>
                <input type="email" value={emails.reply_to || ''} onChange={(event) => patch('reply_to', event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Accent Color</label>
              <input type="color" value={emails.accent_color || '#575ECF'} onChange={(event) => patch('accent_color', event.target.value)} className="h-11 w-24 rounded-lg border border-border bg-background p-1" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Subject</label>
              <input
                value={activeTemplate === 'review_discount' ? emails.review_discount_subject || '' : emails.review_reminder_subject || ''}
                onChange={(event) => patch(activeTemplate === 'review_discount' ? 'review_discount_subject' : 'review_reminder_subject', event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Body</label>
              <textarea
                rows={12}
                value={activeTemplate === 'review_discount' ? emails.review_discount_body || '' : emails.review_reminder_body || ''}
                onChange={(event) => patch(activeTemplate === 'review_discount' ? 'review_discount_body' : 'review_reminder_body', event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-6 text-foreground outline-none transition focus:border-primary"
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Send className="h-4 w-4" />
                Send Test Email
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  placeholder="test@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => sendTest(activeTemplate)}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Send Test
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => window.location.reload()} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">
                Reset
              </button>
              <button type="button" disabled={saving || loading} onClick={saveEmails} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60">
                <Sparkles className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Templates'}
              </button>
            </div>
          </div>
        </section>

        <section className="bento-card">
          <div className="mb-5 flex items-center gap-2 border-b border-border pb-5">
            <Eye className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Live Preview</h3>
              <p className="text-sm text-muted-foreground">Rendered with sample tokens.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="px-5 py-4 text-white" style={{ background: emails.accent_color || '#575ECF' }}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="h-4 w-4" />
                {emails.from_name || 'Your Store'}
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</div>
                <div className="mt-1 text-sm font-semibold text-foreground">{preview.subject}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Body</div>
                <div className="mt-2 whitespace-pre-line rounded-xl bg-muted/30 p-4 text-sm leading-6 text-foreground">
                  {preview.body}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default EmailTemplates;
