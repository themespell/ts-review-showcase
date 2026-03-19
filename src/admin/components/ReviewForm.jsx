import { useState } from 'react';
import { Card, Form, Input, Switch, Button } from 'antd';
import { toastNotification } from '../../common/utils/toastNotification';

function ReviewForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const translations = window.tsreview_i18n || {};

  const defaultSettings = {
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

  const onFinish = async (values) => {
    setLoading(true);
    // Here you would save the form settings to options table
    setTimeout(() => {
      toastNotification(
        'success',
        translations.settings_saved || 'Settings Saved',
        translations.settings_updated_message || 'Your review form settings have been saved successfully.'
      );
      setLoading(false);
    }, 500);
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
