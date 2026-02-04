import { useState, useEffect } from 'react';
import { Select} from 'antd';
import get from 'lodash/get';
import editorStore from "../../../editor/states/editorStore.js";
import editorFunction from '../../../editor/states/editorFunction';
import globalSettings from '../../utils/globalSettings';

function TsSelect({ label, name, defaultValue, options, onChange, mode, output = 'value' }) {
  const { saveSettings } = editorFunction();
  const [currentValue, setCurrentValue] = useState(defaultValue);

    useEffect(() => {
        setCurrentValue(defaultValue);
    }, [defaultValue]);

    const handleChange = (value) => {
        setCurrentValue(value);

        if (onChange) {
            onChange(value);
        } else {
            if (output === 'value') {
                saveSettings(name, value);
            } else if (output === 'object') {
                const selectedOption = options.find(option => option.value === value);
                const result = { ...selectedOption };
                saveSettings(name, result);
            }
        }
    };

  return (
    <div className="mb-4">
      {label && (
        <label
        className="block text-sm font-medium text-gray-700 mb-2"
        style={
          {
            color: globalSettings.theme.textColor,
          }
        }
        >{label}</label>
      )}
      <Select
        placeholder={`Select ${label}`}
        value={get(editorStore(), name) || currentValue}
        activeBorderColor="linear-gradient(45deg, #7A5AF8, #7140D9, #950CED, #F46174)"
        activeOutlineColor="linear-gradient(45deg, #7A5AF8, #7140D9, #950CED, #F46174)"
        hoverBorderColor="linear-gradient(45deg, #7A5AF8, #7140D9, #950CED, #F46174)"
        style={{
          width: '100%',
        }}
        onChange={handleChange}
        options={options}
        mode={mode}
      />
    </div>
  );
}

export default TsSelect;