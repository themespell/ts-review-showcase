import { useMemo, useState } from 'react';
import { getTranslations } from '../utils/translations';
import StarRating from '../../frontend/components/StarRating';

const spacingMap = {
  0: 'gap-2',
  1: 'gap-3',
  2: 'gap-4',
  3: 'gap-6',
};

const paddingMap = {
  0: 'p-3',
  1: 'p-4',
  2: 'p-5',
  3: 'p-7',
};

function readableOn(hex) {
  try {
    const value = hex.replace('#', '');
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lightness > 0.6 ? '#0f172a' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

function fieldLabel(formConfig, label, required) {
  if (!formConfig.showLabels || !label) {
    return null;
  }
  return (
    <label className="text-xs font-medium opacity-80" style={{ color: formConfig.text }}>
      {label}
      {required ? <span className="ml-1" style={{ color: formConfig.accent }}>*</span> : null}
    </label>
  );
}

function RenderWidget({ widget, formConfig, rating, setRating, interactive = true, loading = false }) {
  const translations = getTranslations();
  const settings = widget.settings || {};
  const fontFamily = formConfig.font === 'serif' ? 'Georgia, Times, serif' : 'inherit';
  const inputStyle = {
    width: '100%',
    border: `1px solid ${formConfig.text}22`,
    borderRadius: `${Math.max(formConfig.radius - 4, 0)}px`,
    color: formConfig.text,
    background: 'transparent',
    padding: '10px 12px',
    font: 'inherit',
  };

  switch (widget.type) {
    case 'heading': {
      const Tag = settings.level || 'h3';
      const className = Tag === 'h2' ? 'text-2xl' : Tag === 'h3' ? 'text-xl' : 'text-lg';
      return <Tag className={`${className} font-semibold`} style={{ color: formConfig.text, fontFamily }}>{settings.text || 'Heading'}</Tag>;
    }
    case 'paragraph':
      return <p className="text-sm opacity-80" style={{ color: formConfig.text, fontFamily }}>{settings.text || 'Paragraph text.'}</p>;
    case 'divider':
      return <hr style={{ borderStyle: settings.dividerStyle || 'solid', borderTopWidth: settings.thickness || 1, borderColor: `${formConfig.text}22`, margin: 0 }} />;
    case 'spacer':
      return <div aria-hidden style={{ height: settings.height || 24 }} />;
    case 'button': {
      const style = settings.buttonStyle || formConfig.buttonStyle;
      const buttonStyles = style === 'solid'
        ? { backgroundColor: formConfig.accent, color: readableOn(formConfig.accent), border: 0 }
        : style === 'outline'
          ? { border: `1.5px solid ${formConfig.accent}`, color: formConfig.accent, backgroundColor: 'transparent' }
          : { color: formConfig.accent, border: 0, backgroundColor: 'transparent' };

      return (
        <button
          type="submit"
          disabled={loading}
          style={{ ...buttonStyles, height: '44px', fontWeight: 600, borderRadius: `${Math.max(formConfig.radius - 4, 0)}px`, padding: '0 16px', cursor: interactive ? 'pointer' : 'default' }}
        >
          {settings.label || formConfig.buttonLabel}
        </button>
      );
    }
    case 'rating':
      return (
        <div className="flex w-full flex-col gap-1.5">
          {fieldLabel(formConfig, settings.label || translations.rating || 'Rating', settings.required)}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: formConfig.accent }}>
            <StarRating value={rating} onChange={setRating} disabled={!interactive} color={formConfig.accent} size={24} />
            <span style={{ color: '#6b7280', fontSize: '14px' }}>{rating ? `${rating}/5` : translations.selectRating}</span>
          </div>
        </div>
      );
    case 'review':
      return (
        <div className="flex w-full flex-col gap-1.5">
          {fieldLabel(formConfig, settings.label || translations.yourReview || 'Your review', settings.required)}
          <textarea
            name="review"
            placeholder={settings.placeholder || ''}
            rows={4}
            maxLength={1000}
            required={!!settings.required}
            disabled={!interactive}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      );
    case 'name':
    case 'email':
    case 'title':
      return (
        <div className="flex w-full flex-col gap-1.5">
          {fieldLabel(formConfig, settings.label || widget.type, settings.required)}
          <input
            name={widget.type}
            type={widget.type === 'email' ? 'email' : 'text'}
            placeholder={settings.placeholder || ''}
            required={!!settings.required}
            disabled={!interactive}
            style={{ ...inputStyle, height: '44px' }}
          />
        </div>
      );
    default:
      return null;
  }
}

