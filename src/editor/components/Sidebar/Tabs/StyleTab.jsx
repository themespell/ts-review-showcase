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
    }
  } else if (selectedLayout && TsLayouts[selectedLayout]) {
    const layoutModule = TsLayouts[selectedLayout];

    if (layoutModule.register_controls) {
      const controlConfig = layoutModule.register_controls();
      controls = controlConfig.controls || [];
    }
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

      {/*Common Controls For Review Layouts*/}
      <TsDivider label={translations.commonStyles || "Common Styles"} />

      <TsColor
        label={translations.backgroundColor || "Background Color"}
        name="background_color"
        default="#ffffff"
      />

      <TsColor
        label={translations.textColor || "Text Color"}
        name="text_color"
        default="#333333"
      />

      <TsColor
        label="Star Color"
        name="star_color"
        default="#f5c518"
      />

      <TsColor
        label="Overlay Background"
        name="overlay_background_color"
        default="rgba(0,0,0,0.8)"
      />

      <TsDivider />

      <TsSlider
        label={translations.borderRadius || "Border Radius"}
        name="border_radius"
        range={{ min: 0, max: 50 }}
        unit={true}
        default={12}
      />

      <TsDivider />

      {/* Layout specific controls */}
      {controls.length > 0 && (
        <>
          <TsDivider label="Layout Styles" />
          {controls.map((control, index) => renderControl(control, index))}
        </>
      )}
    </div>
  );
}

export default StyleTab;
