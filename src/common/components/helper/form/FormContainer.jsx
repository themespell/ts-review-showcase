import { Form } from 'antd';
import { TsButton } from '../../controls/tsControls.js';
import { createData } from '../../../services/createData.js';
import { updateData } from '../../../services/updateData.js';
import { toastNotification } from '../../../utils/toastNotification.js';
import TeamShowcaseFields from './TeamShowcaseFields.jsx';
import TeamMemberFields from './TeamMemberFields.jsx';
import ReviewShowcaseFields from './ReviewShowcaseFields.jsx';

import commonStore from '../../../states/commonStore.js';
import {getTranslations} from "../../../utils/translations.js";

function FormContainer({ actionType, type, name, post_id }) {
  const translations = getTranslations();
  const [form] = Form.useForm();

  const { saveSettings } = commonStore((state) => ({
    saveSettings: state.saveSettings,
  }));

  const onFinish = (data, actionType, post_id) => {
    if (actionType === 'create') {
      createData(`tsreview/${type}/create`, data)
      .then(response => {
          toastNotification('success', `${name} Created`, `The ${name} has been successfully created.`);
          saveSettings('createModal', false);
          saveSettings('reloadData', Date.now());
      })
      .catch(error => {
          toastNotification('error', `${name} Creation Failed`, `The ${name} creation has failed. Error: ${error}`);
      });
    } else if (actionType === 'edit') {
      updateData(`tsreview/${type}/update`, { ...data, post_id })
        .then(response => {
          toastNotification('success', `${name} Updated`, `The ${name} has been successfully updated.`);
          saveSettings('updateModal', false);
          saveSettings('reloadData', Date.now());
        })
        .catch(error => {
          toastNotification('error', `${name} Update Failed`, `The ${name} update has failed. Error: ${error}`);
        });
    }
  };

  const onFinishFailed = (error) => {
    toastNotification('error', `${name} Creation Failed`, `The ${name} creation has failed. Error: ${error}`);
  };

  return (
      <Form
          form={form}
          initialValues={{remember: false}}
          onFinish={(data) => onFinish(data, actionType, post_id)}
          onFinishFailed={(errorInfo) => onFinishFailed(errorInfo, actionType, post_id)}
          autoComplete="off"
          layout="vertical"
          className="tsreview__form-container"
      >
        {type === 'review_showcase' && <ReviewShowcaseFields form={form} post_id={post_id}/>}
        {type === 'product_showcase' && <TeamShowcaseFields form={form} post_id={post_id}/>}
        {type === 'team_member' && <TeamMemberFields form={form} post_id={post_id}/>}

        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '1rem',
            paddingRight: '1rem'
            // backgroundColor: '#ffffff',
        }}>
          <Form.Item>
            <TsButton
                label={
                  actionType === 'create'
                      ? `${translations.create} ${name}`
                      : actionType === 'edit'
                          ? `${translations.update} ${name}`
                          : actionType === 'delete'
                              ? `${translations.delete} ${name}`
                              : `${translations.create} ${name}`
                }
                htmlType="submit"
            />
          </Form.Item>
        </div>
      </Form>
);
}

export default FormContainer;