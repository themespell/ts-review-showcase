import { useEffect } from 'react';
import { Alert } from 'antd';
import { Info } from 'lucide-react';
import { getTranslations } from "../../../utils/translations.js";
import { TsInput } from '../../controls/tsControls';

function ReviewShowcaseFields({ form, post_id }) {
  const translations = getTranslations();

  // Fetch showcase data if `id` is provided and set form values
  useEffect(() => {
    if (post_id) {
      form.setFieldsValue({
        title: form.getFieldValue('title'),
      });
    }
  }, [post_id, form]);

  return (
    <div className="p-6">
      <TsInput
        label={translations.showcaseName || 'Showcase Name'}
        name="title"
        required={true}
      />

      <Alert
        message={
          <span className="flex items-center gap-2">
            <Info size={16} />
            <span>
              {translations.allReviewsAutoDisplay || 'All approved reviews will be automatically displayed in this showcase.'}
            </span>
          </span>
        }
        type="info"
        showIcon={false}
        style={{
          marginBottom: '16px',
          borderRadius: '8px',
          backgroundColor: '#E6F0FF',
          border: '1px solid #C1DAF8',
        }}
      />
    </div>
  );
}

export default ReviewShowcaseFields;
