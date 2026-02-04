import globalSettings from '../../../utils/globalSettings';

import { Input } from 'antd';

function TsMultiInput({ field, index, onChange }) {
  
  const numberOfFields = Object.keys(field).length;
  const gridColumns = `repeat(${numberOfFields}, minmax(0, 1fr))`;

  return (
    <div className="grid gap-3 w-full items-center" style={{ gridTemplateColumns: gridColumns }}>
      {Object.entries(field).map(([name, value]) =>
          <Input
            key={`${index}-${name}`}
            name={name}
            placeholder={`Enter ${name}`}
            value={value || ''}
            onChange={(e) => onChange(index, e.target.name, e.target.value)}
            style={{
              flex: '1 1 0',
              minWidth: '0',
              borderColor: globalSettings.components.Input.colorBorder,
            }}
            className='mb-4'
          />
      )}
    </div>
  );
}

export default TsMultiInput;