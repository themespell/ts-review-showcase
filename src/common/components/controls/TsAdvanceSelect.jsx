import { useState, useEffect } from 'react';
import { Select } from 'antd';
import get from 'lodash/get';
import editorStore from "../../../editor/states/editorStore.js";
import editorFunction from '../../../editor/states/editorFunction';
import globalSettings from '../../utils/globalSettings';

function TsAdvanceSelect({
                             label,
                             name,
                             defaultValue,
                             options,
                             onChange,
                             mode,
                             output = 'value',
                             showImage = true,
                             showPrice = true,
                             showSku = true,
                             imageSize = 40,
                             pricePrefix = '$',
                             skuPrefix = 'SKU: '
                         }) {
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

    // Custom option renderer
    const optionRender = (option) => {
        const { data } = option || {};
        return (
            <div className="flex items-center gap-3 py-2">
                {/* Product Image */}
                {showImage && data?.image && (
                    <div
                        className="flex-shrink-0 rounded overflow-hidden"
                        style={{
                            width: imageSize,
                            height: imageSize,
                            backgroundColor: '#f5f5f5'
                        }}
                    >
                        <img
                            src={data.image}
                            alt={data.label || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div
                            className="w-full h-full items-center justify-center text-gray-400 text-xs hidden"
                            style={{ fontSize: '10px' }}
                        >
                            No Image
                        </div>
                    </div>
                )}

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                    {/* Product Name */}
                    <div className="font-medium text-gray-900 truncate">
                        {data?.label}
                    </div>

                    {/* Price and SKU Container */}
                    <div className="flex items-center gap-3 mt-1">
                        {/* Product Price */}
                        {showPrice && data?.price && (
                            <span className="text-sm font-semibold text-green-600">
                {pricePrefix}{data?.price}
              </span>
                        )}

                        {/* Product SKU */}
                        {showSku && data?.sku && (
                            <span className="text-xs text-gray-500">
                {skuPrefix}{data?.sku}
              </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Custom label renderer for selected value
    const labelRender = (props) => {
        const { label, value } = props || {};
        const selectedOption = options?.find((opt) => opt.value === value);

        if (!selectedOption) return label;

        return (
            <div className="flex items-center gap-2">
                {showImage && selectedOption.image && (
                    <img
                        src={selectedOption.image}
                        alt={selectedOption.label || 'Product'}
                        className="w-6 h-6 rounded object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                )}
                <span className="truncate">{selectedOption.label}</span>
                {showPrice && selectedOption.price && (
                    <span className="text-sm font-medium text-green-600 ml-1">
            {pricePrefix}{selectedOption.price}
          </span>
                )}
            </div>
        );
    };

    return (
        <div className="mb-4">
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
                optionRender={optionRender}
                labelRender={labelRender}
                dropdownStyle={{
                    maxHeight: '300px',
                }}
                filterOption={(input, option) => {
                    const searchText = input.toLowerCase();
                    const label = option.label?.toLowerCase() || '';
                    const sku = option.sku?.toLowerCase() || '';
                    return label.includes(searchText) || sku.includes(searchText);
                }}
                showSearch
            />
        </div>
    );
}

export default TsAdvanceSelect;
