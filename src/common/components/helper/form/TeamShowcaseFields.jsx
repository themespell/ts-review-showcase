import { useState, useEffect } from 'react';
import { Form, Input } from 'antd';
import { fetchData } from '../../../services/fetchData';
import { TsInput, TsAdvanceSelect } from '../../controls/tsControls';
import {getTranslations} from "../../../utils/translations.js";

function TeamShowcaseFields({ form, post_id }) {
  const translations = getTranslations();
  const [reviews, setReviews] = useState([]);

  // Fetch reviews for select options
  useEffect(() => {
    fetchData('tsreview/reviews/fetch', (response) => {
      if (response.success && response.data) {
        console.log(response.data);
        const options = response.data.map((review) => ({
          label: review.reviewer_name || review.author,
          value: review.comment_id || review.id,
          content: review.review_content || review.content
        }));
        setReviews(options);
      } else {
        console.error('Failed to fetch Reviews.');
      }
    });
  }, []);

  // Fetch showcase data if `id` is provided and set form values
  useEffect(() => {
    if (post_id) {
      fetchData(`tsreview/review_showcase/fetch/single`, (response) => {
        if (response.success && response.data) {
          form.setFieldsValue({
            title: response.data.title,
            reviews: response.data.meta_data.reviews.map((review) => ({
              label: review.reviewer_name || review.author,
              value: review.comment_id || review.id,
              content: review.review_content || review.content
            }))
          });
        } else {
          console.error('Failed to fetch showcase data.');
        }
      }, { post_id: post_id });
    }
  }, [post_id, form]);

  return (
      <div className="p-6">
        <TsInput
            label={translations.showcaseName}
            name="title"
            required={true}
        />

        <Form.Item
            name="products"
            rules={[{ required: true, message: 'Please select products'}]}
        >
          <TsAdvanceSelect
              // label={translations.teamMember}
              label="Available Products"
              defaultValue={form.getFieldValue('products')}
              options={products}
              mode="multiple"
              showImage={true}
              showPrice={true}
              showSku={true}
              pricePrefix="$"
              skuPrefix="SKU: "
              imageSize={50}
          />
        </Form.Item>
      </div>
  );
}

export default TeamShowcaseFields;