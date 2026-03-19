import { useState } from "react";
import { Button, Dropdown } from "antd";
import { Monitor, Tablet, Smartphone, Code, X, Copy, ClipboardCopy, ClipboardPaste, Check } from 'lucide-react';
import editorFunction from "../states/editorFunction";
import editorLocal from "../states/editorLocal.js";
import { TsModal, TsButton } from "../../common/components/controls/tsControls";
import { getTranslations } from "../../common/utils/translations.js";
import { toastNotification } from "../../common/utils/toastNotification";

function Topbar({ type, onCopySettings, onPasteSettings }) {
    const translations = getTranslations();
    const tsteamLogo = tsreview_settings.assets_path;
    const isPro = tsreview_settings?.is_pro || false;
    const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;

    const { viewport, setViewport } = editorLocal();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const urlParams = new URLSearchParams(window.location.search);
    const post_id = urlParams.get('post_id');

    const handleViewportChange = (newViewport) => {
        setViewport(newViewport);
    };

    const handlePublishClick = () => {
        const action = `tsreview/${type}/update/settings`;
        editorFunction.getState().updateSettings(action);
        toastNotification(
            'success',
            translations.published || 'Published',
            translations.settingsSaved || 'Your changes have been saved successfully.'
        );
    };

    const handleBacktoAdmin = () => {
        const admin_url = `admin.php?page=ts-product-showcase&path=showcase`;
        window.location.href = admin_url;
    };

    const handleCodeClick = () => {
        setIsModalVisible(true);
    };

    const handleCopy = () => {
        onCopySettings();
    };

    const handlePaste = () => {
        onPasteSettings();
    };

    const copyPasteItems = [
        {
            key: 'copy',
            label: translations.copyDesign || 'Copy Design',
            icon: <ClipboardCopy size={16} />,
            onClick: handleCopy,
        },
        {
            key: 'paste',
            label: translations.pasteDesign || 'Paste Design',
            icon: <ClipboardPaste size={16} />,
            onClick: handlePaste,
        },
    ];

    return (
        <>
            <div className="tsreview__editor-topbar flex px-4 py-3 justify-between items-center">
                {/* Logo Section */}
                <div className="flex-shrink-0">
                    <img
                        src={`${tsteamLogo}/img/tsreview_icon_white.svg`}
                        className="tsreview__topbar-logo w-10 h-10"
                        alt="Logo"
                    />
                </div>

                {/* Responsive Viewport Buttons */}
                <div className="editor-toolbar flex">
                    <Button
                        className={viewport === 'desktop' ? 'responsive-button-primary' : ''}
                        icon={<Monitor size={18} />}
                        onClick={() => handleViewportChange('desktop')}
                        title={translations.desktop || 'Desktop'}
                    />
                    <Button
                        className={viewport === 'tablet' ? 'responsive-button-primary' : ''}
                        icon={<Tablet size={18} />}
                        onClick={() => handleViewportChange('tablet')}
                        title={translations.tablet || 'Tablet'}
                    />
                    <Button
                        className={viewport === 'mobile' ? 'responsive-button-primary' : ''}
                        icon={<Smartphone size={18} />}
                        onClick={() => handleViewportChange('mobile')}
                        title={translations.mobile || 'Mobile'}
                    />
                </div>

                {/* Action Buttons */}
                <div className="tsreview__topbar-actions flex">
                    {isPro && !isLicenseInactive ? (
                        <Dropdown menu={{ items: copyPasteItems }} trigger={['click']}>
                            <Button
                                icon={<Copy size={18} />}
                                className="tsreview__topbar-icon-btn"
                                title={translations.copyDesign || 'Copy Design'}
                            />
                        </Dropdown>
                    ) : null}

                    <Button
                        icon={<Code size={18} />}
                        className="tsreview__topbar-icon-btn"
                        onClick={handleCodeClick}
                        title={translations.shortcode || 'Shortcode'}
                    />

                    <Button
                        type="primary"
                        className="tsreview__editor-button"
                        onClick={handlePublishClick}
                    >
                        {translations.publish || 'Publish'}
                    </Button>

                    <Button
                        icon={<X size={18} />}
                        className="tsreview__topbar-icon-btn danger"
                        onClick={handleBacktoAdmin}
                        title={translations.exit || 'Exit'}
                    />
                </div>
            </div>

            {/* Code Modal */}
            <TsModal
                isOpen={isModalVisible}
                isClose={() => setIsModalVisible(false)}
                width={600}
                name={translations.shortcode || 'Shortcode'}
            >
                <div className="flex flex-col p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {translations.embedCode || 'Embed Code'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {translations.useBelowCode || 'Use the code below to embed this showcase'}
                            </p>
                        </div>
                    </div>

                    {/* Shortcode Section */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {translations.shortcode || 'Shortcode'}
                        </label>
                        <div className="relative group">
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto font-mono">
                                <code>[tsreview_showcase id="{post_id}"]</code>
                            </pre>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`[tsreview_showcase id="${post_id}"]`);
                                    toastNotification('success', 'Copied!', 'Shortcode copied to clipboard.');
                                }}
                                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy"
                            >
                                <ClipboardCopy size={16} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* PHP Snippet Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PHP Snippet
                        </label>
                        <div className="relative group">
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto font-mono">
                                <code>&lt;?php echo do_shortcode('[tsreview_showcase id="{post_id}"]'); ?&gt;</code>
                            </pre>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`<?php echo do_shortcode('[tsreview_showcase id="${post_id}"]'); ?>`);
                                    toastNotification('success', 'Copied!', 'PHP snippet copied to clipboard.');
                                }}
                                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy"
                            >
                                <ClipboardCopy size={16} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end">
                        <TsButton
                            label={
                                <>
                                    <Check size={16} className="mr-2" />
                                    {translations.done || 'Done'}
                                </>
                            }
                            onClick={() => setIsModalVisible(false)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none"
                        />
                    </div>
                </div>
            </TsModal>
        </>
    );
}

export default Topbar;