import {
  ArrowUpRight,
  BookOpen,
  Bug,
  CircleHelp,
  CirclePlay,
  LifeBuoy,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

const supportCards = [
  {
    title: 'Documentation',
    description: 'Guides for every feature, shortcode, and hook.',
    cta: 'Browse docs',
    href: 'https://wordpress.org/support/plugin/ts-review-showcase',
    icon: BookOpen,
  },
  {
    title: 'Video Tutorials',
    description: 'Watch 3-minute walkthroughs for common setups.',
    cta: 'Watch videos',
    href: 'https://themespell.com/ts-review-showcase',
    icon: CirclePlay,
  },
  {
    title: 'Community',
    description: 'Ask questions and share showcases with other users.',
    cta: 'Join community',
    href: 'https://wordpress.org/support/plugin/ts-review-showcase',
    icon: MessageCircle,
  },
  {
    title: 'Report a Bug',
    description: 'Found something off? File a ticket in under a minute.',
    cta: 'Open ticket',
    href: 'https://wordpress.org/support/plugin/ts-review-showcase',
    icon: Bug,
  },
];

const faqs = [
  {
    question: 'How do I insert a showcase in a page?',
    answer: 'Copy shortcode from Review Showcase and paste it into any WordPress block or page builder.',
  },
  {
    question: 'Does it replace the default WooCommerce review form?',
    answer: 'Yes. Pick a form template in Review Form and it replaces the default form on product pages.',
  },
  {
    question: 'Can I only allow verified buyers to leave reviews?',
    answer: 'Enable “Require verified purchase” in Settings → Moderation.',
  },
];

function Support() {
  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Help center
            </span>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Support</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Everything you need to get the most out of TS Customer Review.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="mailto:hello@tscustomerreview.com"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)]"
            >
              <LifeBuoy className="h-4 w-4" />
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {supportCards.map(({ title, description, cta, href, icon: Icon }) => (
          <a key={title} href={href} target="_blank" rel="noreferrer" className="bento-card group flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-primary text-white shadow-[var(--shadow-glow)]">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-primary">{cta} →</span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="bento-card">
          <h3 className="text-lg font-bold text-foreground">Frequently asked</h3>
          <p className="text-sm text-muted-foreground">Quick answers to common questions.</p>
          <div className="mt-5 divide-y divide-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                  {faq.question}
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground transition group-open:rotate-45 group-open:bg-primary group-open:text-white">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="bento-card relative overflow-hidden border-transparent bg-[oklch(0.14_0.04_265)] text-white">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <div className="relative">
            <h3 className="text-xl font-bold text-white">Talk to a human</h3>
            <p className="mt-1 text-sm text-white/70">Pro customers get priority email support within 24 hours.</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="text-white/90">Avg. response: under 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-glow" />
                <span className="text-white/90">Support hours: business days</span>
              </div>
            </div>
            <a
              href="mailto:hello@tscustomerreview.com"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_265)] transition hover:bg-primary-glow hover:text-white"
            >
              Email us
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Support;
