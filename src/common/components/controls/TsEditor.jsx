import React, { useEffect, useRef } from 'react';
import { Form } from 'antd';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';  // Import Paragraph tool

import {safeJsonParse} from "../../utils/safeJsonParse.js";

function TsEditor({ label, name, defaultValue, required, form }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        header: Header,
        list: List,
        paragraph: {  // Add paragraph tool with preserveBlank option
          class: Paragraph,
          inlineToolbar: true, // Enable the toolbar for paragraph tool
          config: {
            preserveBlank: true, // Allow blank or space-only paragraphs
          },
        },
      },
      onReady: () => {
        editorRef.current = editor;

        if (defaultValue) {
          const parsedData = safeJsonParse(defaultValue, []);
          editorRef.current.render(parsedData);
        }
      },
      onChange: async () => {
        try {
          if (form) {
            const editorData = await editorRef.current.save();
            form.setFieldsValue({ [name]: JSON.stringify(editorData) });
          } else {
            console.error('Form is not defined');
          }
        } catch (error) {
          console.error('Failed to save editor data:', error);
        }
      },
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [form, name]);

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        {
          required: required,
          message: `Please input ${label}!`
        }
      ]}
    >
      <div id="editorjs" style={{ padding: '12px', backgroundColor: '#f7f7f7' }}></div>
    </Form.Item>
  );
}

export default TsEditor;