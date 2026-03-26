import { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Button, Select, Spin } from 'antd';
import { toastNotification } from '../../common/utils/toastNotification';
import { getTranslations } from '../../common/utils/translations';

const { Option } = Select;

function ReviewForm() {
  const translations = getTranslations();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingForms, setLoadingForms] = useState(true);
  const [availableForms, setAvailableForms] = useState([]);

  const defaultSettings = {
    custom_form_id: '',
    form_title: 'Write a Review',
    show_rating: true,
    show_title_field: true,
    title_required: true,
    title_placeholder: 'Summarize your review',
    show_attachments: false,
    max_attachments: 3,
    submit_button_text: 'Submit Review',
    success_message: 'Thank you for your review!',
    require_purchase: false,
    auto_approve: true,
  };

  // Fetch current settings and available forms
  useEffect(() => {
    // Fetch current settings
    const params = {
      _ajax_nonce: tsreview_settings.nonce,
      action: 'tsreview/get_review_form_settings',
    };

    jQuery.post(tsreview_settings.ajax_url, params, function(response) {
      if (response.success && response.data) {
        form.setFieldsValue(response.data);
      }
    });

    // Fetch available forms
    fetchAvailableForms();
  }, []);

  const fetchAvailableForms = () => {
    const formParams = {
      _ajax_nonce: tsreview_settings.nonce,
      action: 'tsreview/form_builder/fetch',
    };

    jQuery.post(tsreview_settings.ajax_url, formParams, function(response) {
      setLoadingForms(false);
      if (response.success && response.data) {
        setAvailableForms(response.data);
      }
    });
  };

  const onFinish = async (values) => {
    setLoading(true);

    const params = {
      _ajax_nonce: tsreview_settings.nonce,
      action: 'tsreview/save_review_form_settings',
      data: values
    };

    jQuery.post(tsreview_settings.ajax_url, params, function(response) {
      setLoading(false);
      if (response.success) {
        toastNotification(
          'success',
          translations.settings_saved || 'Settings Saved',
          translations.settings_updated_message || 'Your review form settings have been saved successfully.'
        );
      } else {
        toastNotification(
          'error',
          'Error',
          'Failed to save settings.'
        );
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {translations.custom_review_form || 'Custom Review Form'}
        </h2>
        <p className="text-gray-600">
          {translations.custom_review_form_desc || 'Customize the WooCommerce review form appearance and settings'}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={defaultSettings}
        onFinish={onFinish}
      >
        {/* Form Builder Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <span>{translations.form_builder || 'Form Builder'}</span>
              {availableForms.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {availableForms.length} forms available
                </span>
              )}
            </div>
          }
          className="mb-4"
        >
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>{translations.how_it_works || 'How it works:'}</strong>
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside ml-4">
              <li>{translations.step1 || 'Go to "Form Builder" and create a custom form'}</li>
              <li>{translations.step2 || 'Select that form below to replace the default WooCommerce review form'}</li>
              <li>{translations.step3 || 'Your custom form will appear on product pages automatically'}</li>
            </ol>
          </div>

          <Form.Item
            label={translations.select_custom_form || 'Select Custom Form'}
            name="custom_form_id"
            extra={translations.select_custom_form_desc || 'Choose a form builder form to replace the default WooCommerce review form'}
          >
            <Select
              placeholder={translations.select_form_placeholder || 'Select a form...'}
              loading={loadingForms}
              allowClear
              notFoundContent={
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-2">{translations.no_forms_found || 'No forms found'}</p>
                  <a
                    href={window.tsreview_settings.admin_url + 'admin.php?page=ts-review-showcase&path=form-builder'}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {translations.create_form_first || 'Create a form first'}
                  </a>
                </div>
              }
            >
              {availableForms.map(form => (
                <Option key={form.post_id} value={form.post_id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{form.title}</span>
                    {form.form_type === 'pro' && (
                      <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded font-medium">
                        PRO
                      </span>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-600 text-sm">
              {translations.form_notice || 'Note: The selected form will replace the default WooCommerce review form on all product pages.'}
            </span>
          </div>
        </Card>

        <Card title={translations.general_settings || 'General Settings'} className="mb-4">
          <Form.Item
            label={translations.form_title || 'Form Title'}
            name="form_title"
          >
            <Input placeholder={translations.form_title || 'Form Title'} />
          </Form.Item>

          <Form.Item
            label={translations.submit_button_text || 'Submit Button Text'}
            name="submit_button_text"
          >
            <Input placeholder={translations.submit_button_text || 'Submit Button Text'} />
          </Form.Item>

          <Form.Item
            label={translations.success_message || 'Success Message'}
            name="success_message"
          >
            <Input.TextArea
              rows={3}
              placeholder={translations.success_message || 'Success Message'}
            />
          </Form.Item>
        </Card>

        <Card title={translations.field_settings || 'Field Settings'} className="mb-4">
          <Form.Item
            label={translations.show_rating || 'Show Rating Field'}
            name="show_rating"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={translations.show_title_field || 'Show Review Title Field'}
            name="show_title_field"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={translations.title_required || 'Title Required'}
            name="title_required"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={translations.title_placeholder || 'Title Placeholder'}
            name="title_placeholder"
          >
            <Input placeholder={translations.title_placeholder || 'Title Placeholder'} />
          </Form.Item>

          <Form.Item
            label={translations.show_attachments || 'Allow Image Attachments'}
            name="show_attachments"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={translations.max_attachments || 'Maximum Attachments'}
            name="max_attachments"
          >
            <Input type="number" min={1} max={10} />
          </Form.Item>
        </Card>

        <Card title={translations.validation_settings || 'Validation Settings'}>
          <Form.Item
            label={translations.require_purchase || 'Require Verified Purchase'}
            name="require_purchase"
            valuePropName="checked"
            extra={translations.require_purchase_desc || 'Only users who purchased the product can submit reviews'}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={translations.auto_approve || 'Auto Approve Reviews'}
            name="auto_approve"
            valuePropName="checked"
            extra={translations.auto_approve_desc || 'Automatically approve submitted reviews'}
          >
            <Switch />
          </Form.Item>
        </Card>

        <div className="mt-6">
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            {translations.save_settings || 'Save Settings'}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default ReviewForm;
