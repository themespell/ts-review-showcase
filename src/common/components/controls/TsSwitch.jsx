import { Switch } from "antd";
import get from 'lodash/get';
import editorStore from "../../../editor/states/editorStore";
import editorFunction from '../../../editor/states/editorFunction';
import globalSettings from '../../utils/globalSettings';

function TsSwitch({ label, name, onChange }) {
  const { saveSettings } = editorFunction();

  const handleChange = (value) => {
    if (onChange) {
      onChange(value);
    } else {
      saveSettings(name, value);
    }
  };

  const storedValue = get(editorStore(), name, false);
  const isSwitchOn = storedValue === true || storedValue === 'true';

  return (
    <div className="flex justify-between items-center mb-4">
      {label && (
        <label 
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{
            color: globalSettings.theme.textColor,
          }}
        >
          {label}
        </label>
      )}
      <Switch
        checked={isSwitchOn}
        onChange={handleChange}
      />
    </div>
  );
}

export default TsSwitch;