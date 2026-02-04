import { Modal } from 'antd';
import FormContainer from '../helper/form/FormContainer';
import './style.css';
import {getTranslations} from "../../utils/translations.js";

function TsModal({ actionType, formSupport, name, type, id, isOpen, isClose, width, children }) {
  const translations = getTranslations();
  return (
    <Modal
      className='ts-modal'
      title={
        actionType === 'create' 
          ? `${translations.add} ${name}`
          : actionType === 'edit' 
          ? `${translations.edit} ${name}`
          : actionType === 'delete' 
          ? `${translations.delete} ${name}`
          : ''
      }
      open={isOpen}
      onCancel={isClose}
      footer={null}
      closable={true}
      centered={true}
      width={width}
    >
      {formSupport ? <FormContainer actionType={actionType} name={name} type={type} post_id={id} /> : children}
    </Modal>
  );
}

export default TsModal;