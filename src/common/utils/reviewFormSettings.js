export const reviewFormTemplates = [
  {
    key: 'classic',
    name: 'Classic Form',
    description: 'Balanced layout for default WooCommerce product pages.',
    tags: ['rating', 'title', 'textarea'],
  },
  {
    key: 'minimal',
    name: 'Minimal Form',
    description: 'Clean edges, lighter chrome, tighter spacing.',
    tags: ['simple', 'fast', 'clean'],
  },
  {
    key: 'modern',
    name: 'Modern Form',
    description: 'Stronger card treatment for premium product layouts.',
    tags: ['gradient', 'elevated', 'modern'],
  },
];

export const reviewFormFieldCatalog = [
  {
    id: 'name',
    type: 'text',
    title: 'Name',
    description: 'Reviewer name input.',
    label: 'Your Name',
    placeholder: 'Enter your name',
    required: true,
    enabled: true,
  },
  {
    id: 'email',
    type: 'email',
    title: 'Email',
    description: 'Reviewer email input.',
    label: 'Your Email',
    placeholder: 'Enter your email',
    required: true,
    enabled: true,
  },
  {
    id: 'rating',
    type: 'rating',
    title: 'Rating',
    description: 'Star rating selector.',
    label: 'Your Rating',
    placeholder: '',
    required: true,
    enabled: true,
  },
  {
    id: 'title',
    type: 'text',
    title: 'Title',
    description: 'Short review headline.',
    label: 'Review Title',
    placeholder: 'Summarize your review',
    required: false,
    enabled: true,
  },
  {
    id: 'review',
    type: 'textarea',
    title: 'Review',
    description: 'Main review textarea.',
    label: 'Your Review',
    placeholder: 'Share your experience with this product',
    required: true,
    enabled: true,
  },
];

export const reviewFormDefaults = {
  template: 'classic',
  form_title: 'Write a Review',
  submit_label: 'Submit Review',
  fields: reviewFormFieldCatalog,
};

export function normalizeReviewFormSettings(rawSettings = {}) {
  const baseFields = Array.isArray(rawSettings.fields) && rawSettings.fields.length
    ? rawSettings.fields
    : reviewFormFieldCatalog.map((field) => ({
        ...field,
        enabled: rawSettings[`show_${field.id}`] ?? field.enabled,
      }));

  const normalizedFields = reviewFormFieldCatalog.map((field) => {
    const match = baseFields.find((item) => item.id === field.id) || {};

    return {
      ...field,
      ...match,
      enabled: Boolean(match.enabled ?? field.enabled),
      required: field.id === 'title' ? Boolean(match.required ?? field.required) : true,
    };
  });

  const orderedFieldIds = baseFields
    .map((field) => field.id)
    .filter((id) => normalizedFields.some((item) => item.id === id));

  const orderedFields = [
    ...orderedFieldIds.map((id) => normalizedFields.find((field) => field.id === id)),
    ...normalizedFields.filter((field) => !orderedFieldIds.includes(field.id)),
  ].filter(Boolean);

  return {
    ...reviewFormDefaults,
    ...rawSettings,
    fields: orderedFields,
  };
}

export function moveReviewField(fields, fromId, toId) {
  if (!fromId || !toId || fromId === toId) {
    return fields;
  }

  const nextFields = [...fields];
  const fromIndex = nextFields.findIndex((field) => field.id === fromId);
  const toIndex = nextFields.findIndex((field) => field.id === toId);

  if (fromIndex < 0 || toIndex < 0) {
    return fields;
  }

  const [dragged] = nextFields.splice(fromIndex, 1);
  nextFields.splice(toIndex, 0, dragged);

  return nextFields;
}
