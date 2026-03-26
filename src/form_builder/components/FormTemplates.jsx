import { Card, Button, Badge } from 'antd';
import { Eye, Edit, Lock } from 'lucide-react';
import useFormBuilderStore from '../states/formBuilderStore';
import { isProTemplate, getProBadge } from '../utils/formBuilderHelpers';
import { getFreeFormTemplates, getProFormTemplates } from '../form_templates';
import { getTranslations } from '../../common/utils/translations';

function FormTemplates() {
    const translations = getTranslations();
    const { setCurrentForm, createNewForm } = useFormBuilderStore();

    const freeTemplates = getFreeFormTemplates();
    const proTemplates = getProFormTemplates();
    const isPro = window.tsreview_settings?.is_pro || false;
    const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;

    const handleSelectTemplate = (template) => {
        if (template.type === 'free' || (isPro && !isLicenseInactive)) {
            createNewForm(template.id);
        }
    };

    const handlePreviewTemplate = (template) => {
        setCurrentForm(template.id);
    };

    const TemplateCard = ({ template }) => {
        const isProTemplateLocked = template.type === 'pro' && (!isPro || isLicenseInactive);

        return (
            <div className="relative group">
                <Card
                    hoverable={!isProTemplateLocked}
                    className={`h-full transition-all duration-300 ${
                        isProTemplateLocked ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-1'
                    }`}
                    cover={
                        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                            <div className="text-4xl">📝</div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                            {isProTemplateLocked && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Lock className="w-12 h-12 text-white/80" />
                                </div>
                            )}
                        </div>
                    }
                    actions={[
                        <Button
                            key="preview"
                            type="text"
                            icon={<Eye size={16} />}
                            onClick={() => handlePreviewTemplate(template)}
                            disabled={isProTemplateLocked}
                        >
                            Preview
                        </Button>,
                        <Button
                            key="select"
                            type={isProTemplateLocked ? 'default' : 'primary'}
                            icon={isProTemplateLocked ? <Lock size={16} /> : <Edit size={16} />}
                            onClick={() => handleSelectTemplate(template)}
                            disabled={isProTemplateLocked}
                            className={isProTemplateLocked ? 'bg-gray-300 text-gray-600' : ''}
                        >
                            {isProTemplateLocked ? 'Pro Only' : 'Select'}
                        </Button>
                    ]}
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                            <Badge
                                color={template.type === 'free' ? 'green' : 'gold'}
                                className="uppercase text-xs"
                            >
                                {template.type}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="flex flex-wrap gap-1 pt-2">
                            {template.fields.slice(0, 4).map(field => (
                                <span
                                    key={field.id}
                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                                >
                                    {field.type}
                                </span>
                            ))}
                            {template.fields.length > 4 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    +{template.fields.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {translations.selectFormTemplate || 'Select a Form Template'}
                </h2>
                <p className="text-gray-600">
                    {translations.selectFormTemplateDesc || 'Choose from our collection of form designs or customize your own'}
                </p>
            </div>

            {/* Free Templates Section */}
            <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    {translations.freeTemplates || 'Free Templates'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freeTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </div>

            {/* Pro Templates Section */}
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></span>
                    {translations.proTemplates || 'Pro Templates'}
                    {!isPro && (
                        <span className="text-sm font-normal text-gray-500">
                            ({translations.upgradeToUnlock || 'Upgrade to unlock'})
                        </span>
                    )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
                {!isPro && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg text-center">
                        <p className="text-gray-700 mb-3">
                            {translations.unlockAllTemplates || 'Unlock all pro templates and advanced features'}
                        </p>
                        <Button
                            type="primary"
                            size="large"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 border-none"
                        >
                            {translations.getPro || 'Get Pro Now'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FormTemplates;
