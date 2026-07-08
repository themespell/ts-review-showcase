export const FORM_PRESETS = {
  minimal: { accent: '#111827', background: '#ffffff', text: '#111827', radius: 8, spacing: 1, font: 'sans', buttonStyle: 'solid' },
  card: { accent: '#2563eb', background: '#ffffff', text: '#0f172a', radius: 16, spacing: 2, font: 'sans', buttonStyle: 'solid' },
  editorial: { accent: '#7c2d12', background: '#faf7f2', text: '#1c1917', radius: 4, spacing: 2, font: 'serif', buttonStyle: 'outline' },
  playful: { accent: '#db2777', background: '#fff1f2', text: '#3f1235', radius: 24, spacing: 2, font: 'sans', buttonStyle: 'solid' },
  brutalist: { accent: '#000000', background: '#fef08a', text: '#000000', radius: 0, spacing: 1, font: 'sans', buttonStyle: 'outline' },
};

export const FIELD_TYPES = ['name', 'email', 'rating', 'title', 'review'];
export const HELPER_TYPES = ['heading', 'paragraph', 'divider', 'spacer', 'button'];
export const ALL_WIDGET_TYPES = [...FIELD_TYPES, ...HELPER_TYPES];

const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rf_${Math.random().toString(36).slice(2, 11)}`;
};

export const defaultWidgetSettings = (type) => {
  switch (type) {
    case 'name':
      return { label: 'Your name', placeholder: 'Jane Doe', required: true };
    case 'email':
      return { label: 'Email', placeholder: 'jane@example.com', required: true };
    case 'rating':
      return { label: 'Rating', required: true };
    case 'title':
      return { label: 'Headline', placeholder: 'Sum it up in a few words', required: false };
    case 'review':
      return { label: 'Your review', placeholder: 'Tell others what you thought...', required: true };
    case 'heading':
      return { text: 'Write a review', level: 'h3' };
    case 'paragraph':
      return { text: 'Share your experience with others.' };
    case 'divider':
      return { thickness: 1, dividerStyle: 'solid' };
    case 'spacer':
      return { height: 24 };
    case 'button':
      return { label: 'Submit review', buttonStyle: 'solid' };
    default:
      return {};
  }
};

export const createWidget = (type) => ({
  id: uid(),
  type,
  settings: defaultWidgetSettings(type),
});

export const createColumn = (width = '1/1', widgets = []) => ({
  id: uid(),
  width,
  align: 'top',
  widgets,
});

export const layoutToWidths = (layout = '1') => {
  switch (layout) {
    case '2':
      return ['1/2', '1/2'];
    case '1-2':
      return ['1/3', '2/3'];
    case '2-1':
      return ['2/3', '1/3'];
    case '3':
      return ['1/3', '1/3', '1/3'];
    case '4':
      return ['1/4', '1/4', '1/4', '1/4'];
    case '1':
    default:
      return ['1/1'];
  }
};

export const widthToFr = (width) => {
  switch (width) {
    case '1/2':
      return 6;
    case '1/3':
      return 4;
    case '2/3':
      return 8;
    case '1/4':
      return 3;
    case '3/4':
      return 9;
    case '1/1':
    default:
      return 12;
  }
};

export const createSection = (layout = '1') => ({
  id: uid(),
  background: '',
  paddingY: 16,
  paddingX: 0,
  gap: 16,
  columns: layoutToWidths(layout).map((width) => createColumn(width)),
});

export const createBuilderForm = (name = 'Product page reviews', preset = 'card') => {
  const form = {
    id: uid(),
    name,
    preset,
    accent: '#2563eb',
    background: '#ffffff',
    text: '#0f172a',
    radius: 16,
    spacing: 2,
    font: 'sans',
    showLabels: true,
    buttonLabel: 'Submit review',
    buttonStyle: 'solid',
    sections: [],
    updatedAt: Date.now(),
    ...(FORM_PRESETS[preset] || FORM_PRESETS.card),
  };

  form.sections = [
    {
      ...createSection('1'),
      columns: [
        createColumn('1/1', [
          createWidget('heading'),
          createWidget('paragraph'),
          createWidget('name'),
          createWidget('email'),
          createWidget('rating'),
          createWidget('title'),
          createWidget('review'),
          createWidget('button'),
        ]),
      ],
    },
  ];

  return form;
};

export const migrateBuilderForm = (raw) => {
  if (raw && Array.isArray(raw.sections)) {
    return normalizeBuilderForm(raw);
  }

  const seeded = createBuilderForm(raw?.name || 'Product page reviews', raw?.preset || 'card');
  const legacyFields = Array.isArray(raw?.fields) ? raw.fields : [];
  if (legacyFields.length) {
    const widgets = [createWidget('heading'), createWidget('paragraph')];
    legacyFields.forEach((field) => {
      if (!field?.enabled || !FIELD_TYPES.includes(field.id || field.key)) {
        return;
      }
      const type = field.id || field.key;
      const widget = createWidget(type);
      widget.settings = {
        ...widget.settings,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
      };
      widgets.push(widget);
    });
    widgets.push(createWidget('button'));
    seeded.sections[0].columns[0].widgets = widgets;
  }

  return normalizeBuilderForm({
    ...seeded,
    name: raw?.form_title || raw?.name || seeded.name,
    buttonLabel: raw?.submit_label || seeded.buttonLabel,
  });
};

export const normalizeBuilderForm = (raw) => {
  const base = createBuilderForm(raw?.name || 'Product page reviews', raw?.preset || 'card');
  const next = {
    ...base,
    ...(raw || {}),
  };

  next.sections = Array.isArray(raw?.sections) && raw.sections.length
    ? raw.sections.map((section) => ({
        ...createSection('1'),
        ...section,
        id: section?.id || uid(),
        columns: Array.isArray(section?.columns) && section.columns.length
          ? section.columns.map((column) => ({
              ...createColumn(column?.width || '1/1'),
              ...column,
              id: column?.id || uid(),
              widgets: Array.isArray(column?.widgets)
                ? column.widgets
                    .filter((widget) => ALL_WIDGET_TYPES.includes(widget?.type))
                    .map((widget) => ({
                      id: widget?.id || uid(),
                      type: widget.type,
                      settings: {
                        ...defaultWidgetSettings(widget.type),
                        ...(widget.settings || {}),
                      },
                    }))
                : [],
            }))
          : [createColumn('1/1')],
      }))
    : base.sections;

  next.updatedAt = Date.now();
  return next;
};

const mapSections = (form, fn) => ({
  ...form,
  sections: form.sections.map(fn),
  updatedAt: Date.now(),
});

export const updateWidget = (form, widgetId, patch) => mapSections(form, (section) => ({
  ...section,
  columns: section.columns.map((column) => ({
    ...column,
    widgets: column.widgets.map((widget) => (
      widget.id === widgetId
        ? { ...widget, settings: { ...widget.settings, ...patch } }
        : widget
    )),
  })),
}));

export const deleteWidget = (form, widgetId) => mapSections(form, (section) => ({
  ...section,
  columns: section.columns.map((column) => ({
    ...column,
    widgets: column.widgets.filter((widget) => widget.id !== widgetId),
  })),
}));

export const duplicateWidget = (form, widgetId) => mapSections(form, (section) => ({
  ...section,
  columns: section.columns.map((column) => {
    const index = column.widgets.findIndex((widget) => widget.id === widgetId);
    if (index < 0) {
      return column;
    }
    const clone = {
      ...column.widgets[index],
      id: uid(),
      settings: { ...column.widgets[index].settings },
    };
    const widgets = [...column.widgets];
    widgets.splice(index + 1, 0, clone);
    return { ...column, widgets };
  }),
}));

export const addSection = (form, layout = '1', afterId) => {
  const section = createSection(layout);
  const sections = [...form.sections];
  if (afterId) {
    const index = sections.findIndex((item) => item.id === afterId);
    sections.splice(index + 1, 0, section);
  } else {
    sections.push(section);
  }
  return {
    form: {
      ...form,
      sections,
      updatedAt: Date.now(),
    },
    sectionId: section.id,
  };
};

export const deleteSection = (form, sectionId) => ({
  ...form,
  sections: form.sections.filter((section) => section.id !== sectionId),
  updatedAt: Date.now(),
});

export const duplicateSection = (form, sectionId) => {
  const index = form.sections.findIndex((section) => section.id === sectionId);
  if (index < 0) {
    return form;
  }
  const source = form.sections[index];
  const clone = {
    ...source,
    id: uid(),
    columns: source.columns.map((column) => ({
      ...column,
      id: uid(),
      widgets: column.widgets.map((widget) => ({
        ...widget,
        id: uid(),
        settings: { ...widget.settings },
      })),
    })),
  };
  const sections = [...form.sections];
  sections.splice(index + 1, 0, clone);
  return { ...form, sections, updatedAt: Date.now() };
};

export const moveSection = (form, sectionId, direction) => {
  const index = form.sections.findIndex((section) => section.id === sectionId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= form.sections.length) {
    return form;
  }
  const sections = [...form.sections];
  [sections[index], sections[target]] = [sections[target], sections[index]];
  return { ...form, sections, updatedAt: Date.now() };
};

export const updateSection = (form, sectionId, patch) => mapSections(form, (section) => (
  section.id === sectionId ? { ...section, ...patch } : section
));

export const updateColumn = (form, columnId, patch) => mapSections(form, (section) => ({
  ...section,
  columns: section.columns.map((column) => (
    column.id === columnId ? { ...column, ...patch } : column
  )),
}));

export const setSectionLayout = (form, sectionId, layout) => mapSections(form, (section) => {
  if (section.id !== sectionId) {
    return section;
  }
  const widths = layoutToWidths(layout);
  const columns = widths.map((width, index) => {
    const existing = section.columns[index];
    if (existing) {
      return { ...existing, width };
    }
    return createColumn(width);
  });

  if (section.columns.length > widths.length) {
    const orphanWidgets = section.columns.slice(widths.length).flatMap((column) => column.widgets);
    columns[columns.length - 1] = {
      ...columns[columns.length - 1],
      widgets: [...columns[columns.length - 1].widgets, ...orphanWidgets],
    };
  }

  return { ...section, columns };
});

export const moveWidget = (form, widgetId, target) => {
  let widget = null;

  const stripped = mapSections(form, (section) => ({
    ...section,
    columns: section.columns.map((column) => {
      const index = column.widgets.findIndex((item) => item.id === widgetId);
      if (index < 0) {
        return column;
      }
      widget = column.widgets[index];
      return {
        ...column,
        widgets: column.widgets.filter((item) => item.id !== widgetId),
      };
    }),
  }));

  if (!widget) {
    return form;
  }

  return mapSections(stripped, (section) => ({
    ...section,
    columns: section.columns.map((column) => {
      if (column.id !== target.columnId) {
        return column;
      }
      const widgets = [...column.widgets];
      const index = Math.max(0, Math.min(target.index, widgets.length));
      widgets.splice(index, 0, widget);
      return { ...column, widgets };
    }),
  }));
};

export const insertNewWidget = (form, type, target) => {
  const widget = createWidget(type);
  return {
    form: mapSections(form, (section) => ({
      ...section,
      columns: section.columns.map((column) => {
        if (column.id !== target.columnId) {
          return column;
        }
        const widgets = [...column.widgets];
        const index = Math.max(0, Math.min(target.index, widgets.length));
        widgets.splice(index, 0, widget);
        return { ...column, widgets };
      }),
    })),
    widgetId: widget.id,
  };
};

export const findColumnOfWidget = (form, widgetId) => {
  for (const section of form.sections) {
    for (const column of section.columns) {
      if (column.widgets.some((widget) => widget.id === widgetId)) {
        return column;
      }
    }
  }
  return null;
};

export const findWidget = (form, widgetId) => {
  for (const section of form.sections) {
    for (const column of section.columns) {
      const match = column.widgets.find((widget) => widget.id === widgetId);
      if (match) {
        return match;
      }
    }
  }
  return null;
};

export const findSection = (form, sectionId) => form.sections.find((section) => section.id === sectionId) || null;
export const findColumn = (form, columnId) => {
  for (const section of form.sections) {
    const match = section.columns.find((column) => column.id === columnId);
    if (match) {
      return match;
    }
  }
  return null;
};
