import commonStore from '../../states/commonStore.js';
import { TsButton } from '../controls/tsControls.js';
import { CirclePlus } from 'lucide-react';
import {getTranslations} from "../../utils/translations.js";

function TableNavItems({title}) {
    const translations = getTranslations();
    const { saveSettings } = commonStore((state) => ({
      saveSettings: state.saveSettings,
    }));

    const handleOpenModal = () => {
      saveSettings('createModal', true);
    };

    return (
      <div className="flex justify-between">
        <TsButton 
        label={title}
        prefix={
            <div className="flex items-center gap-1">
                <CirclePlus size={20} />
                <span className="-mr-1">{translations.create}</span>
            </div>
        }
        onClick={handleOpenModal}
        />
      </div>                
    );
  }
  
  export default TableNavItems;