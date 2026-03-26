import { useState } from 'react';
import { Card, Button, Input, Switch, Slider, message, Collapse } from 'antd';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Copy,
    GripVertical,
    Eye,
    Settings as SettingsIcon,
    Layers,
    Palette,
    X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useFormBuilderStore from '../states/formBuilderStore';
import { getFieldTypes } from '../form_templates';
import { getTranslations } from '../../common/utils/translations';
import { getFieldIcon } from '../utils/formBuilderHelpers';

function FormEditor() {
    const translations = getTranslations();
    const {
        formName,
        fields,
        formSettings,
        formStyles,
        selectedField,
        setView,
        setFormName,
        updateField,
        addField,
        removeField,
        duplicateField,
        setSelectedField,
        reorderFields,
        updateFormSettings,
        updateFormStyles,
        saveForm,
        resetForm
    } = useFormBuilderStore();

    const [activeTab, setActiveTab] = useState('fields');
    const [saving, setSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isPro = window.tsreview_settings?.is_pro || false;
    const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        reorderFields(updatedItems);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await saveForm();
        if (result.success) {
            message.success('Form saved successfully!');
        }
        setSaving(false);
    };

    const handleBack = () => {
        resetForm();
        setView('templates');
    };

    const fieldTypes = getFieldTypes();
    const availableFieldTypes = isPro && !isLicenseInactive
        ? fieldTypes
        : fieldTypes.filter(type => type.type === 'free');

    return (
        <div className="ts-form-editor flex gap-4">
            {/* Sidebar */}
            <div className={`ts-form-builder-sidebar ${sidebarOpen ? 'open' : 'closed'} w-80 flex-shrink-0`}>
                {/* Sidebar Toggle */}
                <div className="flex justify-end mb-2">
                    <Button
                        type="text"
                        size="small"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500"
                    >
                        {sidebarOpen ? '«' : '»'}
                    </Button>
                </div>

                {sidebarOpen && (
                    <>
                        {/* Sidebar Tabs */}
                        <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
                            <button
                                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition ${
                                    activeTab === 'fields'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => { setActiveTab('fields'); setSelectedField(null); }}
                            >
                                <Layers size={16} />
                                {translations.fields || 'Fields'}
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition ${
                                    activeTab === 'settings'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => { setActiveTab('settings'); setSelectedField(null); }}
                            >
                                <SettingsIcon size={16} />
                                {translations.settings || 'Settings'}
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition ${
                                    activeTab === 'styles'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => { setActiveTab('styles'); setSelectedField(null); }}
                            >
                                <Palette size={16} />
                                {translations.styles || 'Styles'}
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="sidebar-content overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                            {activeTab === 'fields' && (
                                <FieldsPanel
                                    fields={fields}
                                    selectedField={selectedField}
                                    onFieldSelect={setSelectedField}
                                    onFieldReorder={handleDragEnd}
                                    availableFieldTypes={availableFieldTypes}
                                    onAddField={addField}
                                />
                            )}

                            {activeTab === 'settings' && (
                                <SettingsPanel
                                    formSettings={formSettings}
                                    onUpdateSettings={updateFormSettings}
                                />
                            )}

                            {activeTab === 'styles' && (
                                <StylesPanel
                                    formStyles={formStyles}
                                    onUpdateStyles={updateFormStyles}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Header */}
                <Card className="shadow-sm" bodyStyle={{ padding: '16px 20px' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                icon={<ArrowLeft size={16} />}
                                onClick={handleBack}
                                type="text"
                            >
                                {translations.back || 'Back'}
                            </Button>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Form Name"
                                className="font-semibold text-lg w-64"
                            />
                        </div>
                        <Button
                            type="primary"
                            icon={<Save size={16} />}
                            onClick={handleSave}
                            loading={saving}
                            size="large"
                        >
                            {translations.save || 'Save'}
                        </Button>
                    </div>
                </Card>

                {/* Field Editor (when field selected) */}
                {selectedField && (
                    <FieldEditorCard
                        field={fields.find(f => f.id === selectedField)}
                        onUpdate={(updates) => updateField(selectedField, updates)}
                        onRemove={() => { removeField(selectedField); setSelectedField(null); }}
                        onDuplicate={() => duplicateField(selectedField)}
                        onClose={() => setSelectedField(null)}
                    />
                )}

                {/* Live Preview - Always Visible */}
                <Card
                    className="shadow-sm flex-1"
                    title={
                        <div className="flex items-center gap-2">
                            <Eye size={16} />
                            <span>{translations.preview || 'Live Preview'}</span>
                        </div>
                    }
                    bodyStyle={{ padding: '24px' }}
                >
                    <FormPreview />
                </Card>
            </div>
        </div>
    );
}

// Fields Panel Component
function FieldsPanel({ fields, selectedField, onFieldSelect, onFieldReorder, availableFieldTypes, onAddField }) {
    const translations = getTranslations();

    return (
        <div className="space-y-4">
            {/* Add Field */}
            <Card size="small" title={translations.addField || 'Add Field'}>
                <div className="grid grid-cols-2 gap-2">
                    {availableFieldTypes.map(fieldType => (
                        <Button
                            key={fieldType.value}
                            onClick={() => onAddField(fieldType.value)}
                            className="h-auto py-2 flex flex-col items-center gap-1"
                            variant={fieldType.type === 'pro' ? 'outlined' : 'default'}
                        >
                            <span className="text-lg">{getFieldIcon(fieldType.value)}</span>
                            <span className="text-xs">{fieldType.label}</span>
                            {fieldType.type === 'pro' && (
                                <span className="text-xs bg-amber-500 text-white px-1 rounded">PRO</span>
                            )}
                        </Button>
                    ))}
                </div>
            </Card>

            {/* Fields List */}
            <Card size="small" title={`${translations.fields || 'Fields'} (${fields.length})`}>
                <DragDropContext onDragEnd={onFieldReorder}>
                    <Droppable droppableId="fields">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {fields.map((field, index) => (
                                    <Draggable
                                        key={field.id}
                                        draggableId={field.id}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`
                                                    p-3 rounded-lg border-2 cursor-pointer transition-all
                                                    ${selectedField === field.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }
                                                    ${snapshot.isDragging ? 'shadow-lg' : ''}
                                                `}
                                                onClick={() => onFieldSelect(field.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div {...provided.dragHandleProps}>
                                                        <GripVertical size={16} className="text-gray-400" />
                                                    </div>
                                                    <span className="text-lg">{getFieldIcon(field.type)}</span>
                                                    <span className="flex-1 truncate text-sm font-medium">{field.label}</span>
                                                    <div className="flex items-center gap-1">
                                                        {field.required && (
                                                            <span className="text-red-500 text-xs">*</span>
                                                        )}
                                                        {!field.visible && (
                                                            <span className="text-xs text-gray-400">Hidden</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Card>
        </div>
    );
}

// Settings Panel Component
function SettingsPanel({ formSettings, onUpdateSettings }) {
    const translations = getTranslations();

    return (
        <div className="space-y-4">
            <Card size="small" title={translations.formSettings || 'Form Settings'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {translations.submitButtonText || 'Submit Button Text'}
                        </label>
                        <Input
                            value={formSettings.submitButtonText}
                            onChange={(e) => onUpdateSettings({ submitButtonText: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {translations.successMessage || 'Success Message'}
                        </label>
                        <Input.TextArea
                            value={formSettings.successMessage}
                            onChange={(e) => onUpdateSettings({ successMessage: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">{translations.requireLogin || 'Require Login'}</span>
                        <Switch
                            checked={formSettings.requireLogin}
                            onChange={(checked) => onUpdateSettings({ requireLogin: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">{translations.autoApprove || 'Auto Approve Reviews'}</span>
                        <Switch
                            checked={formSettings.autoApprove}
                            onChange={(checked) => onUpdateSettings({ autoApprove: checked })}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Styles Panel Component
function StylesPanel({ formStyles, onUpdateStyles }) {
    const translations = getTranslations();

    return (
        <div className="space-y-4">
            {/* Container Styles */}
            <Card size="small" title={translations.container || 'Container'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formStyles.container?.backgroundColor || '#f9fafb'}
                                onChange={(e) => onUpdateStyles('container.backgroundColor', e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer border"
                            />
                            <Input
                                value={formStyles.container?.backgroundColor || '#f9fafb'}
                                onChange={(e) => onUpdateStyles('container.backgroundColor', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Border</label>
                        <Input
                            value={formStyles.container?.border || '1px solid #e5e7eb'}
                            onChange={(e) => onUpdateStyles('container.border', e.target.value)}
                            placeholder="1px solid #e5e7eb"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Border Radius: {formStyles.container?.borderRadius || '12px'}</label>
                        <Slider
                            min={0}
                            max={30}
                            value={parseInt(formStyles.container?.borderRadius) || 12}
                            onChange={(value) => onUpdateStyles('container.borderRadius', `${value}px`)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Padding: {formStyles.container?.padding || '24px'}</label>
                        <Slider
                            min={0}
                            max={60}
                            value={parseInt(formStyles.container?.padding) || 24}
                            onChange={(value) => onUpdateStyles('container.padding', `${value}px`)}
                        />
                    </div>
                </div>
            </Card>

            {/* Label Styles */}
            <Card size="small" title={translations.label || 'Label'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formStyles.label?.color || '#374151'}
                                onChange={(e) => onUpdateStyles('label.color', e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer border"
                            />
                            <Input
                                value={formStyles.label?.color || '#374151'}
                                onChange={(e) => onUpdateStyles('label.color', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Font Size: {formStyles.label?.fontSize || '14px'}</label>
                        <Slider
                            min={10}
                            max={24}
                            value={parseInt(formStyles.label?.fontSize) || 14}
                            onChange={(value) => onUpdateStyles('label.fontSize', `${value}px`)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Font Weight</label>
                        <select
                            value={formStyles.label?.fontWeight || '600'}
                            onChange={(e) => onUpdateStyles('label.fontWeight', e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="400">Normal</option>
                            <option value="500">Medium</option>
                            <option value="600">Semi Bold</option>
                            <option value="700">Bold</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Input Styles */}
            <Card size="small" title={translations.input || 'Input'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formStyles.input?.backgroundColor || '#ffffff'}
                                onChange={(e) => onUpdateStyles('input.backgroundColor', e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer border"
                            />
                            <Input
                                value={formStyles.input?.backgroundColor || '#ffffff'}
                                onChange={(e) => onUpdateStyles('input.backgroundColor', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Border</label>
                        <Input
                            value={formStyles.input?.border || '1px solid #d1d5db'}
                            onChange={(e) => onUpdateStyles('input.border', e.target.value)}
                            placeholder="1px solid #d1d5db"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Border Radius: {formStyles.input?.borderRadius || '8px'}</label>
                        <Slider
                            min={0}
                            max={24}
                            value={parseInt(formStyles.input?.borderRadius) || 8}
                            onChange={(value) => onUpdateStyles('input.borderRadius', `${value}px`)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Padding: {formStyles.input?.padding || '10px 14px'}</label>
                        <Input
                            value={formStyles.input?.padding || '10px 14px'}
                            onChange={(e) => onUpdateStyles('input.padding', e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Button Styles */}
            <Card size="small" title={translations.button || 'Button'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formStyles.button?.backgroundColor || '#3b82f6'}
                                onChange={(e) => onUpdateStyles('button.backgroundColor', e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer border"
                            />
                            <Input
                                value={formStyles.button?.backgroundColor || '#3b82f6'}
                                onChange={(e) => onUpdateStyles('button.backgroundColor', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Text Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formStyles.button?.color || '#ffffff'}
                                onChange={(e) => onUpdateStyles('button.color', e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer border"
                            />
                            <Input
                                value={formStyles.button?.color || '#ffffff'}
                                onChange={(e) => onUpdateStyles('button.color', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Border Radius: {formStyles.button?.borderRadius || '8px'}</label>
                        <Slider
                            min={0}
                            max={30}
                            value={parseInt(formStyles.button?.borderRadius) || 8}
                            onChange={(value) => onUpdateStyles('button.borderRadius', `${value}px`)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Padding: {formStyles.button?.padding || '12px 24px'}</label>
                        <Input
                            value={formStyles.button?.padding || '12px 24px'}
                            onChange={(e) => onUpdateStyles('button.padding', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Font Weight</label>
                        <select
                            value={formStyles.button?.fontWeight || '600'}
                            onChange={(e) => onUpdateStyles('button.fontWeight', e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="400">Normal</option>
                            <option value="500">Medium</option>
                            <option value="600">Semi Bold</option>
                            <option value="700">Bold</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Field Styles */}
            <Card size="small" title={translations.fieldSpacing || 'Field Spacing'}>
                <div>
                    <label className="block text-sm font-medium mb-2">Margin Bottom: {formStyles.field?.marginBottom || '16px'}</label>
                    <Slider
                        min={0}
                        max={40}
                        value={parseInt(formStyles.field?.marginBottom) || 16}
                        onChange={(value) => onUpdateStyles('field.marginBottom', `${value}px`)}
                    />
                </div>
            </Card>
        </div>
    );
}

// Field Editor Card Component
function FieldEditorCard({ field, onUpdate, onRemove, onDuplicate, onClose }) {
    const translations = getTranslations();
    if (!field) return null;

    return (
        <Card
            className="shadow-sm"
            title={translations.editField || 'Edit Field'}
            extra={
                <Button type="text" icon={<X size={16} />} onClick={onClose} />
            }
        >
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{translations.label || 'Label'}</label>
                        <Input
                            value={field.label}
                            onChange={(e) => onUpdate({ label: e.target.value })}
                            placeholder="Field Label"
                        />
                    </div>

                    {['text', 'textarea', 'email', 'textarea_split'].includes(field.type) && (
                        <div>
                            <label className="block text-sm font-medium mb-1">{translations.placeholder || 'Placeholder'}</label>
                            <Input
                                value={field.placeholder || ''}
                                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                                placeholder="Placeholder text"
                            />
                        </div>
                    )}

                    {(field.type === 'radio' || field.type === 'select') && (
                        <div>
                            <label className="block text-sm font-medium mb-1">{translations.options || 'Options'}</label>
                            <div className="space-y-2">
                                {(field.options || ['Option 1', 'Option 2', 'Option 3']).map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...field.options];
                                                newOptions[index] = e.target.value;
                                                onUpdate({ options: newOptions });
                                            }}
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            onClick={() => {
                                                const newOptions = field.options.filter((_, i) => i !== index);
                                                onUpdate({ options: newOptions });
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="dashed"
                                    block
                                    onClick={() => onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length || 3) + 1}`] })}
                                >
                                    {translations.addOption || 'Add Option'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {field.type === 'file' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {translations.maxFiles || 'Maximum Files'}
                            </label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={field.maxFiles || 3}
                                onChange={(e) => onUpdate({ maxFiles: parseInt(e.target.value) || 3 })}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>{translations.required || 'Required'}</span>
                        <Switch
                            checked={field.required}
                            onChange={(checked) => onUpdate({ required: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>{translations.visible || 'Visible'}</span>
                        <Switch
                            checked={field.visible}
                            onChange={(checked) => onUpdate({ visible: checked })}
                        />
                    </div>

                    <div className="pt-4 border-t space-y-2">
                        <Button danger icon={<Trash2 size={16} />} block onClick={onRemove}>
                            {translations.delete || 'Delete Field'}
                        </Button>
                        <Button icon={<Copy size={16} />} block onClick={onDuplicate}>
                            {translations.duplicate || 'Duplicate Field'}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Form Preview Component
function FormPreview() {
    const { fields, formStyles, formSettings, formName } = useFormBuilderStore();

    const containerStyle = {
        backgroundColor: formStyles.container?.backgroundColor,
        padding: formStyles.container?.padding,
        borderRadius: formStyles.container?.borderRadius,
        border: formStyles.container?.border
    };

    const buttonStyle = {
        backgroundColor: formStyles.button?.backgroundColor,
        color: formStyles.button?.color,
        borderRadius: formStyles.button?.borderRadius,
        padding: formStyles.button?.padding,
        fontWeight: formStyles.button?.fontWeight
    };

    const fieldStyle = {
        marginBottom: formStyles.field?.marginBottom
    };

    const labelStyle = {
        fontSize: formStyles.label?.fontSize,
        fontWeight: formStyles.label?.fontWeight,
        color: formStyles.label?.color
    };

    const inputStyle = {
        backgroundColor: formStyles.input?.backgroundColor,
        border: formStyles.input?.border,
        borderRadius: formStyles.input?.borderRadius,
        padding: formStyles.input?.padding
    };

    return (
        <div className="flex justify-center">
            <div style={{ maxWidth: '500px', width: '100%' }}>
                {formName && <h3 className="text-xl font-semibold mb-4 text-center">{formName}</h3>}
                <div style={containerStyle} className="shadow-lg">
                    {fields.filter(f => f.visible).map(field => (
                        <div key={field.id} style={fieldStyle} className="ts-form-field">
                            <label className="block mb-1.5 ts-form-label" style={labelStyle}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {renderPreviewInput(field, inputStyle)}
                        </div>
                    ))}
                    <button
                        type="button"
                        style={buttonStyle}
                        className="w-full ts-form-submit hover:opacity-90 transition"
                    >
                        {formSettings.submitButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper to render preview inputs
function renderPreviewInput(field, style) {
    switch (field.type) {
        case 'text':
        case 'email':
            return (
                <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full ts-form-input"
                    style={style}
                    disabled
                />
            );
        case 'textarea':
        case 'textarea_split':
            return (
                <textarea
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full ts-form-input"
                    style={style}
                    disabled
                />
            );
        case 'rating':
            return (
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <span key={i} className="text-yellow-400 text-2xl cursor-pointer hover:scale-110 transition">★</span>
                    ))}
                </div>
            );
        case 'rating_emoji':
            return (
                <div className="flex gap-3">
                    {['😢', '😐', '🙂', '😃', '🤩'].map(emoji => (
                        <span key={emoji} className="text-3xl cursor-pointer hover:scale-125 transition">
                            {emoji}
                        </span>
                    ))}
                </div>
            );
        case 'file':
            return (
                <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400 hover:border-blue-400 transition cursor-pointer" style={style}>
                    <span className="text-2xl">📎</span>
                    <p className="text-sm mt-1">{field.label || 'Upload File'}</p>
                </div>
            );
        case 'radio':
            return (
                <div className="space-y-2">
                    {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                            <input type="radio" name={field.id} className="text-blue-500" disabled />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            );
        case 'select':
            return (
                <select className="w-full" style={style} disabled>
                    <option>Select...</option>
                    {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                        <option key={i}>{opt}</option>
                    ))}
                </select>
            );
        case 'toggle':
            return (
                <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow" />
                    </div>
                </div>
            );
        case 'checkbox':
            return (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="text-blue-500 w-4 h-4" disabled />
                    <span>Accept</span>
                </label>
            );
        case 'date':
            return (
                <input
                    type="date"
                    className="w-full px-3 py-2 border rounded bg-gray-50"
                    style={style}
                    disabled
                />
            );
        default:
            return <input type="text" className="w-full" style={style} disabled />;
    }
}

export default FormEditor;
