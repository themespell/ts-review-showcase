import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Columns2,
  Columns3,
  Columns4,
  Copy,
  Eye,
  GripVertical,
  Minus,
  Monitor,
  MoveDown,
  MoveUp,
  Plus,
  Save,
  Settings2,
  Smartphone,
  Trash2,
  Type,
} from 'lucide-react';
import RadiantFormRender from '../../common/components/RadiantFormRender';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';
import {
  FIELD_TYPES,
  FORM_PRESETS,
  HELPER_TYPES,
  addSection,
  createBuilderForm,
  deleteSection,
  deleteWidget,
  duplicateSection,
  duplicateWidget,
  findColumn,
  findColumnOfWidget,
  findSection,
  findWidget,
  insertNewWidget,
  migrateBuilderForm,
  moveSection,
  moveWidget,
  normalizeBuilderForm,
  setSectionLayout,
  updateColumn,
  updateSection,
  updateWidget,
  widthToFr,
} from '../../common/utils/radiantFormBuilder';

const WIDGET_LABELS = {
  name: 'Name',
  email: 'Email',
  rating: 'Rating',
  title: 'Title',
  review: 'Review',
  heading: 'Heading',
  paragraph: 'Paragraph',
  divider: 'Divider',
  spacer: 'Spacer',
  button: 'Button',
};

function IconButton({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-40 ${props.className || ''}`}
    >
      {children}
    </button>
  );
}

const surfaceCardClass = 'rounded-2xl border border-border bg-card shadow-sm';

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function SliderField({ label, value, min = 0, max = 100, step = 1, onChange, display }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{display || value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--tw-ring-color)]"
        style={{ ['--tw-ring-color']: '#575ECF' }}
      />
    </div>
  );
}

function TextInput(props) {
  return <input {...props} className={`w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary ${props.className || ''}`} />;
}

function SelectInput(props) {
  return <select {...props} className={`w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary ${props.className || ''}`} />;
}

function Toggle({ label, checked, onChange, subtitle }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {subtitle ? <span className="block text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
    </label>
  );
}

function InspectorPanel({ title, subtitle, children }) {
  return (
    <details open className="overflow-hidden rounded-xl border border-border bg-background group">
      <summary className="flex cursor-pointer list-none items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
        <span className="text-xs text-muted-foreground transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="space-y-4 p-4">{children}</div>
    </details>
  );
}

function DraggableLibraryItem({ type, icon, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new:${type}`,
    data: { kind: 'new', type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
      className="group flex touch-none w-full cursor-grab flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-xs transition hover:border-primary/40 hover:bg-muted/50 active:cursor-grabbing"
    >
      {icon}
      <span className="font-medium">{WIDGET_LABELS[type]}</span>
    </button>
  );
}

function SortableWidget({ widget, form, selected, onSelect, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `w:${widget.id}`,
    data: { kind: 'widget', widgetId: widget.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/widget relative rounded-xl border-2 border-dashed p-2 transition ${
        selected
          ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(87,94,207,0.12)]'
          : 'border-transparent hover:border-primary/30'
      }`}
    >
      <div className="pointer-events-none absolute -top-3 left-3 z-10 flex items-center gap-1 opacity-0 transition group-hover/widget:opacity-100 group-focus-within/widget:opacity-100">
        <div className="pointer-events-auto flex items-center gap-1 rounded-md border border-border bg-background px-1 py-1 shadow-sm">
          <button type="button" {...attributes} {...listeners} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onSelect} className="rounded-md px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted">
            {WIDGET_LABELS[widget.type] || widget.type}
          </button>
          <button type="button" onClick={onDuplicate} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onDelete} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div onClick={onSelect} className="cursor-pointer rounded-lg px-0 py-0">
        <RadiantFormRender
          previewMode
          frame="widget"
          builderForm={{
            ...form,
            sections: [
              {
                id: 'editor-preview',
                background: '',
                paddingY: 0,
                paddingX: 0,
                gap: 0,
                columns: [{ id: 'editor-col', width: '1/1', align: 'top', widgets: [widget] }],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

function DroppableColumn({ column, form, selection, onSelect, onDeleteWidget, onDuplicateWidget }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col:${column.id}`,
    data: { kind: 'column', columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelect({ kind: 'column', id: column.id })}
      className={`relative min-h-[120px] rounded-xl border-2 border-dashed p-2 transition ${selection.kind === 'column' && selection.id === column.id ? 'border-primary bg-primary/5' : isOver ? 'border-primary/60 bg-primary/5 shadow-[inset_0_0_0_1px_rgba(87,94,207,0.15)]' : 'border-border/60 bg-transparent'}`}
    >
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Column
      </div>
      <SortableContext items={column.widgets.map((widget) => `w:${widget.id}`)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {column.widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              form={form}
              selected={selection.kind === 'widget' && selection.id === widget.id}
              onSelect={() => onSelect({ kind: 'widget', id: widget.id })}
              onDelete={() => onDeleteWidget(widget.id)}
              onDuplicate={() => onDuplicateWidget(widget.id)}
            />
          ))}
        </div>
      </SortableContext>
      {!column.widgets.length ? <div className="py-6 text-center text-xs text-muted-foreground">Drop widget here</div> : null}
    </div>
  );
}

