import { useState } from "react";
import { Button, Dropdown } from "antd";
import { Monitor, Tablet, Smartphone, Code, CircleX, Copy, ClipboardPaste, ClipboardCopy, Sparkles, LayoutTemplate, Brush } from 'lucide-react';
import editorFunction from "../states/editorFunction";
import editorLocal from "../states/editorLocal.js";
import { TsModal, TsButton } from "../../common/components/controls/tsControls";
import { getTranslations } from "../../common/utils/translations.js";
import { toastNotification } from "../../common/utils/toastNotification";

function Topbar({
    type,
    onCopyDesign,
    onPasteDesign,
    onCopyStyle,
    onPasteStyle,
    onCopyLayout,
    onPasteLayout
}) {
    const translations = getTranslations();
    const assetPath = tsreview_settings.assets_path;
    const isPro = tsreview_settings?.is_pro || false;
    const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;

    const { viewport, setViewport } = editorLocal();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const urlParams = new URLSearchParams(window.location.search);
    const post_id = urlParams.get('post_id');

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
        window.location.href = 'admin.php?page=ts-review-showcase&path=showcase';
    };

    const items = [
        {
            key: 'copy-design',
            label: translations.copyDesign || 'Copy Design',
            icon: <ClipboardCopy size={16} />,
            onClick: onCopyDesign,
            disabled: !isPro || isLicenseInactive,
        },
        {
            key: 'paste-design',
            label: translations.pasteDesign || 'Paste Design',
            icon: <ClipboardPaste size={16} />,
            onClick: onPasteDesign,
            disabled: !isPro || isLicenseInactive,
        },
        {
            type: 'divider',
        },
        {
            key: 'copy-style',
            label: 'Copy Style',
            icon: <Brush size={16} />,
            onClick: onCopyStyle,
            disabled: !isPro || isLicenseInactive,
        },
        {
            key: 'paste-style',
            label: 'Paste Style',
            icon: <ClipboardPaste size={16} />,
            onClick: onPasteStyle,
            disabled: !isPro || isLicenseInactive,
        },
        {
            key: 'copy-layout',
            label: 'Copy Layout',
            icon: <LayoutTemplate size={16} />,
            onClick: onCopyLayout,
            disabled: !isPro || isLicenseInactive,
        },
        {
            key: 'paste-layout',
            label: 'Paste Layout',
            icon: <ClipboardPaste size={16} />,
            onClick: onPasteLayout,
            disabled: !isPro || isLicenseInactive,
        },
    ];

    return (
        <>
            <div className="ts-editor-topbar">
                <div className="ts-editor-topbar__brand">
                    <div className="ts-editor-topbar__brand-mark">
                        <img src={`${assetPath}/img/tsreview_icon.png`} className="tsreview__topbar-logo w-9 h-9" alt="Review Showcase" />
                    </div>
                    <div className="ts-editor-topbar__brand-copy">
                        <span>TS Customer Review</span>
                        <small>Draft · auto-saved</small>
                    </div>
                </div>

                <div className="ts-editor-topbar__center">
                    <div className="ts-editor-viewport-switcher">
                        <Button
                            className={`ts-editor-viewport-button ${viewport === 'desktop' ? 'is-active' : ''}`}
                            icon={<Monitor size={18} />}
                            onClick={() => setViewport('desktop')}
                        />
                        <Button
                            className={`ts-editor-viewport-button ${viewport === 'tablet' ? 'is-active' : ''}`}
                            icon={<Tablet size={18} />}
                            onClick={() => setViewport('tablet')}
                        />
                        <Button
                            className={`ts-editor-viewport-button ${viewport === 'mobile' ? 'is-active' : ''}`}
                            icon={<Smartphone size={18} />}
                            onClick={() => setViewport('mobile')}
                        />
                    </div>
                </div>

                <div className="ts-editor-topbar__actions">
                    {isPro && !isLicenseInactive ? (
                        <Dropdown menu={{ items }} trigger={['click']}>
                            <TsButton
                                label={<><Copy size={16} /> Copy / Paste</>}
                                className="ts-editor-ghost-button"
                            />
                        </Dropdown>
                    ) : (
                        <TsButton
                            label={<><Sparkles size={16} /> Pro Copy / Paste</>}
                            className="ts-editor-ghost-button opacity-70"
                        />
                    )}

                    <TsButton
                        label={<><Code size={16} /> Code</>}
                        className="ts-editor-ghost-button"
                        onClick={() => setIsModalVisible(true)}
                    />
                    <TsButton
                        label={translations.publish || 'Publish'}
                        className="ts-editor-publish-button"
                        onClick={handlePublishClick}
                    />
                    <TsButton
                        label={<>Close <CircleX size={14} /></>}
                        className="ts-editor-close-button"
                        onClick={handleBacktoAdmin}
                    />
                </div>
            </div>

            <TsModal
                isOpen={isModalVisible}
                isClose={() => setIsModalVisible(false)}
                width={600}
                name={translations.shortcode || 'Shortcode'}
            >
                <div className="flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[linear-gradient(135deg,#8b7bff_0%,#6f63ff_42%,#575ecf_100%)]">
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

                    <div className="flex justify-end">
                        <TsButton
                            label={translations.done || 'Done'}
                            onClick={() => setIsModalVisible(false)}
                            className="ts-editor-publish-button"
                        />
                    </div>
                </div>
            </TsModal>
        </>
    );
}

export default Topbar;
