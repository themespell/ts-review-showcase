import {useState} from "react";
import { TsButton } from "../../common/components/controls/tsControls";
import editorFunction from "../states/editorFunction";
import editorLocal from "../states/editorLocal.js";
import {Monitor, Tablet, Smartphone, Code, CircleX, Copy, ClipboardPaste, ClipboardCopy} from 'lucide-react';
import {Button, Dropdown} from "antd";
import {TsModal} from "../../common/components/controls/tsControls";
import {getTranslations} from "../../common/utils/translations.js";

function Topbar({ type, onCopySettings, onPasteSettings}) {
    const translations = getTranslations();
    const tsteamLogo = tsreview_settings.assets_path;
    const isPro = !!tsreview_settings.is_pro ?? null;
    const isLicenseInactive = !!window.tsTeamPro?.is_licence_inactive ?? null;

    const { viewport, setViewport } = editorLocal();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const urlParams = new URLSearchParams(window.location.search);
    const post_id = urlParams.get('post_id')

    const handleViewportChange = (newViewport) => {
        setViewport(newViewport); // Update global state
    };

    const handlePublishClick = () => {
        const action = `tsreview/${type}/update/settings`;
        editorFunction.getState().updateSettings(action);
    };

    const handleBacktoAdmin = () => {
        const admin_url = `admin.php?page=ts-product-showcase&path=showcase`;
        window.location.href = admin_url;
    };

    const handleCodeClick = () => {
        console.log('working')
        setIsModalVisible(true);
    };

    const items = [
        {
            key: 'copy',
            label: (
                <TsButton
                    label={
                        <>
                            <ClipboardCopy /> {translations.copyDesign}
                        </>
                    }
                    onClick={onCopySettings}
                />
            ),
        },
        {
            key: 'paste',
            label: (
                <TsButton
                    label={
                        <>
                            <ClipboardPaste /> {translations.pasteDesign}
                        </>
                    }
                    onClick={onPasteSettings}
                />
            ),
        },
    ];

    return (
        <>
            <div className="flex tsreview__editor-topbar p-3 justify-between items-center">
                <div>
                    <img src={`${tsteamLogo}/img/tsreview_icon_white.svg`} className="tsreview__topbar-logo w-10 h-10 ml-16"/>
                </div>

                {/* Responsive Buttons */}
                <div className="editor-toolbar flex gap-2 mx-auto">
                    <Button
                        className={`btn ${viewport === 'desktop' ? 'responsive-button-primary' : 'responsive-button-secondary'}`}
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.3s, color 0.3s',
                    }}
                        icon={<Monitor/>}
                        onClick={() => handleViewportChange('desktop')}
                    />
                    <Button
                        className={`btn ${viewport === 'tablet' ? 'responsive-button-primary' : 'responsive-button-secondary'}`}
                        style={{width: '40px', height: '40px'}}
                        icon={<Tablet/>}
                        onClick={() => handleViewportChange('tablet')}
                    />
                    <Button
                        className={`btn ${viewport === 'mobile' ? 'responsive-button-primary' : 'responsive-button-secondary'}`}
                        style={{width: '40px', height: '40px'}}
                        icon={<Smartphone />}
                        onClick={() => handleViewportChange('mobile')}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {isPro && !isLicenseInactive ? (
                        <Dropdown menu={{ items }} trigger={['click']}>
                            <TsButton
                                label={<Copy />}
                                className="bg-transparent text-white border-none hover:bg-white hover:text-purple-600"
                            />
                        </Dropdown>
                    ) : null}
                    <TsButton
                        label={<Code/>}
                        className="bg-transparent text-white border-none hover:bg-white hover:text-purple-600"
                        onClick={handleCodeClick}
                    />
                    <TsButton
                        label={translations.publish}
                        className="tsreview__editor-button"
                        onClick={handlePublishClick}
                    />
                    <TsButton
                        label={<CircleX/>}
                        className="bg-transparent text-white border-none hover:bg-red-500 hover:text-white"
                        onClick={handleBacktoAdmin}
                    />
                </div>
            </div>

            {/*Code Modal*/}
            <TsModal
                isOpen={isModalVisible}
                isClose={() => setIsModalVisible(false)}
                width={550}
                name="Code Modal"
            >
                <div className="flex flex-col items-center justify-center p-8">
                    {/* Warning Icon Circle */}
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <Code className="w-8 h-8 text-purple-600"/>
                    </div>

                    {/* Text Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Shortcode</h3>
                    <div className="mockup-code tsreview__color--bg-alt text-white">
                        <pre data-prefix="$"><code>[tsreview_showcase id="{post_id}"]</code></pre>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-2">PHP Snippet</h3>
                    <div className="mockup-code tsreview__color--bg-alt text-white">
                        <pre data-prefix="$"><code>echo do_shortcode('[tsreview_showcase id="{post_id}"]');</code></pre>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center items-center mt-8 space-x-4 w-full">
                        <TsButton
                            label="Done"
                            onClick={() => setIsModalVisible(false)}
                        />
                    </div>
                </div>
            </TsModal>
        </>
    );
}

export default Topbar;