import ReviewShowcase from './components/ReviewShowcase';
import ReviewForm from './components/ReviewForm';
import ReviewFormBuilder from './components/ReviewFormBuilder';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard.jsx';
import Support from './components/Support.jsx';
import Topbar from './components/Topbar';

function WooCommerceRequiredOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center bg-background/70">
      <div className="mt-20 w-full max-w-2xl rounded-3xl border border-border bg-background p-8 text-center shadow-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-warning">
          WooCommerce Required
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Activate WooCommerce to use this plugin</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          TS Customer Review depends on WooCommerce products and reviews. Activate WooCommerce first, then return to configure showcases, review forms, and settings.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="plugins.php?s=woocommerce"
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)]"
          >
            Open Plugins
          </a>
          <a
            href="plugin-install.php?s=woocommerce&tab=search&type=term"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Install WooCommerce
          </a>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const currentUrl = window.location.href;
  const hasWooCommerce = Boolean(tsreview_settings?.has_woocommerce);
  const isReviewFormBuilderPage = currentUrl.includes('&path=review-form-builder');
  const isReviewFormPage = currentUrl.includes('&path=review-form');
  const isDashboardPage = currentUrl.includes('&path=dashboard');
  const isSettingsPage = currentUrl.includes('&path=settings');
  const isSupportPage = currentUrl.includes('&path=support');

  let content = <ReviewShowcase />;

  if (isDashboardPage) {
    content = <Dashboard />;
  } else if (isSettingsPage) {
    content = <Settings />;
  } else if (isSupportPage) {
    content = <Support />;
  } else if (isReviewFormBuilderPage) {
    content = <ReviewFormBuilder />;
  } else if (isReviewFormPage) {
    content = <ReviewForm />;
  }

  if (isReviewFormBuilderPage) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className={hasWooCommerce ? '' : 'pointer-events-none select-none blur-[6px] saturate-[0.8]'}>
          <ReviewFormBuilder />
        </div>
        {hasWooCommerce ? null : <WooCommerceRequiredOverlay />}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`tsreview-app-shell min-h-screen overflow-x-hidden bg-background ${hasWooCommerce ? '' : 'pointer-events-none select-none blur-[6px] saturate-[0.8]'}`}>
        <Topbar />

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          {content}
        </main>

        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-4 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-6">
            <span>© 2026 TS Customer Review. Crafted for WordPress.</span>
            <span className="flex items-center gap-3">
              <a href="https://wordpress.org/support/plugin/ts-review-showcase" target="_blank" rel="noreferrer" className="hover:text-foreground">
                Docs
              </a>
              <a href="https://themespell.com/ts-review-showcase" target="_blank" rel="noreferrer" className="hover:text-foreground">
                Changelog
              </a>
              <a href="https://themespell.com/ts-review-showcase" target="_blank" rel="noreferrer" className="hover:text-foreground">
                Roadmap
              </a>
            </span>
          </div>
        </footer>
      </div>
      {hasWooCommerce ? null : <WooCommerceRequiredOverlay />}
    </div>
  );
}

export default AdminPanel;
