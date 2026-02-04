import { TsSlider, TsDivider, TsColor, TsFont, TsInputGroup } from './tsControls';

const renderControls = {
    slider: (control) => (
        <TsSlider
            label={control.label}
            range={control.range}
            name={control.name}
            unit={control.unit}            
        />
    ),
    divider: (control) => <TsDivider label={control.label} />,
    color: (control) => (
        <TsColor
            label={control.label}
            name={control.name}
        />
    ),
    inputgroup: (control) => (
        <TsInputGroup
            label={control.label}
            name={control.name}
            unit={control.unit}
        />
    ),
    font: (control) => (
        <TsFont
            label={control.label}
            name={control.name}
            targetedClass={control.targetedClass}
            isPro={control.isPro}
        />
    )
};

export default renderControls;