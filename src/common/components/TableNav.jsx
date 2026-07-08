import TableNavItems from "./helper/TableNavItems";
import { TsModal } from './controls/tsControls.js';

import commonStore from "../states/commonStore.js";

function TableNav({type, title, hidden = false}) {
  const { saveSettings, createModal } = commonStore((state) => ({
    saveSettings: state.saveSettings,
    createModal: state.createModal,
  }));

  const handleCloseModal = () => {
    saveSettings('createModal', false);
  };

  return (
    <div className={hidden ? "hidden" : "mb-8 flex justify-between"}>
      {!hidden ? <h4 className="text-xl font-semibold">{title}</h4> : null}
      {!hidden ? (
        <div className="flex justify-between">
          <TableNavItems title={title} />
        </div>
      ) : null}

      <TsModal
        actionType='create'
        formSupport={true}
        name={title}
        type={type}
        isOpen={createModal}
        isClose={handleCloseModal}
        width={800}
      />
    </div>
  );
}

export default TableNav;