export default function ReviewFormBuilder() {
  const [builder, setBuilder] = useState(() => migrateBuilderForm(tsreview_settings.review_form_settings || {}));
  const [savedBuilder, setSavedBuilder] = useState(() => migrateBuilderForm(tsreview_settings.review_form_settings || {}));
  const [selection, setSelection] = useState({ kind: 'form' });
  const [dragging, setDragging] = useState(null);
  const [device, setDevice] = useState('desktop');
  const [preview, setPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData('tsreview/review-form/get', (response) => {
      let next = migrateBuilderForm(response?.data || {});
      const queryPreset = new URLSearchParams(window.location.search).get('template');
      if (queryPreset && FORM_PRESETS[queryPreset]) {
        next = normalizeBuilderForm({
          ...next,
          preset: queryPreset,
          ...FORM_PRESETS[queryPreset],
        });
      }
      setBuilder(next);
      setSavedBuilder(next);
      setSelection({ kind: 'form' });
      setIsLoading(false);
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const hasUnsavedChanges = JSON.stringify(builder) !== JSON.stringify(savedBuilder);
  const selectedWidget = selection.kind === 'widget' ? findWidget(builder, selection.id) : null;
  const selectedColumn = selection.kind === 'column' ? findColumn(builder, selection.id) : null;
  const selectedSection = selection.kind === 'section' ? findSection(builder, selection.id) : null;

  const patch = (next) => setBuilder(normalizeBuilderForm(next));

  const handleSave = () => {
    setIsSaving(true);
    fetchData('tsreview/review-form/save', (response) => {
      setIsSaving(false);
      if (!response?.success) {
        toastNotification('error', 'Save Failed', response?.data?.message || 'Unable to save builder.');
        return;
      }
      const next = migrateBuilderForm(response.data?.settings || builder);
      setBuilder(next);
      setSavedBuilder(next);
      toastNotification('success', 'Builder Saved', 'Radiant builder now live on review form.');
    }, { settings: builder });
  };

  const addWidgetToSelection = (type) => {
    let targetColumnId = null;
    let index = 0;

    if (selection.kind === 'column') {
      targetColumnId = selection.id;
      index = findColumn(builder, targetColumnId)?.widgets.length || 0;
    } else if (selection.kind === 'widget') {
      const column = findColumnOfWidget(builder, selection.id);
      targetColumnId = column?.id || null;
      index = (column?.widgets.findIndex((widget) => widget.id === selection.id) || 0) + 1;
    } else if (selection.kind === 'section') {
      targetColumnId = findSection(builder, selection.id)?.columns[0]?.id || null;
      index = 0;
    } else {
      const lastSection = builder.sections[builder.sections.length - 1];
      const lastColumn = lastSection?.columns[lastSection.columns.length - 1];
      targetColumnId = lastColumn?.id || null;
      index = lastColumn?.widgets.length || 0;
    }

    if (!targetColumnId) {
      return;
    }

    const result = insertNewWidget(builder, type, { columnId: targetColumnId, index });
    patch(result.form);
    setSelection({ kind: 'widget', id: result.widgetId });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="min-w-0">
            <a href="?page=ts-review-showcase&path=review-form" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to templates
            </a>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Radiant Form Builder</h1>
            <p className="mt-1 text-sm text-muted-foreground">{preview ? 'Preview' : 'Click block to edit. Drag to rearrange.'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border p-1">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition ${device === 'desktop' ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition ${device === 'mobile' ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPreview((current) => !current)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${preview ? 'bg-foreground text-background border-foreground' : 'border-border bg-background text-foreground hover:bg-secondary'}`}
            >
              <Eye className="h-3.5 w-3.5" /> {preview ? 'Editing' : 'Preview'}
            </button>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasUnsavedChanges ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>{hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}</span>
            <button type="button" onClick={handleSave} disabled={isLoading || isSaving} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Builder'}
            </button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(event) => {
          const data = event.active.data.current;
          if (data?.kind === 'new') {
            setDragging({ kind: 'new', type: data.type });
          } else if (data?.kind === 'widget') {
            setDragging({ kind: 'widget', widgetId: data.widgetId });
          }
        }}
        onDragEnd={(event) => {
          const activeData = event.active.data.current;
          const overData = event.over?.data.current;
          setDragging(null);

          if (!event.over) {
            return;
          }

          let targetColumnId = null;
          let targetIndex = 0;

          if (overData?.kind === 'column') {
            targetColumnId = overData.columnId;
            targetIndex = findColumn(builder, targetColumnId)?.widgets.length || 0;
          } else if (overData?.kind === 'widget') {
            const overColumn = findColumnOfWidget(builder, overData.widgetId);
            targetColumnId = overColumn?.id || null;
            targetIndex = Math.max(0, overColumn?.widgets.findIndex((widget) => widget.id === overData.widgetId) + 1 || 0);
          }

          if (!targetColumnId) {
            return;
          }

          if (activeData?.kind === 'new') {
            const result = insertNewWidget(builder, activeData.type, { columnId: targetColumnId, index: targetIndex });
            patch(result.form);
            setSelection({ kind: 'widget', id: result.widgetId });
          } else if (activeData?.kind === 'widget') {
            patch(moveWidget(builder, activeData.widgetId, { columnId: targetColumnId, index: targetIndex }));
            setSelection({ kind: 'widget', id: activeData.widgetId });
          }
        }}
      >
        <div className="mx-auto grid max-w-[1500px] gap-6 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
          <aside className="space-y-5">
            <div className={`${surfaceCardClass} h-fit p-5 lg:sticky lg:top-6`}>
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fields</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Drag or click to add.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {FIELD_TYPES.map((type) => (
                      <DraggableLibraryItem
                        key={type}
                        type={type}
                        icon={<GripVertical className="h-4 w-4 text-muted-foreground" />}
                        onClick={() => addWidgetToSelection(type)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Layout</h2>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {HELPER_TYPES.map((type) => (
                      <DraggableLibraryItem
                        key={type}
                        type={type}
                        icon={<Plus className="h-4 w-4 text-muted-foreground" />}
                        onClick={() => addWidgetToSelection(type)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex flex-col gap-4">
            <div className={`${surfaceCardClass} relative flex min-h-[640px] items-start justify-center overflow-hidden p-4 md:p-6`} style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(0.85 0.02 260 / 0.5) 1px, transparent 0)', backgroundSize: '18px 18px' }}>
              <div className="w-full transition-all" style={{ maxWidth: device === 'mobile' ? 380 : 620 }}>
                {preview ? (
                  <RadiantFormRender builderForm={builder} previewMode />
                ) : (
                  <>
            <div className={`${surfaceCardClass} border-none bg-transparent shadow-none`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">{builder.name}</h2>
                  <p className="text-sm text-muted-foreground">Canvas. Drag widgets. Add sections. Change layouts.</p>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton onClick={() => {
                    const result = addSection(builder, '1');
                    patch(result.form);
                    setSelection({ kind: 'section', id: result.sectionId });
                  }}>
                    <Plus className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              <div className="space-y-4">
                {builder.sections.map((section, index) => (
                  <div key={section.id} className={`rounded-3xl border p-2 transition ${selection.kind === 'section' && selection.id === section.id ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(87,94,207,0.1)]' : 'border-border bg-card hover:border-primary/30'}`}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => setSelection({ kind: 'section', id: section.id })} className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">Section {index + 1}</button>
                      <IconButton onClick={() => patch(moveSection(builder, section.id, -1))} disabled={index === 0}><MoveUp className="h-3.5 w-3.5" /></IconButton>
                      <IconButton onClick={() => patch(moveSection(builder, section.id, 1))} disabled={index === builder.sections.length - 1}><MoveDown className="h-3.5 w-3.5" /></IconButton>
                      <IconButton onClick={() => patch(duplicateSection(builder, section.id))}><Copy className="h-3.5 w-3.5" /></IconButton>
                      <IconButton onClick={() => patch(deleteSection(builder, section.id))} disabled={builder.sections.length === 1}><Trash2 className="h-3.5 w-3.5" /></IconButton>
                      <div className="ml-auto flex items-center gap-1">
                        <IconButton onClick={() => patch(setSectionLayout(builder, section.id, '1'))}><Minus className="h-3.5 w-3.5" /></IconButton>
                        <IconButton onClick={() => patch(setSectionLayout(builder, section.id, '2'))}><Columns2 className="h-3.5 w-3.5" /></IconButton>
                        <IconButton onClick={() => patch(setSectionLayout(builder, section.id, '3'))}><Columns3 className="h-3.5 w-3.5" /></IconButton>
                        <IconButton onClick={() => patch(setSectionLayout(builder, section.id, '4'))}><Columns4 className="h-3.5 w-3.5" /></IconButton>
                      </div>
                    </div>

                    <div className="grid gap-2" style={{ gridTemplateColumns: section.columns.map((column) => `${widthToFr(column.width)}fr`).join(' '), gap: `${Math.max(8, section.gap)}px` }}>
                      {section.columns.map((column) => (
                        <DroppableColumn
                          key={column.id}
                          column={column}
                          form={builder}
                          selection={selection}
                          onSelect={setSelection}
                          onDeleteWidget={(widgetId) => patch(deleteWidget(builder, widgetId))}
                          onDuplicateWidget={(widgetId) => patch(duplicateWidget(builder, widgetId))}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
                  </>
                )}
              </div>
            </div>
          </main>

          <aside className="space-y-5">
            <div className="h-fit overflow-hidden rounded-2xl border border-[#1f2937] bg-[#1f2937] shadow-sm lg:sticky lg:top-6">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
                  <Settings2 className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Inspector</h2>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Element Settings</p>
                </div>
              </div>
              <div className="border-b border-white/10 bg-black/10 px-4 py-2">
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
                  <span className="rounded-md bg-white/10 px-2 py-2 text-white">Content</span>
                  <span className="rounded-md px-2 py-2">Style</span>
                  <span className="rounded-md px-2 py-2">Advanced</span>
                </div>
              </div>
              <div className="space-y-4 bg-[#f6f7fb] p-4">

              {selection.kind === 'form' ? (
                <div className="space-y-4">
                  <InspectorPanel title="Content" subtitle="Global form copy">
                    <Field label="Form Name">
                      <TextInput value={builder.name} onChange={(event) => patch({ ...builder, name: event.target.value })} />
                    </Field>
                    <Field label="Submit Label">
                      <TextInput value={builder.buttonLabel} onChange={(event) => patch({ ...builder, buttonLabel: event.target.value })} />
                    </Field>
                  </InspectorPanel>
                  <InspectorPanel title="Style" subtitle="Frontend appearance">
                    <Field label="Accent">
                      <TextInput type="color" value={builder.accent} onChange={(event) => patch({ ...builder, accent: event.target.value })} className="h-11 p-1" />
                    </Field>
                    <Field label="Background">
                      <TextInput type="color" value={builder.background} onChange={(event) => patch({ ...builder, background: event.target.value })} className="h-11 p-1" />
                    </Field>
                    <Field label="Text Color">
                      <TextInput type="color" value={builder.text} onChange={(event) => patch({ ...builder, text: event.target.value })} className="h-11 p-1" />
                    </Field>
                    <Field label="Font">
                      <SelectInput value={builder.font} onChange={(event) => patch({ ...builder, font: event.target.value })}>
                        <option value="sans">Sans</option>
                        <option value="serif">Serif</option>
                      </SelectInput>
                    </Field>
                    <SliderField label="Corner Radius" value={builder.radius} min={0} max={28} onChange={(value) => patch({ ...builder, radius: value })} display={`${builder.radius}px`} />
                    <SliderField label="Form Spacing" value={builder.spacing} min={0} max={3} onChange={(value) => patch({ ...builder, spacing: value })} display={['Compact', 'Cozy', 'Comfortable', 'Airy'][builder.spacing]} />
                    <Field label="Button Style">
                      <SelectInput value={builder.buttonStyle} onChange={(event) => patch({ ...builder, buttonStyle: event.target.value })}>
                        <option value="solid">Solid</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                      </SelectInput>
                    </Field>
                    <Toggle label="Show field labels" subtitle="Hide for placeholder-only forms" checked={builder.showLabels} onChange={(value) => patch({ ...builder, showLabels: value })} />
                  </InspectorPanel>
                </div>
              ) : null}

              {selection.kind === 'section' && selectedSection ? (
                <InspectorPanel title="Section" subtitle="Layout and spacing">
                  <Field label="Background">
                    <TextInput type="color" value={selectedSection.background || '#ffffff'} onChange={(event) => patch(updateSection(builder, selectedSection.id, { background: event.target.value }))} className="h-11 p-1" />
                  </Field>
                  <SliderField label="Vertical Padding" value={selectedSection.paddingY} min={0} max={80} onChange={(value) => patch(updateSection(builder, selectedSection.id, { paddingY: value }))} display={`${selectedSection.paddingY}px`} />
                  <SliderField label="Horizontal Padding" value={selectedSection.paddingX} min={0} max={80} onChange={(value) => patch(updateSection(builder, selectedSection.id, { paddingX: value }))} display={`${selectedSection.paddingX}px`} />
                  <SliderField label="Column Gap" value={selectedSection.gap} min={0} max={64} onChange={(value) => patch(updateSection(builder, selectedSection.id, { gap: value }))} display={`${selectedSection.gap}px`} />
                </InspectorPanel>
              ) : null}

              {selection.kind === 'column' && selectedColumn ? (
                <InspectorPanel title="Column" subtitle="Width and alignment">
                  <Field label="Width">
                    <SelectInput value={selectedColumn.width} onChange={(event) => patch(updateColumn(builder, selectedColumn.id, { width: event.target.value }))}>
                      <option value="1/4">1/4</option>
                      <option value="1/3">1/3</option>
                      <option value="1/2">1/2</option>
                      <option value="2/3">2/3</option>
                      <option value="3/4">3/4</option>
                      <option value="1/1">1/1</option>
                    </SelectInput>
                  </Field>
                  <Field label="Vertical Align">
                    <SelectInput value={selectedColumn.align} onChange={(event) => patch(updateColumn(builder, selectedColumn.id, { align: event.target.value }))}>
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </SelectInput>
                  </Field>
                </InspectorPanel>
              ) : null}

              {selection.kind === 'widget' && selectedWidget ? (
                <InspectorPanel title={WIDGET_LABELS[selectedWidget.type] || 'Widget'} subtitle="Element controls">
                  {(selectedWidget.type === 'heading' || selectedWidget.type === 'paragraph') ? (
                    <Field label="Text">
                      <TextInput value={selectedWidget.settings.text || ''} onChange={(event) => patch(updateWidget(builder, selectedWidget.id, { text: event.target.value }))} />
                    </Field>
                  ) : null}
                  {selectedWidget.type === 'heading' ? (
                    <Field label="Level">
                      <SelectInput value={selectedWidget.settings.level || 'h3'} onChange={(event) => patch(updateWidget(builder, selectedWidget.id, { level: event.target.value }))}>
                        <option value="h2">H2</option>
                        <option value="h3">H3</option>
                        <option value="h4">H4</option>
                      </SelectInput>
                    </Field>
                  ) : null}
                  {selectedWidget.type === 'divider' ? (
                    <>
                      <SliderField label="Thickness" value={selectedWidget.settings.thickness || 1} min={1} max={6} onChange={(value) => patch(updateWidget(builder, selectedWidget.id, { thickness: value }))} display={`${selectedWidget.settings.thickness || 1}px`} />
                      <Field label="Style">
                        <SelectInput value={selectedWidget.settings.dividerStyle || 'solid'} onChange={(event) => patch(updateWidget(builder, selectedWidget.id, { dividerStyle: event.target.value }))}>
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </SelectInput>
                      </Field>
                    </>
                  ) : null}
                  {selectedWidget.type === 'spacer' ? (
                    <SliderField label="Height" value={selectedWidget.settings.height || 24} min={4} max={120} onChange={(value) => patch(updateWidget(builder, selectedWidget.id, { height: value }))} display={`${selectedWidget.settings.height || 24}px`} />
                  ) : null}
                  {(FIELD_TYPES.includes(selectedWidget.type) || selectedWidget.type === 'button') ? (
                    <Field label="Label">
                      <TextInput value={selectedWidget.settings.label || ''} onChange={(event) => patch(updateWidget(builder, selectedWidget.id, { label: event.target.value }))} />
                    </Field>
                  ) : null}
                  {(selectedWidget.type === 'name' || selectedWidget.type === 'email' || selectedWidget.type === 'title' || selectedWidget.type === 'review') ? (
                    <Field label="Placeholder">
                      <TextInput value={selectedWidget.settings.placeholder || ''} onChange={(event) => patch(updateWidget(builder, selectedWidget.id, { placeholder: event.target.value }))} />
                    </Field>
                  ) : null}
                  {FIELD_TYPES.includes(selectedWidget.type) ? (
                    <Toggle label="Required" checked={selectedWidget.settings.required !== false} onChange={(value) => patch(updateWidget(builder, selectedWidget.id, { required: value }))} />
                  ) : null}
                  {selectedWidget.type === 'button' ? (
                    <Field label="Button Style">
                      <SelectInput value={selectedWidget.settings.buttonStyle || 'solid'} onChange={(event) => patch(updateWidget(builder, selectedWidget.id, { buttonStyle: event.target.value }))}>
                        <option value="solid">Solid</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                      </SelectInput>
                    </Field>
                  ) : null}
                </InspectorPanel>
              ) : null}
            </div>

            <div className={`${surfaceCardClass} p-5`}>
              <div className="mb-3 flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Selection</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {selection.kind === 'form' ? 'Editing global form styles.' : null}
                {selection.kind === 'section' ? 'Editing section layout and spacing.' : null}
                {selection.kind === 'column' ? 'Editing column width and alignment.' : null}
                {selection.kind === 'widget' ? `Editing ${WIDGET_LABELS[selectedWidget?.type] || 'widget'} settings.` : null}
              </div>
            </div>
              </div>
          </aside>
        </div>

        <DragOverlay dropAnimation={null}>
          {dragging?.kind === 'new' ? (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-xl">
              + {WIDGET_LABELS[dragging.type]}
            </div>
          ) : dragging?.kind === 'widget' ? (
            <div className="w-[280px] rounded-xl border border-border bg-card p-3 shadow-xl">
              <BuilderWidgetPreview widget={findWidget(builder, dragging.widgetId)} form={builder} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
