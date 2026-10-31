import { TsSelect, TsSlider, TsDivider, TsSwitch } from '../../../../common/components/controls/tsControls';
import editorStore from '../../../states/editorStore';
import editorLocal from "../../../states/editorLocal.js";
import {getTranslations} from "../../../../common/utils/translations.js";
import { getProView } from "../../../../pro_support/proRegistry.js";


function ContentTab() {
  const translations = getTranslations();
  const { selectedView, containerSettings, columnSettings, carouselSettings } = editorStore();
  const { availableLayouts, availableViews, availableTransition, availableDetails } = editorLocal();
  // Views added by Pro bring their own controls.
  const proView = getProView(selectedView.value);
  const ProControls = proView?.Controls;
  const usesLayout = ['grid', 'list', 'carousel'].includes(selectedView.value) || (proView && proView.usesLayout !== false);

  return (
    <div className="mb-16">
        <TsSelect
            label={translations.viewStyle}
            name="selectedView"
            options={availableViews}
            output="object"
        />
        {usesLayout && (
            <TsSelect
                label={translations.layout}
                name="selectedLayout"
                options={availableLayouts}
                output="object"
            />
        )}

      {/*<TsSwitch*/}
      {/*  label="Show Details"*/}
      {/*  name="showcaseDetails.enable"*/}
      {/*/>*/}

     <TsSelect
            label={translations.detailsStyle}
            name="selectedDetails"
            options={availableDetails}
            defaultValue="none"
            output="object"
     />

      {selectedView.value === 'grid' && (
           <div>
               <TsDivider
                   label="Grid Settings"
               />
               <TsSlider
                   label={translations.containerWidth}
                   range={containerSettings.width.range}
                   name='containerSettings.width.default'
                   responsive={true}
                   unit={true}
               />
               <TsSlider
                   label={translations.columns}
                   range={columnSettings.column.range}
                   name='columnSettings.column.default'
                   responsive={true}
               />
               <TsSlider
                   label={translations.columnGap}
                   range={columnSettings.gap.range}
                   name='columnSettings.gap.default'
                   responsive={true}
                   unit={true}
               />
           </div>
      )}

      {selectedView.value === 'list' && (
           <div>
               <TsDivider
                   label={translations.listSettings}
               />
               <TsSlider
                   label={translations.containerWidth}
                   range={containerSettings.width.range}
                   name='containerSettings.width.default'
                   responsive={true}
                   unit={true}
               />
               <TsSlider
                   label={translations.columnGap}
                   range={columnSettings.gap.range}
                   name='columnSettings.gap.default'
                   responsive={true}
                   unit={true}
               />
           </div>
      )}

      {selectedView.value === 'carousel' && (
      <div>
      <TsDivider
        label="Carousel Settings"
      />
          <TsSlider
              label={translations.containerWidth}
              range={containerSettings.width.range}
              name='containerSettings.width.default'
              responsive={true}
              unit={true}
          />
          <TsSlider
              label="Slides To Show"
              name="carouselSettings.slidesToShow.default"
              range={carouselSettings.slidesToShow?.range}
              responsive={true}
          />
          <TsSlider
              label="Slides To Scroll"
              name="carouselSettings.slidesToScroll.default"
              range={carouselSettings.slidesToScroll?.range}
              responsive={true}
          />
          <TsSlider
              label="Speed"
              range={carouselSettings.slideSpeed.range}
              name='carouselSettings.slideSpeed.default'
              responsive={false}
              unit={false}
          />
          <TsSlider
              label="Gap"
              range={carouselSettings.gap.range}
              name='carouselSettings.gap.default'
              responsive={false}
              unit={false}
          />
          <TsSelect
              label="Transition"
              name="carouselSettings.transition"
              options={availableTransition}
          />
          <TsSwitch
              label="Infinite Mode"
              name="carouselSettings.infinite"
          />
          <TsSwitch
              label="Repeat Mode"
              name="carouselSettings.repeat"
          />
          <TsSwitch
              label="Autoplay"
              name="carouselSettings.autoPlay"
          />
          <TsSwitch
              label="Centered Slide"
              name="carouselSettings.centerSlide"
          />
    </div>
      )}

        {ProControls ? <ProControls containerSettings={containerSettings} columnSettings={columnSettings} translations={translations} /> : null}
    </div>
  );
}

export default ContentTab;