import { Plus } from 'lucide-react';
import Container from '../../common/components/Container.jsx';
import commonStore from '../../common/states/commonStore.js';

function ReviewShowcase() {
  const { saveSettings } = commonStore((state) => ({
    saveSettings: state.saveSettings,
  }));

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Showcases
            </span>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Review Showcase
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Build embeddable review widgets and drop them anywhere with shortcode or PHP snippet.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => saveSettings('createModal', true)}
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Create Showcase
            </button>
          </div>
        </div>
      </section>

      <Container type="review_showcase" title="Review Showcase" editor={true} hideNav />
    </>
  );
}

export default ReviewShowcase;
