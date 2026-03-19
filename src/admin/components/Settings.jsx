import { useState, useEffect } from 'react';
import { Form, Switch, Button, Card, Select, Divider } from 'antd';
import { Save, Store, Info } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { getTranslations } from '../../common/utils/translations';
import { toastNotification } from '../../common/utils/toastNotification';
import commonStore from '../../common/states/commonStore';

const translations = getTranslations();

function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showcases, setShowcases] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Fetch current settings
    fetchData('tsreview/settings/get', (response) => {
      if (response.success && response.data) {
        form.setFieldsValue({
          default_showcase: response.data.default_showcase || '',
          show_review_form: response.data.show_review_form === '1',
        });
      }
      setLoading(false);
    }, {});

    // Fetch available showcases
    fetchData('tsreview/review_showcase/fetch', (response) => {
      if (response.success && response.data) {
        setShowcases(response.data);
      }
    });
  }, [form]);

  const onFinish = (values) => {
    setSaving(true);
    fetchData('tsreview/settings/save', (response) => {
      setSaving(false);
      if (response.success) {
        toastNotification('success', translations.successfullyUpdated || 'Settings saved successfully!');
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Failed to save settings. Please try again.');
      }
    }, {
      default_showcase: values.default_showcase || '',
      show_review_form: values.show_review_form ? '1' : '',
    });
  };

  return (
    <div className="tsreview-settings-page">
      <Card className="mb-6" style={{ borderRadius: '12px', backgroundColor: '#E6F0FF', border: '1px solid #C1DAF8' }}>
        <div className="flex items-center gap-3">
          <Info size={20} className="text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">Review Display Settings</p>
            <p className="text-sm text-gray-600">Configure how reviews are displayed on your product pages</p>
          </div>
        </div>
      </Card>

      <Card title={
        <div className="flex items-center gap-2">
          <Store size={18} />
          <span>General Settings</span>
        </div>
      } style={{ borderRadius: '12px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            show_review_form: true,
          }}
        >
          <Form.Item
            label="Default Review Showcase"
            name="default_showcase"
            tooltip="Select a review showcase to display on all product pages"
          >
            <Select
              placeholder="Select a showcase..."
              loading={loading}
              allowClear
              options={showcases.map(s => ({
                label: s.title,
                value: s.post_id.toString(),
              }))}
            />
          </Form.Item>

          <Divider />

          <Form.Item
            name="show_review_form"
            valuePropName="checked"
            tooltip="Show or hide the review form on product pages"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show Review Form</p>
                <p className="text-sm text-gray-500">Display the review form below reviews on product pages</p>
              </div>
              <Switch />
            </div>
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              icon={<Save size={16} />}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #2271b1 0%, #1a5d8f 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '44px',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Settings;
