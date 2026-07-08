import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, PenLine, Sparkles, Star } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { migrateBuilderForm } from '../../common/utils/radiantFormBuilder';

const presets = [
  { key: 'minimal', name: 'Minimal', description: 'Clean, quiet, compact.', tags: ['simple', 'tight', 'clean'] },
  { key: 'card', name: 'Card', description: 'Balanced boxed form for product pages.', tags: ['default', 'rounded', 'safe'] },
  { key: 'editorial', name: 'Editorial', description: 'Serif-forward layout with calmer contrast.', tags: ['serif', 'premium', 'soft'] },
  { key: 'playful', name: 'Playful', description: 'Bright accent, softer background, bigger radius.', tags: ['vibrant', 'friendly', 'bold'] },
  { key: 'brutalist', name: 'Brutalist', description: 'Sharp edges, hard contrast, loud presence.', tags: ['sharp', 'flat', 'loud'] },
];

function TemplatePreview({ accent, background }) {
  return (
    <div className="grid h-full w-full place-items-center p-4" style={{ background }}>
      <div className="w-full max-w-[240px] rounded-2xl border bg-white p-4 shadow-lg" style={{ borderColor: `${accent}33` }}>
        <div className="mb-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5" style={{ color: accent, fill: accent }} />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-2/3 rounded bg-slate-200" />
          <div className="h-10 rounded-xl border border-slate-200 bg-slate-50" />
          <div className="h-10 rounded-xl border border-slate-200 bg-slate-50" />
          <div className="h-24 rounded-xl border border-slate-200 bg-slate-50" />
          <div className="h-10 w-32 rounded-xl" style={{ background: accent }} />
        </div>
      </div>
    </div>
  );
}

function ReviewForm() {
  const [builder, setBuilder] = useState(() => migrateBuilderForm(tsreview_settings.review_form_settings || {}));
  const activePreset = useMemo(() => presets.find((preset) => preset.key === builder.preset) || presets[1], [builder.preset]);

  useEffect(() => {
    fetchData('tsreview/review-form/get', (response) => {
      if (response?.success) {
        setBuilder(migrateBuilderForm(response.data || {}));
      }
    });
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[6px] saturate-[0.8]">
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Radiant Form Builder
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Preset gallery</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Choose preset. Open separate builder. Build with sections, columns, widgets, drag/drop.</p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] opacity-80">
            <PenLine className="h-4 w-4" />
            Open Builder
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">Active preset: {activePreset.name}</span>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">Sections: {builder.sections.length}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {presets.map((preset) => (
          <div key={preset.key} className="bento-card !p-0 flex flex-col overflow-hidden">
            <div className="h-44 border-b border-border">
              <TemplatePreview accent={(builder.preset === preset.key ? builder.accent : undefined) || (preset.key === 'playful' ? '#db2777' : preset.key === 'editorial' ? '#7c2d12' : preset.key === 'brutalist' ? '#000000' : preset.key === 'minimal' ? '#111827' : '#2563eb')} background={preset.key === 'editorial' ? '#faf7f2' : preset.key === 'playful' ? '#fff1f2' : preset.key === 'brutalist' ? '#fef08a' : '#ffffff'} />
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{preset.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
                </div>
                {builder.preset === preset.key ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Free</span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {preset.tags.map((tag) => (
                  <span key={`${preset.key}-${tag}`} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{tag}</span>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <a href={`?page=ts-review-showcase&path=review-form-builder&template=${preset.key}`} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted">
                  <Eye className="h-4 w-4" />
                  Preview/Edit
                </a>
                <a href={`?page=ts-review-showcase&path=review-form-builder&template=${preset.key}`} className="flex items-center justify-center gap-1.5 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]">
                  <PenLine className="h-4 w-4" />
                  Builder
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 mt-10 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary-glow" />
        <h2 className="text-lg font-bold text-foreground">Pro Templates</h2>
        <span className="text-xs text-muted-foreground">(Upgrade to unlock)</span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'Video Review', description: 'Capture video testimonials' },
          { name: 'Photo Gallery', description: 'Multi-image uploads with preview' },
          { name: 'Conversational', description: 'Step-by-step chat style flow' },
        ].map((template) => (
          <div key={template.name} className="bento-card !p-0 relative flex flex-col overflow-hidden">
            <div className="relative h-40 border-b border-border">
              <TemplatePreview accent="#7c3aed" background="#eef2ff" />
              <div className="absolute inset-0 grid place-items-center bg-[oklch(0.14_0.04_265)]/40 backdrop-blur-[2px]">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-primary shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-foreground">{template.name}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3 w-3" />
                  Pro
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
              <a href="https://themespell.com/ts-review-showcase" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[oklch(0.14_0.04_265)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary">
                Upgrade to Unlock
              </a>
            </div>
          </div>
        ))}
      </div>
      </div>

      <div className="absolute inset-0 z-10 flex items-start justify-center">
        <div className="mt-20 w-full max-w-xl rounded-3xl border border-border bg-background/95 p-8 text-center shadow-2xl backdrop-blur-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-warning">
            <Sparkles className="h-3.5 w-3.5" />
            Coming Soon
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Review Form Builder</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Frontend review form builder under final polish. Layouts, drag/drop, template controls will be available here soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReviewForm;
