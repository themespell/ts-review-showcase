import {TsColor, TsDivider, TsInputGroup, TsSlider} from '../../../../common/components/controls/tsControls';
import editorStore from "../../../states/editorStore.js";

function DetailsTab(){
    const { common } = editorStore();
    return (
        <div>
            <TsDivider
                label="Details Style Coming Soon"
            />
        </div>
    );
}

export default DetailsTab;