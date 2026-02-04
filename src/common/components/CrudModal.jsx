import FormContainer from './helper/form/FormContainer.jsx';
import useAdminStore from '../../admin/states/admin-store.js';
import { TsModal } from './controls/tsControls.js';

function CrudModal({actionType, type, name, id}) {
  const { isOpen, openModal, closeShowcaseModal } = useAdminStore();
  return (
    <>
    <TsModal
    actionType={actionType}
    name={name}
    isOpen={isOpen}
    onClose={closeShowcaseModal}
    width={550}>
          <FormContainer
          actionType={actionType}
          name={name} 
          type={type} 
          />
    </TsModal>
    </>
  );
}

export default CrudModal;