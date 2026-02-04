import { useState } from 'react';
import { Form, Input, Rate, Button, message } from 'antd';
import { User, Mail, Star, Send } from 'lucide-react';
import { fetchData } from '../../common/services/fetchData';
import { getTranslations } from '../../common/utils/translations';

const { TextArea } = Input;

function ReviewForm({ productId, onSuccess }) {
  const translations = getTranslations();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      await new Promise((resolve, reject) => {
        fetchData('tsreview/reviews/submit', (response) => {
          if (response && response.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }, {
          product_id: productId,
          name: values.name,
          email: values.email,
          title: values.title || '',
          content: values.review,
          rating: rating
        });
      });

      message.success(translations.reviewSubmitted || 'Review submitted successfully!');
      form.resetFields();
      setRating(5);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(error.message || translations.reviewSubmitError || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

export default ReviewForm;
