import globalSettings from '../../utils/globalSettings';
import { Input, Form } from "antd";

function TsInput({ type, label, name, required, maxLength }) {
  const renderInput = () => {
    switch (type) {
      case 'password':
        return <Input.Password 
        style={{
          borderColor: globalSettings.components.Input.colorBorder,
          borderRadius: `${globalSettings.components.Input.borderRadius}px`,
          padding: `${globalSettings.components.Input.paddingBlock}px`,
        }}
        placeholder={`Enter ${label.toLowerCase()}`} />;
      case 'description':
        return (
          <Input.TextArea
            placeholder={`Enter ${label.toLowerCase()}`}
            showCount
            maxLength={maxLength}
            style={{
              height: maxLength,
              resize: 'none',
              borderColor: globalSettings.components.Input.colorBorder,
              padding: `${globalSettings.components.Input.paddingBlock}px`,
            }}
          />
        );
      case 'number':
        return <Input 
        style={{
          borderColor: globalSettings.components.Input.colorBorder,
          borderRadius: `${globalSettings.components.Input.borderRadius}px`,
          padding: `${globalSettings.components.Input.paddingBlock}px`,
        }}
        type="number" maxLength={maxLength} placeholder={`Enter ${label.toLowerCase()}`} />;
      default:
        return <Input
        style={{
          borderColor: globalSettings.components.Input.colorBorder,
          borderRadius: `${globalSettings.components.Input.borderRadius}px`,
          padding: `${globalSettings.components.Input.paddingBlock}px`,
        }}
        maxLength={maxLength} placeholder={`Enter ${label.toLowerCase()}`} />;
    }
  };

  return (
    <>
      <Form.Item
        label={label}
        name={name}
        rules={[
          { 
            required: required,
            message: `Please enter ${label.toLowerCase()}!`
          },
        ]}
      >
        {renderInput()}
      </Form.Item>
    </>
  );
}

export default TsInput;