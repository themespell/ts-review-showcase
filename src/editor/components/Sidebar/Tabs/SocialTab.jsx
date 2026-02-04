import {TsColor, TsDivider, TsInputGroup, TsSlider} from '../../../../common/components/controls/tsControls';
import editorStore from "../../../states/editorStore.js";
import {getTranslations} from "../../../../common/utils/translations.js";

function SocialTab(){
    const translations = getTranslations();
    const { common } = editorStore();
    return (
        <div>
            <TsSlider
                label={translations.socialIconBorderRadius}
                name="layout.borderRadius.socialIcon"
                range={common.range}
                unit={true}
            />

            <TsColor
                label={translations.socialIconColor}
                name="layout.color.socialIcon"
            />

            <TsColor
                label={translations.socialIconBackgroundColor}
                name="layout.color.socialIconBg"
            />
        </div>
    );
}

export default SocialTab;