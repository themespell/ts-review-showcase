import { useEffect, useState, useRef } from 'react';
import { Form, Button } from 'antd';
import TsSelectInput from './repeterControls/TsSelectInput';
import TsMultiInput from './repeterControls/TsMultiInput';
import TsInputNumber from "./repeterControls/TsInputNumber.jsx";
import { MinusCircleOutlined } from '@ant-design/icons';

const TsRepeater = ({ form, label, fieldName, defaultValues = [], required, fieldNames = [], controlSupport }) => {
  const [repeaterData, setRepeaterData] = useState(defaultValues);
  
  useEffect(() => {
    const initialData = defaultValues; 
    setRepeaterData(initialData);
  }, [form, fieldName, defaultValues]);
  

  useEffect(() => {
    form.setFieldsValue({ [fieldName]: repeaterData });
  }, [form, fieldName, repeaterData]);

  const handleChange = (index, name, value) => {
    const updatedData = [...repeaterData];
    updatedData[index] = { ...updatedData[index], [name]: value };
    setRepeaterData(updatedData);
  };

  const handleAddField = () => {
    const newField = {
      ...(controlSupport ? { [controlSupport.name]: '' } : {}),
      ...fieldNames.reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
    };
    setRepeaterData([...repeaterData, newField]);
  };

  const handleRemoveField = (index) => {
    const updatedData = repeaterData.filter((_, i) => i !== index);
    setRepeaterData(updatedData);
  };

  const renderDynamicComponent = (field, index) => {
    if (!controlSupport) {
      return (
        <TsMultiInput
          field={field}
          index={index}
          onChange={handleChange}
        />
      );
    }

    switch (controlSupport.type) {
      case 'select':
        return (
          <TsSelectInput
            field={field}
            index={index}
            onChange={handleChange}
            controlSupport={controlSupport}
          />
        );
      case 'inputnumber':
        return (
            <TsInputNumber
                field={field}
                index={index}
                onChange={handleChange}
                controlSupport={controlSupport}
            />
        );
      default:
        return (
          <TsMultiInput
            field={field}
            index={index}
            onChange={handleChange}
          />
        );
    }
  };

  return (
    <Form.Item
      label={label}
      name={fieldName}
      rules={[{ required, message: `Please input at least one ${label}!` }]}
    >
      <div>
        {repeaterData.map((field, index) => (
          <div key={index} className='flex justify-between gap-2 mb-2'>
            {renderDynamicComponent(field, index)}
            <Button type="danger" onClick={() => handleRemoveField(index)}>
              <MinusCircleOutlined />
            </Button>
          </div>
        ))}
        <Button type="primary" onClick={handleAddField}>
          Add {label}
        </Button>
      </div>
    </Form.Item>
  );
};

export default TsRepeater;