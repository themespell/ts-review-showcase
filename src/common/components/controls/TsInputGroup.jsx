import { InputNumber } from 'antd';
import get from 'lodash/get';
import editorStore from '../../../editor/states/editorStore';
import editorFunction from '../../../editor/states/editorFunction';

function TsInputGroup({ label, name, unit, onChange }) {
  const { saveSettings } = editorFunction();

  const handleChange = (index, value) => {
    if (onChange) {
      onChange(index, value);
    } else {
      saveSettings(`${name}_${index}`, value);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <div className='flex justify-between'>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <label className="block text-sm font-medium text-gray-700 mb-1 mr-1">{unit}</label>
        </div>
      )}
      <div className="flex space-x-2">
        <InputNumber 
          defaultValue={get(editorStore(), `${name}_top`)} 
          onChange={(value) => handleChange('top', value)}
        />
        <InputNumber 
          defaultValue={get(editorStore(), `${name}_right`)} 
          onChange={(value) => handleChange('right', value)}
        />
        <InputNumber 
          defaultValue={get(editorStore(), `${name}_bottom`)} 
          onChange={(value) => handleChange('bottom', value)}
        />
        <InputNumber 
          defaultValue={get(editorStore(), `${name}_left`)} 
          onChange={(value) => handleChange('left', value)}
        />
      </div>
    </div>
  );
}

export default TsInputGroup;