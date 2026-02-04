import globalSettings from '../../../utils/globalSettings';

import { Input } from 'antd';
import { TsSelect } from '../tsControls';

function TsSelectInput({ field, index, onChange, controlSupport }) {
  const { name, options = [], placeholder } = controlSupport;

  const numberOfFields = Object.keys(field).length;
  const gridColumns = `repeat(${numberOfFields}, minmax(0, 1fr))`;

  return (
    <div className="grid gap-3 w-full items-center" style={{ gridTemplateColumns: gridColumns }}>
      <div>
      <TsSelect
        value={field[name] || ''}
        options={options}
        onChange={(val) => onChange(index, name, val)}
        style={{
          flex: '1 1 0',
          maxWidth: '50%',
          borderColor: globalSettings.components.Input.colorBorder,
          padding: `${globalSettings.components.Input.paddingBlock}px`,
        }}
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

export default TsSelectInput;