import { useEffect, useState } from "react";
import { Slider, InputNumber, Dropdown, Button } from 'antd';
import { DesktopOutlined, TabletOutlined, MobileOutlined, DownOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import editorLocal from "../../../editor/states/editorLocal.js";
import editorStore from '../../../editor/states/editorStore';
import editorFunction from '../../../editor/states/editorFunction';

function TsSlider({ label, name, range, unit, responsive, onChange }) {
    const { viewport } = editorLocal();
    const [selectedView, setSelectedView] = useState('Desktop'); // Default view
    const [selectedUnit, setSelectedUnit] = useState('px'); // Default unit

    const viewMap = {
        desktop: 'Desktop',
        tablet: 'Tablet',
        mobile: 'Mobile',
    };

    useEffect(() => {
        if (responsive) {
            setSelectedView(viewMap[viewport] || 'Desktop');
        }
    }, [viewport, responsive]);

    const handleDropdownClick = (key) => {
        setSelectedView(viewMap[key]);
    };

    const handleUnitClick = (key) => {
        setSelectedUnit(key);
    };

    const items = [
        { key: 'desktop', label: <Button icon={<DesktopOutlined />} onClick={() => handleDropdownClick('desktop')} /> },
        { key: 'tablet', label: <Button icon={<TabletOutlined />} onClick={() => handleDropdownClick('tablet')} /> },
        { key: 'mobile', label: <Button icon={<MobileOutlined />} onClick={() => handleDropdownClick('mobile')} /> },
    ];

    const unitItems = [
        { key: 'px', label: <Button onClick={() => handleUnitClick('px')}>px</Button> },
        { key: 'em', label: <Button onClick={() => handleUnitClick('em')}>em</Button> },
        { key: '%', label: <Button onClick={() => handleUnitClick('%')}>%</Button> },
    ];

    const { saveSettings } = editorFunction();

    const handleChange = (value) => {
        const valueWithUnit = unit ? `${value}${selectedUnit}` : value; // Add unit only if `unit` is true

        if (onChange) {
            onChange(valueWithUnit);
        } else {
            if (responsive) {
                saveSettings(`${name}[${selectedView.toLowerCase()}]`, valueWithUnit);
            } else {
                saveSettings(name, valueWithUnit);
            }
        }
    };

    const sliderValue = parseInt(get(editorStore(), responsive ? `${name}[${selectedView.toLowerCase()}]` : name, 0));

    return (
        <>
            {label && (
                <div className="flex justify-between">
                    <div className="flex mb-1">
                        <label className="block text-sm font-medium text-gray-700 mt-2">{label}</label>
                        {responsive && (
                            <div className="mt-1 ml-2">
                                <Dropdown menu={{ items }} trigger={['click']}>
                                    <Button
                                        icon={
                                            selectedView === 'Desktop' ? <DesktopOutlined /> :
                                                selectedView === 'Tablet' ? <TabletOutlined /> :
                                                    <MobileOutlined />
                                        }
                                    />
                                </Dropdown>
                            </div>
                        )}
                    </div>
                    {unit && (
                        <Dropdown
                            menu={{
                                items: unitItems.map((item) => ({
                                    ...item,
                                    label: (
                                        <Button
                                            type={item.key === selectedUnit ? 'primary' : 'default'}
                                            onClick={() => handleUnitClick(item.key)}
                                        >
                                            {item.key}
                                        </Button>
                                    ),
                                })),
                            }}
                            trigger={['click']}
                        >
                            <Button>
                                {selectedUnit} <DownOutlined />
                            </Button>
                        </Dropdown>
                    )}
                </div>
            )}
            <div className="mb-4 flex justify-between items-center w-full">
                <div className="w-full mr-6">
                    <Slider
                        value={isNaN(sliderValue) ? 0 : sliderValue} // Ensure valid number
                        min={parseInt(range.min)}
                        max={parseInt(range.max)}
                        onChange={handleChange}
                        styles={{
                            track: {
                                background: 'linear-gradient(135deg, #FB0 -1.63%, #FF1E4F 99.59%);',
                                height: '4px',
                            },
                            rail: {
                                backgroundColor: '#FE4F0A',
                            },
                            handle: {
                                borderColor: '#FE4F0A',
                            },
                            width: '100%',
                        }}
                    />
                </div>
                <div>
                    <InputNumber
                        value={isNaN(sliderValue) ? 0 : sliderValue} // Ensure valid number
                        min={parseInt(range.min)}
                        max={parseInt(range.max)}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </>
    );
}

export default TsSlider;