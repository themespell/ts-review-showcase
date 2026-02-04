import {
  TsSlider,
  TsColor,
  TsDivider,
  TsSelect,
  TsSwitch,
} from "../../../../common/components/controls/tsControls";
import * as TsLayouts from "../../../../frontend/components/layouts/layouts.js";
import proLayouts from "../../../../pro_support/proLayouts.js";
import editorStore from "../../../states/editorStore";
import renderControls from "../../../../common/components/controls/tsRenderControls.jsx";
import {getTranslations} from "../../../../common/utils/translations.js";

function StyleTab({ selectedLayout, layoutType }) {
  const translations = getTranslations();
  const { common, containerSettings, columnSettings, selectedView } =
    editorStore();

  // Dynamically render controls
  const renderControl = (control, index) => {
    const ControlComponent = renderControls[control.type];
    return ControlComponent ? (
      <div key={index}>{ControlComponent(control)}</div>
    ) : null;
  };

  // Check layoutType and get controls from layout
  let controls = [];
  if (layoutType === "pro") {
    const layoutModule = proLayouts(selectedLayout);
    if (layoutModule && layoutModule.Editor) {
      const controlConfig = layoutModule.Editor();
      controls = controlConfig.controls || [];
    } else {
      console.error(
        `register_controls not found for layout: ${selectedLayout}`
      );
    }
  } else if (selectedLayout && TsLayouts[selectedLayout]) {
    const layoutModule = TsLayouts[selectedLayout];

    if (layoutModule.register_controls) {
      const controlConfig = layoutModule.register_controls();
      controls = controlConfig.controls || [];
    } else {
      console.error(
        `register_controls not found for layout: ${selectedLayout}`
      );
    }
  } else {
    console.error(`Layout type "${selectedLayout}" not found in TsLayouts.`);
  }
  
  return (
    <div className="mb-16">
      {selectedView.value === "carousel" && (
        <div>
          <TsDivider label="Carousel Styles" />

          <TsColor
            label="Dots Active Color"
            name="carouselSettings.dotsColor"
          />

          <TsColor
            label="Navigation Background Color"
            name="carouselSettings.navBgColor"
          />

          <TsColor
            label="Navigation Icon Color"
            name="carouselSettings.navColor"
          />

          <TsDivider />
        </div>
      )}

      {/*Common Controls For Each Layout*/}
      <TsDivider label={translations.commonStyles} />

      <TsColor label={translations.backgroundColor} name="layout.color.background" />

      <TsColor label={translations.memberNameColor} name="layout.color.memberName" />

      <TsColor
        label={translations.memberDesignationColor}
        name="layout.color.designation"
      />

      <TsColor
        label={translations.memberDescriptionColor}
        name="layout.color.description"
      />

      <TsColor label={translations.borderColor} name="layout.color.border" />
      <TsColor label={translations.imageBorderColor} name="layout.color.imageBorder" />

      <TsDivider />

      <TsSlider
        label={translations.borderWidth}
        name="layout.borderWidth"
        range={common.range}
        unit={true}
      />

      <TsSlider
        label={translations.borderRadius}
        name="layout.borderRadius"
        range={common.range}
        unit={true}
      />

      <TsSlider
        label={translations.imageBorderWidth}
        name="layout.borderWidth.image"
        range={common.range}
        unit={true}
      />

      <TsSlider
        label={translations.imageBorderRadius}
        name="layout.borderRadius.image"
        range={common.range}
        unit={true}
      />
      {/* Dynamically render the controls */}
      {controls.map((control, index) => renderControl(control, index))}
    </div>
  );
}

export default StyleTab;