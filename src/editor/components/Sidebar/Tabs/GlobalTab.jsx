import {TsColor, TsDivider, TsInputGroup} from '../../../../common/components/controls/tsControls';
import editorStore from "../../../states/editorStore.js";
import {getTranslations} from "../../../../common/utils/translations.js";

function GlobalTab(){
    const translations = getTranslations();
    const { containerSettings, columnSettings, selectedView } = editorStore();
    return (
        <div>
            <TsColor
                label={translations.containerBackgroundColor}
                name='containerSettings.backgroundColor'
            />
            <TsInputGroup 
            label={translations.containerMargin}
            name='containerSettings.margin'
            unit='px'
            />
            <TsInputGroup 
            label={translations.containerPadding}
            name='containerSettings.padding'
            unit='px'
            />
            <TsInputGroup 
            label={translations.containerBorderRadius}
            name='containerSettings.borderRadius'
            unit='px'
            />
        </div>
    );
}

export default GlobalTab;