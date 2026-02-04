import TableNavItems from "./helper/TableNavItems";
import { TsModal } from './controls/tsControls.js';

import commonStore from "../states/commonStore.js";

function TableNav({type, title}) {
  const { saveSettings, createModal } = commonStore((state) => ({
    saveSettings: state.saveSettings,
    createModal: state.createModal,
  }));

  const handleCloseModal = () => {
    saveSettings('createModal', false);
  };

  return (
    <div className="flex justify-between mb-8">
          <h4 className="text-xl font-semibold">{title}</h4>
          <div className="flex justify-between">
            <TableNavItems title={title} />

            <TsModal
              actionType='create'
              formSupport={true}
              name={title}
              type={type}
              isOpen={createModal}
              isClose={handleCloseModal}
              width={800} />
        </div>
    </div>
  );
}

export default TableNav;