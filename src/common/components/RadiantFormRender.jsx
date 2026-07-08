import { useMemo, useState } from 'react';
import { Button, Form, Input, Rate } from 'antd';
import { Star } from 'lucide-react';
import { getTranslations } from '../utils/translations';

const { TextArea } = Input;

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

function RenderWidget({ widget, formConfig, formApi, rating, setRating, interactive = true }) {
  const translations = getTranslations();
  const settings = widget.settings || {};
  const fontFamily = formConfig.font === 'serif' ? 'Georgia, Times, serif' : 'inherit';
  const inputStyle = {
    borderColor: `${formConfig.text}22`,
    borderRadius: `${Math.max(formConfig.radius - 4, 0)}px`,
    color: formConfig.text,
  };
  const fieldBase = {
    background: 'transparent',
  };

  const wrapField = (label, required, child) => (
    <div className="flex w-full flex-col gap-1.5">
      {formConfig.showLabels && label ? (
        <label className="text-xs font-medium opacity-80" style={{ color: formConfig.text }}>
          {label}
          {required ? <span className="ml-1" style={{ color: formConfig.accent }}>*</span> : null}
        </label>
      ) : null}
      {child}
    </div>
  );

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
        ? { backgroundColor: formConfig.accent, color: readableOn(formConfig.accent), borderRadius: `${Math.max(formConfig.radius - 4, 0)}px` }
        : style === 'outline'
          ? { border: `1.5px solid ${formConfig.accent}`, color: formConfig.accent, borderRadius: `${Math.max(formConfig.radius - 4, 0)}px`, backgroundColor: 'transparent' }
          : { color: formConfig.accent, borderRadius: `${Math.max(formConfig.radius - 4, 0)}px`, backgroundColor: 'transparent' };

      return (
        <Button
          type="default"
          htmlType="submit"
          loading={formApi.loading}
          style={{ ...buttonStyles, height: '44px', fontWeight: 600, boxShadow: 'none' }}
        >
          {settings.label || formConfig.buttonLabel}
        </Button>
      );
    }
    case 'rating':
      return wrapField(
        settings.label || 'Rating',
        settings.required,
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Rate
            value={rating}
            onChange={setRating}
            disabled={!interactive}
            style={{ fontSize: '24px', color: formConfig.accent }}
            character={<Star fill="currentColor" size={24} />}
          />
          <span style={{ color: '#6b7280', fontSize: '14px' }}>{rating}/5</span>
        </div>,
      );
    case 'review':
      return (
        <Form.Item
          name="review"
          rules={settings.required ? [{ required: true, message: translations.pleaseEnterReview || 'Please enter your review' }] : []}
          style={{ marginBottom: 0 }}
        >
          {wrapField(
            settings.label || 'Your review',
            settings.required,
            <TextArea
              placeholder={settings.placeholder || ''}
              rows={4}
              maxLength={1000}
              showCount
              disabled={!interactive}
              style={{ ...inputStyle, ...fieldBase }}
            />,
          )}
        </Form.Item>
      );
    case 'name':
    case 'email':
    case 'title': {
      const name = widget.type;
      const rules = [];
      if (settings.required) {
        if (name === 'name') {
          rules.push({ required: true, message: translations.pleaseEnterName || 'Please enter your name' });
        } else if (name === 'email') {
          rules.push({ required: true, message: translations.pleaseEnterEmail || 'Please enter your email' });
        }
      }
      if (name === 'email') {
        rules.push({ type: 'email', message: translations.invalidEmail || 'Please enter a valid email' });
      }

      return (
        <Form.Item name={name} rules={rules} style={{ marginBottom: 0 }}>
          {wrapField(
            settings.label || name,
            settings.required,
            <Input
              type={name === 'email' ? 'email' : 'text'}
              placeholder={settings.placeholder || ''}
              disabled={!interactive}
              style={{ ...inputStyle, ...fieldBase, height: '44px' }}
            />,
          )}
        </Form.Item>
      );
    }
    default:
      return null;
  }
}

export default function RadiantFormRender({
  builderForm,
  onSubmit,
  previewMode = false,
  loading = false,
  frame = 'full',
}) {
  const [form] = Form.useForm();
  const [rating, setRating] = useState(5);

  const config = useMemo(() => builderForm, [builderForm]);

  const handleFinish = async (values) => {
    if (previewMode || !onSubmit) {
      return;
    }
    await onSubmit(values, rating, form, setRating);
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
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
                      widget={widget}
                      formConfig={config}
                      formApi={{ loading }}
                      rating={rating}
                      setRating={setRating}
                      interactive={!previewMode}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Form>
    </div>
  );
}
