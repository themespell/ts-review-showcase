import { useState, useEffect } from 'react';
import { Form, Input, Select, Rate, Avatar } from 'antd';
import { User, Star, CheckCircle } from 'lucide-react';
import { fetchData } from '../../../services/fetchData';
import {getTranslations} from "../../../utils/translations.js";

const { Option } = Select;

function ReviewShowcaseFields({ form, post_id }) {
  const translations = getTranslations();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all WooCommerce reviews for select options
  useEffect(() => {
    setLoading(true);
    fetchData('tsreview/reviews/fetch', (response) => {
      if (response.success && response.data) {
        console.log('Fetched reviews:', response.data);
        setReviews(response.data);
      } else {
        console.error('Failed to fetch Reviews.');
      }
      setLoading(false);
    });
  }, []);

  // Fetch showcase data if `id` is provided and set form values
  useEffect(() => {
    if (post_id) {
      fetchData(`tsreview/review_showcase/fetch/single`, (response) => {
        if (response.success && response.data) {
          form.setFieldsValue({
            title: response.data.title,
            reviews: response.data.meta_data.reviews.map((review) => review.comment_id)
          });
        } else {
          console.error('Failed to fetch showcase data.');
        }
      }, { post_id: post_id });
    }
  }, [post_id, form]);

  // Custom option rendering for reviews
  const renderReviewOption = (review) => (
    <Option key={review.comment_id} value={review.comment_id}>
      <div className="flex items-start gap-3 p-2">
        {/* Reviewer Avatar */}
        <Avatar
          src={review.avatar_url}
          icon={<User size={16} />}
          size={40}
        />

        {/* Review Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {review.reviewer_name}
            </span>
            {review.verified && (
              <span className="flex items-center text-green-600 text-xs">
                <CheckCircle size={12} className="mr-1" />
                Verified
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <Rate
              disabled
              value={review.rating}
              style={{ fontSize: '12px' }}
            />
            <span className="text-xs text-gray-500 ml-1">({review.rating})</span>
          </div>

          {/* Product Name */}
          <div className="text-xs text-gray-500 mt-1">
            {review.product_name || 'Unknown Product'}
          </div>

          {/* Review Preview */}
          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
            {review.review_content?.substring(0, 80)}
            {review.review_content?.length > 80 ? '...' : ''}
          </div>
        </div>
      </div>
    </Option>
  );

  return (
    <>
      <Form.Item
        label={translations.showcaseName || 'Showcase Name'}
        name="title"
        rules={[{ required: true, message: translations.pleaseEnterName || 'Please enter the showcase name' }]}
      >
        <Input
          placeholder={translations.enterShowcaseName || 'Enter showcase name'}
          className="tsreview__input"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className="flex items-center gap-2">
            <span>{translations.selectReviews || 'Select Reviews'}</span>
            <span className="text-xs text-gray-500">
              ({reviews.length} available)
            </span>
          </span>
        }
        name="reviews"
        rules={[{ required: true, message: translations.pleaseSelectReviews || 'Please select at least one review' }]}
      >
        <Select
          mode="multiple"
          placeholder={translations.selectReviewsPlaceholder || 'Select reviews to display'}
          loading={loading}
          showSearch
          filterOption={(input, option) => {
            const review = reviews.find(r => r.comment_id === option.value);
            if (!review) return false;
            const searchText = input.toLowerCase();
            return (
              review.reviewer_name?.toLowerCase().includes(searchText) ||
              review.product_name?.toLowerCase().includes(searchText) ||
              review.review_content?.toLowerCase().includes(searchText)
            );
          }}
          optionLabelProp="value"
          maxTagCount="responsive"
          style={{ width: '100%' }}
          listHeight={400}
        >
          {reviews.map(renderReviewOption)}
        </Select>
      </Form.Item>
    </>
  );
}

export default ReviewShowcaseFields;
