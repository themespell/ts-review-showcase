import globalSettings from '../../../utils/globalSettings';

import { Input, InputNumber } from "antd";

function TsInputNumber({ field, index, onChange, controlSupport }) {
    const { name, placeholder } = controlSupport;

    const numberOfFields = Object.keys(field).length;
    const gridColumns = `repeat(${numberOfFields}, minmax(0, 1fr))`;

    return (
        <div className="grid gap-3 w-full items-center" style={{ gridTemplateColumns: gridColumns }}>
            <div>
                <InputNumber
                    name={name}
                    placeholder={`Enter ${name}`}
                    value={field[name] || ''}
                    onChange={(value) => onChange(index, name, value)}
                    style={{
                        flex: '1 1 0',
                        minWidth: '100%',
                        borderColor: globalSettings.components.Input.colorBorder,
                    }}
                    className='mb-4'
                />
            </div>
            {Object.entries(field).map(([key, value]) =>
                key !== name ? (
                    <Input
                        key={`${index}-${key}`}
                        name={key}
                        placeholder={`Enter ${key}`}
                        value={value || ''}
                        onChange={(e) => onChange(index, e.target.name, e.target.value)}
                        style={{
                            flex: '1 1 0',
                            minWidth: '0',
                            borderColor: globalSettings.components.Input.colorBorder,
                        }}
                        className='mb-4'
                    />
                ) : null
            )}
        </div>
    );
}

export default TsInputNumber;