function widgetList(config) {
  return (config.sections || []).flatMap((section) => (section.columns || []).flatMap((column) => column.widgets || []));
}

export default function RadiantFormRender({
  builderForm,
  onSubmit,
  previewMode = false,
  loading = false,
  frame = 'full',
}) {
  const translations = getTranslations();
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const config = useMemo(() => builderForm, [builderForm]);

  const handleFinish = async (event) => {
    event.preventDefault();
    if (previewMode || !onSubmit) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      title: String(data.get('title') || '').trim(),
      review: String(data.get('review') || '').trim(),
    };

    if (!rating || rating < 1) {
      setRatingError(translations.chooseRating);
      return;
    }

    const widgets = widgetList(config);
    const required = (type) => widgets.some((widget) => widget.type === type && widget.settings?.required);
    if ((required('name') && !values.name) || (required('email') && !values.email) || (required('review') && !values.review)) {
      setFieldError(translations.pleaseEnterReview);
      return;
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setFieldError(translations.invalidEmail);
      return;
    }

    setRatingError('');
    setFieldError('');
    await onSubmit(values, rating, null, setRating);
  };

  return (
    <div
      className={`${frame === 'full' ? (paddingMap[config.spacing] || paddingMap[2]) : ''} flex flex-col ${spacingMap[config.spacing] || spacingMap[2]}`}
      style={{
        backgroundColor: frame === 'full' ? config.background : 'transparent',
        color: config.text,
        borderRadius: frame === 'full' ? `${config.radius}px` : '0px',
        border: frame === 'full' ? `1px solid ${config.text}12` : '0',
      }}
    >
      <form onSubmit={handleFinish}>
        <div className="flex flex-col gap-4">
          {config.sections.map((section) => (
            <div
              key={section.id}
              className="grid"
              style={{
                gridTemplateColumns: section.columns.map((column) => `${(column.width === '1/2' ? 6 : column.width === '1/3' ? 4 : column.width === '2/3' ? 8 : column.width === '1/4' ? 3 : column.width === '3/4' ? 9 : 12)}fr`).join(' '),
                gap: `${section.gap}px`,
                backgroundColor: frame === 'full' ? (section.background || 'transparent') : 'transparent',
                paddingTop: frame === 'full' ? `${section.paddingY}px` : '0px',
                paddingBottom: frame === 'full' ? `${section.paddingY}px` : '0px',
                paddingLeft: frame === 'full' ? `${section.paddingX}px` : '0px',
                paddingRight: frame === 'full' ? `${section.paddingX}px` : '0px',
              }}
            >
              {section.columns.map((column) => (
                <div key={column.id} className="flex flex-col gap-4">
                  {column.widgets.map((widget) => (
                    <RenderWidget
                      key={widget.id}
                      widget={widget.type === 'button' && loading ? { ...widget, settings: { ...widget.settings, label: translations.loading } } : widget}
                      formConfig={config}
                      rating={rating}
                      setRating={(value) => {
                        setRating(value);
                        if (value > 0) setRatingError('');
                      }}
                      interactive={!previewMode}
                      loading={loading}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </form>
      {ratingError ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{ratingError}</p> : null}
      {fieldError ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{fieldError}</p> : null}
    </div>
  );
}
