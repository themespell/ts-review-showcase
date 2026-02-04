import { TsSelect, TsSlider, TsDivider, TsSwitch } from '../../../../common/components/controls/tsControls';
import editorStore from '../../../states/editorStore';
import editorLocal from "../../../states/editorLocal.js";
import {getTranslations} from "../../../../common/utils/translations.js";


function ContentTab() {
  const translations = getTranslations();
  const { selectedView, containerSettings, columnSettings, carouselSettings, marqueeSettings, showcaseDetails } = editorStore();
  const { availableLayouts, availableFlexLayouts, availableTableLayouts, availableViews, availableTransition, availableDelay, availableDetails } = editorLocal();

  return (
    <div className="mb-16">
        <TsSelect
            label={translations.viewStyle}
            name="selectedView"
            options={availableViews}
            output="object"
        />
        {(selectedView.value === 'grid' || selectedView.value === 'carousel' || selectedView.value === 'marquee') && (
            <TsSelect
                label={translations.layout}
                name="selectedLayout"
                options={availableLayouts}
                output="object"
            />
        )}

        {selectedView.value === 'flex' && (
            <TsSelect
                label={translations.layout}
                name="selectedLayout"
                options={availableFlexLayouts}
                output="object"
            />
        )}

        {selectedView.value === 'table' && (
            <TsSelect
                label={translations.layout}
                name="selectedLayout"
                options={availableTableLayouts}
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

        {selectedView.value === 'flex' && (
            <div>
                <TsDivider
                    label="Flex Settings"
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

        {selectedView.value === 'marquee' && (
            <div>
                <TsDivider
                    label="Marquee Settings"
                />

                <TsSelect
                    label="Direction"
                    name="marqueeSettings.direction"
                    options={availableDelay}
                />

                <TsSlider
                    label="Speed"
                    name="marqueeSettings.marqueeSpeed.default"
                    range={marqueeSettings.marqueeSpeed.range}
                    unit={false}
                />

                <TsSwitch
                    label="Infinite Mode"
                    name="marqueeSettings.infinite"
                />

                <TsSwitch
                    label="Pause On Click"
                    name="marqueeSettings.pauseOnClick"
                />

                <TsSwitch
                    label="Pause On Hover"
                    name="marqueeSettings.pauseOnHover"
                />

                <TsDivider/>
            </div>
        )}
    </div>
  );
}

export default ContentTab;