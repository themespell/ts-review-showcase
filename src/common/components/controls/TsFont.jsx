import { useState, useEffect } from 'react';
import { Select, Alert, Dropdown, Slider } from 'antd';
import TsSlider from "./TsSlider.jsx";
import { Pencil } from 'lucide-react';
import globalSettings from '../../utils/globalSettings';
import { googleFonts } from '../../utils/googleFonts';
import editorFunction from "../../../editor/states/editorFunction.js";
import get from "lodash/get.js";
import editorStore from "../../../editor/states/editorStore.js";

function TsFont({ label, name, targetedClass, isPro }) {
  const { saveSettings } = editorFunction();
  const defaultValue = get(editorStore(), name);
  const [font, setFont] = useState(defaultValue || null);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: '16px',
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: '0',
    lineHeight: '1.5'
  });

  const options = {
    fontSizes: [
      { value: '12px', label: '12px' },
      { value: '14px', label: '14px' },
      { value: '16px', label: '16px' },
      { value: '18px', label: '18px' },
      { value: '20px', label: '20px' },
      { value: '24px', label: '24px' },
      { value: '26px', label: '26px' },
      { value: '28px', label: '28px' },
      { value: '30px', label: '30px' },
    ],
    fontWeights: [
      { value: '300', label: 'Light' },
      { value: '400', label: 'Regular' },
      { value: '500', label: 'Medium' },
      { value: '600', label: 'Semi Bold' },
      { value: '700', label: 'Bold' }
    ],
    textCases: [
      { value: 'none', label: 'Default' },
      { value: 'uppercase', label: 'UPPERCASE' },
      { value: 'lowercase', label: 'lowercase' },
      { value: 'capitalize', label: 'Capitalize' }
    ]
  };

  useEffect(() => {
    const elements = document.getElementsByClassName(targetedClass);
    Array.from(elements).forEach(element => {
      element.style.fontFamily = font;
      element.style.fontSize = settings.fontSize;
      element.style.fontWeight = settings.fontWeight;
      element.style.textTransform = settings.textTransform;
      element.style.letterSpacing = `${settings.letterSpacing}px`;
      element.style.lineHeight = settings.lineHeight;
    });
  }, [font, settings, targetedClass]);

  const handleChange = (property, value) => {
    setSettings(prev => ({
      ...prev,
      [property]: value
    }));
    saveSettings(`${name}_${property}`, value);
  };

  const items = [
    {
      key: 'fontSize',
      label: (
          <div onClick={e => e.stopPropagation()}>
            <label className="block text-sm mb-1">Font Size</label>
            <Select
                value={settings.fontSize}
                onChange={(value) => handleChange('fontSize', value)}
                options={options.fontSizes}
                style={{ width: '200px' }}
            />
          </div>
      )
    },
    {
      key: 'fontWeight',
      label: (
          <div onClick={e => e.stopPropagation()}>
            <label className="block text-sm mb-1">Font Weight</label>
            <Select
                value={settings.fontWeight}
                onChange={(value) => handleChange('fontWeight', value)}
                options={options.fontWeights}
                style={{ width: '200px' }}
            />
          </div>
      )
    },
    {
      key: 'textCase',
      label: (
          <div onClick={e => e.stopPropagation()}>
            <label className="block text-sm mb-1">Text Case</label>
            <Select
                value={settings.textTransform}
                onChange={(value) => handleChange('textTransform', value)}
                options={options.textCases}
                style={{ width: '200px' }}
            />
          </div>
      )
    },
    {
      key: 'letterSpacing',
      label: (
          <div onClick={e => e.stopPropagation()}>
            <label className="block text-sm mb-1">Letter Spacing</label>
            <Slider
                value={parseFloat(settings.letterSpacing)}
                onChange={(value) => handleChange('letterSpacing', value)}
                min={-5}
                max={10}
                step={0.1}
                style={{ width: '200px' }}
            />
          </div>
      )
    },
    {
      key: 'lineHeight',
      label: (
          <div onClick={e => e.stopPropagation()}>
            <label className="block text-sm mb-1">Line Height</label>
            <Slider
                value={parseFloat(settings.lineHeight)}
                onChange={(value) => handleChange('lineHeight', value)}
                min={1}
                max={3}
                step={0.1}
                style={{ width: '200px' }}
            />
          </div>
      )
    }
  ];

  return (
      <div className="mb-4">
        {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: globalSettings.theme.textColor }}>
              {label}
            </label>
        )}
        {isPro ? (
            <Alert banner message="This feature is available for Pro users only." />
        ) : (
            <div className="flex items-center gap-2">
              <Select
                  placeholder={`Select ${label}`}
                  value={font}
                  style={{
                    width: '100%',
                    fontFamily: font || undefined
                  }}
                  onChange={(newFont) => {
                    setFont(newFont);
                    saveSettings(name, newFont);
                  }}
                  options={googleFonts}
              />
              <Dropdown
                  menu={{ items }}
                  trigger={['click']}
                  placement="bottomRight"
                  arrow={true}
                  open={open}
                  onOpenChange={setOpen}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Pencil size={20} />
                </a>
              </Dropdown>
            </div>
        )}
      </div>
  );
}

export default TsFont;