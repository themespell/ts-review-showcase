import { useMemo, useState } from 'react';
import { toastNotification } from '../../common/utils/toastNotification';
import { fetchData } from '../../common/services/fetchData';
import { getTranslations } from '../../common/utils/translations';
import RadiantFormRender from '../../common/components/RadiantFormRender';
import { migrateBuilderForm } from '../../common/utils/radiantFormBuilder';

function ReviewForm({ productId, onSuccess, settingsOverride, previewMode = false }) {
  const translations = getTranslations();
  const [loading, setLoading] = useState(false);

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
      await new Promise((resolve, reject) => {
        fetchData('tsreview/reviews/submit', (response) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }, {
          product_id: productId,
          name: values.name || '',
          email: values.email || '',
          title: values.title || '',
          content: values.review || '',
          rating,
        });
      });

      toastNotification(
        'success',
        translations.reviewSubmitted || 'Review Submitted',
        translations.reviewSuccessMessage || 'Your review has been submitted successfully. Thank you for your feedback!',
      );

      form.resetFields();
      setRating(5);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toastNotification(
        'error',
        translations.submitFailed || 'Submission Failed',
        error?.message || translations.reviewSubmitError || 'Failed to submit review. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return <RadiantFormRender builderForm={builderForm} onSubmit={handleSubmit} previewMode={previewMode} loading={loading} />;
}

export default ReviewForm;
