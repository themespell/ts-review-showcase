import { useState, useEffect } from 'react';
import { Form, Input, Rate, Button, Spin } from 'antd';
import { toastNotification } from '../../common/utils/toastNotification';
import { User, Mail, Star, Send } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { getTranslations } from '../../common/utils/translations';
import { Star as StarIcon } from 'lucide-react';

const { TextArea } = Input;

function ReviewForm({ productId, onSuccess }) {
  const translations = getTranslations();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);

  // Form builder data
  const [customForm, setCustomForm] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loadingCustomForm, setLoadingCustomForm] = useState(true);

  // Load custom form if configured in settings
  useEffect(() => {
    setLoadingCustomForm(true);

    // Check if custom form is configured via WordPress option
    const params = {
      _ajax_nonce: tsreview_settings.nonce,
      action: 'tsreview/get_custom_form_id',
    };

    jQuery.post(tsreview_settings.ajax_url, params, function(response) {
      setLoadingCustomForm(false);

      if (response.success && response.data && response.data.custom_form_id) {
        // Load the custom form data
        const formParams = {
          _ajax_nonce: tsreview_settings.nonce,
          action: 'tsreview/form_builder/fetch/single',
          form_id: response.data.custom_form_id,
        };

        jQuery.post(tsreview_settings.ajax_url, formParams, function(formResponse) {
          if (formResponse.success && formResponse.data && formResponse.data.form_data) {
            setCustomForm(formResponse.data.form_data);
          }
        });
      }
    });
  }, []);

  const handleSubmit = async (values) => {
    // Validate custom form if active
    if (customForm) {
      const validationErrors = validateCustomForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setLoading(true);

    try {
      await new Promise((resolve, reject) => {
        const submitData = customForm ? {
          product_id: productId,
          form_id: customForm.formId || '',
          ...mapCustomFormFields(),
        } : {
          product_id: productId,
          name: values.name,
          email: values.email,
          title: values.title || '',
          content: values.review,
          rating: rating
        };

        fetchData('tsreview/reviews/submit', (response) => {
          if (response && response.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }, submitData);
      });

      toastNotification(
        'success',
        translations.reviewSubmitted || 'Review Submitted',
        translations.reviewSuccessMessage || 'Your review has been submitted successfully!'
      );

      // Reset form
      if (customForm) {
        setFormValues({});
        setRating(5);
      } else {
        form.resetFields();
        setRating(5);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toastNotification(
        'error',
        translations.submitFailed || 'Submission Failed',
        error.message || translations.reviewSubmitError || 'Failed to submit review.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateCustomForm = () => {
    const validationErrors = {};

    if (!customForm || !customForm.fields) return validationErrors;

    customForm.fields.forEach(field => {
      if (!field.visible) return;
      const value = formValues[field.id];

      if (field.required && (!value || value === '')) {
        validationErrors[field.id] = `${field.label} is required`;
      }

      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          validationErrors[field.id] = 'Please enter a valid email address';
        }
      }
    });

    return validationErrors;
  };

  const mapCustomFormFields = () => {
    const mapped = {};
    if (!customForm || !customForm.fields) return mapped;

    customForm.fields.forEach(field => {
      const value = formValues[field.id];

      // Map custom field IDs to review submission format
      if (field.id === 'rating' || field.type === 'rating' || field.type === 'rating_emoji') {
        mapped.rating = value || rating || 5;
      } else if (field.id === 'reviewer_name') {
        mapped.name = value;
      } else if (field.id === 'reviewer_email') {
        mapped.email = value;
      } else if (field.id === 'review_title') {
        mapped.title = value;
      } else if (field.id === 'review_body') {
        mapped.content = value;
      } else {
        mapped[field.id] = value;
      }
    });

    return mapped;
  };

  const handleFieldChange = (fieldId, fieldValue) => {
    setFormValues(prev => ({ ...prev, [fieldId]: fieldValue }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Show loading state while checking for custom form
  if (loadingCustomForm) {
    return (
      <div className="tsreview-form-wrapper" style={{
        background: '#f9fafb',
        padding: '24px',
        borderRadius: '12px',
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Render custom form if available
  if (customForm) {
    return renderCustomForm({
      customForm,
      formValues,
      setFormValues: handleFieldChange,
      errors,
      loading,
      handleSubmit,
      rating,
      setRating
    });
  }

  // Default form
  return (
    <div className="tsreview-form-wrapper" style={{
      background: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      marginTop: '24px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#1f2937'
      }}>
        {translations.writeAReview || 'Write a Review'}
      </h3>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label={translations.yourName || 'Your Name'}
          rules={[
            { required: true, message: translations.pleaseEnterName || 'Please enter your name' }
          ]}
        >
          <Input
            prefix={<User size={16} style={{ color: '#9ca3af' }} />}
            placeholder={translations.enterYourName || 'Enter your name'}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={translations.yourEmail || 'Your Email'}
          rules={[
            { required: true, message: translations.pleaseEnterEmail || 'Please enter your email' },
            { type: 'email', message: translations.invalidEmail || 'Please enter a valid email' }
          ]}
        >
          <Input
            prefix={<Mail size={16} style={{ color: '#9ca3af' }} />}
            placeholder={translations.enterYourEmail || 'Enter your email'}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={translations.yourRating || 'Your Rating'}
          required
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Rate
              value={rating}
              onChange={setRating}
              style={{ fontSize: '24px' }}
              character={<Star fill="currentColor" size={24} />}
            />
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              {rating}/5
            </span>
          </div>
        </Form.Item>

        <Form.Item
          name="title"
          label={translations.reviewTitle || 'Review Title'}
        >
          <Input
            placeholder={translations.reviewTitlePlaceholder || 'Summarize your review'}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="review"
          label={translations.yourReview || 'Your Review'}
          rules={[
            { required: true, message: translations.pleaseEnterReview || 'Please enter your review' }
          ]}
        >
          <TextArea
            placeholder={translations.shareYourExperience || 'Share your experience with this product'}
            rows={4}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<Send size={16} />}
            style={{
              background: 'linear-gradient(135deg, #2271b1 0%, #135e96 100%)',
              border: 'none',
              height: '44px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {translations.submitReview || 'Submit Review'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

// Helper to render custom form
function renderCustomForm({ customForm, formValues, setFormValues, errors, loading, handleSubmit, rating, setRating }) {
  const translations = getTranslations();
  const styles = customForm.formStyles || {};
  const settings = customForm.formSettings || {};

  const containerStyle = {
    backgroundColor: styles.container?.backgroundColor,
    padding: styles.container?.padding,
    borderRadius: styles.container?.borderRadius,
    border: styles.container?.border,
    marginTop: '24px'
  };

  const fieldStyle = {
    marginBottom: styles.field?.marginBottom
  };

  const labelStyle = {
    fontSize: styles.label?.fontSize,
    fontWeight: styles.label?.fontWeight,
    color: styles.label?.color
  };

  const inputStyle = {
    backgroundColor: styles.input?.backgroundColor,
    border: styles.input?.border,
    borderRadius: styles.input?.borderRadius,
    padding: styles.input?.padding
  };

  const buttonStyle = {
    backgroundColor: styles.button?.backgroundColor,
    color: styles.button?.color,
    borderRadius: styles.button?.borderRadius,
    padding: styles.button?.padding,
    fontWeight: styles.button?.fontWeight
  };

  return (
    <div className="tsreview-form-wrapper tsreview-custom-form" style={containerStyle}>
      {customForm.formName && (
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '20px',
          color: styles.label?.color || '#1f2937'
        }}>
          {customForm.formName}
        </h3>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {customForm.fields.filter(f => f.visible).map(field => (
          <div key={field.id} style={fieldStyle}>
            <label className="block mb-1.5" style={labelStyle}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderFieldInput(
              field,
              inputStyle,
              formValues,
              setFormValues,
              rating,
              setRating,
              errors
            )}
            {errors[field.id] && (
              <span className="text-red-500 text-xs mt-1 block">{errors[field.id]}</span>
            )}
          </div>
        ))}

        <button
          type="submit"
          style={buttonStyle}
          className="w-full hover:opacity-90 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : settings.submitButtonText || translations.submitReview || 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

// Render individual field input for custom form
function renderFieldInput(field, inputStyle, formValues, setFormValues, rating, setRating, errors) {
  const value = formValues[field.id] || '';
  const hasError = errors[field.id];

  const combinedStyle = {
    ...inputStyle,
    borderColor: hasError ? '#ef4444' : inputStyle.border
  };

  switch (field.type) {
    case 'text':
    case 'email':
      return (
        <input
          type={field.type}
          value={value}
          onChange={(e) => setFormValues(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="w-full"
          style={combinedStyle}
        />
      );

    case 'textarea':
    case 'textarea_split':
      return (
        <textarea
          value={value}
          onChange={(e) => setFormValues(field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full"
          style={combinedStyle}
        />
      );

    case 'rating':
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setFormValues(field.id, star);
                setRating(star);
              }}
              className="transition hover:scale-110"
            >
              <StarIcon
                size={24}
                className={star <= (formValues[field.id] || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>
      );

    case 'rating_emoji':
      return (
        <div className="flex gap-3">
          {['😢', '😐', '🙂', '😃', '🤩'].map((emoji, index) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setFormValues(field.id, index + 1);
                setRating(index + 1);
              }}
              className={`text-3xl transition hover:scale-125 ${
                index + 1 === (formValues[field.id] || rating) ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      );

    case 'file':
      return (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400 hover:border-blue-400 transition cursor-pointer">
          <span className="text-2xl">📎</span>
          <p className="text-sm mt-1">{field.label || 'Upload File'}</p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFormValues(field.id, e.target.files)}
            multiple={field.maxFiles > 1}
          />
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={(e) => setFormValues(field.id, e.target.value)}
                className="text-blue-500"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => setFormValues(field.id, e.target.value)}
          className="w-full"
          style={combinedStyle}
        >
          <option value="">Select...</option>
          {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case 'toggle':
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFormValues(field.id, !value)}
            className={`w-12 h-6 rounded-full relative transition ${
              value ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
              value ? 'left-6' : 'left-0.5'
            } shadow`} />
          </button>
        </div>
      );

    case 'checkbox':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => setFormValues(field.id, e.target.checked)}
            className="text-blue-500 w-4 h-4"
          />
          <span>{field.label}</span>
        </label>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => setFormValues(field.id, e.target.value)}
          className="w-full px-3 py-2 border rounded"
          style={combinedStyle}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => setFormValues(field.id, e.target.value)}
          className="w-full"
          style={combinedStyle}
        />
      );
  }
}

export default ReviewForm;
