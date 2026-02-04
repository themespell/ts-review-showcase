import { ColorPicker } from "antd";
import get from 'lodash/get';
import editorStore from "../../../editor/states/editorStore";
import editorFunction from '../../../editor/states/editorFunction';
import globalSettings from '../../utils/globalSettings';

function TsColor({ label, name, onChange }) {
  const { saveSettings } = editorFunction();
  const defaultValue = get(editorStore(), name);

  const handleChange = (color) => {
    const hexColor = color.toHexString();
    if (onChange) {
      onChange(hexColor);
    } else {
      saveSettings(name, hexColor);
    }
  };

  return (
    <div className="mb-4 flex justify-between items-center">
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
      <ColorPicker
      defaultValue={defaultValue}
      onChange={handleChange}
      />
    </div>
  );
}

export default TsColor;