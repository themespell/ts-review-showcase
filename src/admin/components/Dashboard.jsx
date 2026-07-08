import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CircleCheck,
  Clock3,
  FileText,
  LayoutTemplate,
  MessageSquare,
  Sparkles,
  Star,
} from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';

function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [showcases, setShowcases] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let completed = 0;
    const finish = () => {
      completed += 1;
      if (completed === 3) {
        setLoading(false);
      }
    };

    fetchData('tsreview/reviews/fetch', (response) => {
      if (response?.success && Array.isArray(response.data)) {
        setReviews(response.data);
      }
      finish();
    });

    fetchData('tsreview/review_showcase/fetch', (response) => {
      if (response?.success && Array.isArray(response.data)) {
        setShowcases(response.data);
      }
      finish();
    });

    fetchData('tsreview/settings/get', (response) => {
      if (response?.success && response.data) {
        setSettings(response.data);
      }
      finish();
    });
  }, []);

  const dashboardStats = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews).toFixed(2)
      : '0.00';
    const productCount = new Set(reviews.map((review) => review.product_id).filter(Boolean)).size;
    const showcaseCount = showcases.length;

    return [
      { label: 'Total reviews', value: totalReviews, helper: `${productCount} products`, icon: MessageSquare },
      { label: 'Avg. rating', value: averageRating, helper: totalReviews ? `${totalReviews} published` : 'No ratings yet', icon: Star },
      { label: 'Showcases', value: showcaseCount, helper: settings?.default_showcase ? '1 default active' : 'No default selected', icon: LayoutTemplate },
      { label: 'Review form', value: settings?.show_review_form === '1' ? 'On' : 'Off', helper: settings?.show_review_form === '1' ? 'Visible on product pages' : 'Hidden on product pages', icon: FileText },
    ];
  }, [reviews, showcases, settings]);

  const recentReviews = useMemo(() => reviews.slice(0, 4), [reviews]);

  const defaultShowcase = useMemo(() => {
    if (!settings?.default_showcase) {
      return null;
    }

    return showcases.find((showcase) => String(showcase.post_id) === String(settings.default_showcase)) || null;
  }, [showcases, settings]);

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live overview
            </span>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your review command center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Live counts from your WooCommerce reviews, showcase library, and display settings.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="?page=ts-review-showcase&path=showcase"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Create Showcase
            </a>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-6">
        {dashboardStats.map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="bento-card md:col-span-3 lg:col-span-3 xl:col-span-3 !p-5 flex min-h-[130px] flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-foreground">{loading ? '...' : value}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">{loading ? 'Loading' : helper}</div>
            </div>
          </div>
        ))}

        <div className="bento-card gradient-mesh relative overflow-hidden md:col-span-6 lg:col-span-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Quick start
              </span>
              <h3 className="mt-3 text-2xl font-bold text-foreground">Review setup status</h3>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Current display configuration pulled from plugin settings.
              </p>
            </div>

            <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-primary text-white shadow-[var(--shadow-glow)]">
              <FileText className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
              Default showcase: {defaultShowcase?.title || 'Not selected'}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
              Review form: {settings?.show_review_form === '1' ? 'Visible' : 'Hidden'}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
              Templates: {showcases.length} ready
            </span>
          </div>

          <a
            href="?page=ts-review-showcase&path=settings"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
          >
            Open Settings
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="bento-card flex flex-col md:col-span-3 lg:col-span-2">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Default showcase</div>
            <div className="mt-2 text-lg font-bold text-foreground">
              {loading ? 'Loading...' : defaultShowcase?.title || 'No default showcase selected'}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {defaultShowcase
                ? `Shortcode ${defaultShowcase.shortcode}`
                : 'Pick one in Settings to auto-render below every product review tab.'}
            </p>
          </div>

          <a href="?page=ts-review-showcase&path=settings" className="mt-auto pt-4 text-sm font-semibold text-primary">
            Manage integration →
          </a>
        </div>

        <div className="bento-card md:col-span-6 lg:col-span-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recent reviews</h3>
              <p className="text-xs text-muted-foreground">Latest approved WooCommerce reviews</p>
            </div>
            <a href="?page=ts-review-showcase&path=showcase" className="text-xs font-semibold text-primary hover:underline">
              View showcases
            </a>
          </div>

          {recentReviews.length ? (
            <ul className="divide-y divide-border">
              {recentReviews.map((item) => {
                const initials = (item.reviewer_name || '?')
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join('');

                return (
                  <li key={item.comment_id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-primary text-xs font-bold text-white">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{item.reviewer_name}</div>
                        <div className="truncate text-xs text-muted-foreground">on {item.product_name || 'Unknown product'}</div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`${item.comment_id}-star-${index}`}
                            className={`h-3.5 w-3.5 ${index < Number(item.rating || 0) ? 'fill-warning text-warning' : 'text-border'}`}
                          />
                        ))}
                      </span>

                      <span className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-flex ${item.verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {item.verified ? <CircleCheck className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                        {item.verified ? 'verified' : 'guest'}
                      </span>

                      <span className="text-[11px] text-muted-foreground">
                        {new Date(item.review_date).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
              No approved reviews yet.
            </div>
          )}
        </div>

        <div className="bento-card relative overflow-hidden border-transparent bg-[oklch(0.14_0.04_265)] text-white md:col-span-3 lg:col-span-2">
          <div className="absolute inset-0 gradient-mesh opacity-40" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-glow">
              <Sparkles className="h-3 w-3" />
              Pro
            </span>
            <h3 className="mt-3 text-xl font-bold text-white">Unlock premium layouts</h3>
            <p className="mt-1.5 text-sm text-white/70">Advanced templates, richer review media, faster conversions.</p>
            <a
              href="https://themespell.com/ts-review-showcase"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[oklch(0.14_0.04_265)] transition hover:bg-primary-glow hover:text-white"
            >
              Upgrade
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
