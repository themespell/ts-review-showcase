import { useMemo, useState } from 'react';
import { toastNotification } from '../utils/toast';
import { fetchData } from '../../common/services/fetchData';
import { getTranslations } from '../../common/utils/translations';
import RadiantFormRender from '../../common/components/RadiantFormRender';
import { migrateBuilderForm } from '../../common/utils/radiantFormBuilder';

function ReviewForm({ productId, onSuccess, settingsOverride, previewMode = false }) {
  const translations = getTranslations();
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  const builderForm = useMemo(() => {
    return migrateBuilderForm({
      ...(tsreview_settings.review_form_settings || {}),
      ...(settingsOverride || {}),
    });
  }, [settingsOverride]);

  const handleSubmit = async (values, rating, form, setRating) => {
    if (previewMode) {
      toastNotification('info', 'Preview Mode', 'Builder preview only. Save settings to use this form on product pages.');
      return;
    }

    setLoading(true);

    try {
      const response = await new Promise((resolve, reject) => {
        fetchData('tsreview/reviews/submit', (result) => {
          if (result?.success) {
            resolve(result);
          } else {
            reject(result);
          }
        }, {
          product_id: productId,
          name: values.name || '',
          email: values.email || '',
          title: values.title || '',
          content: values.review || '',
          rating,
          tsreview_hp: honeypot,
        });
      });

      const message = response?.data?.message
        || translations.reviewSubmitted;

      setSubmittedMessage(message);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toastNotification(
        'error',
        translations.submitFailed,
        error?.data?.message || error?.message || translations.reviewSubmitError,
      );
    } finally {
      setLoading(false);
    }
  };

  if (submittedMessage && !previewMode) {
    return (
      <div style={{ border: '1px solid #a7f3d0', background: '#ecfdf5', borderRadius: 12, padding: 20 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#065f46' }}>{translations.reviewSubmitted}</p>
        <p style={{ margin: '8px 0 0', color: '#047857', lineHeight: 1.6 }}>{submittedMessage}</p>
        <button
          type="button"
          onClick={() => setSubmittedMessage('')}
          style={{ marginTop: 16, border: '1px solid #6ee7b7', background: '#fff', borderRadius: 8, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}
        >
          {translations.writeAnotherReview}
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={`tsreview-hp-${productId}`} className="tsreview-hp" style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
        Company
        <input id={`tsreview-hp-${productId}`} type="text" name="tsreview_hp" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <RadiantFormRender builderForm={builderForm} onSubmit={handleSubmit} previewMode={previewMode} loading={loading} />
    </div>
  );
}

export default ReviewForm;
