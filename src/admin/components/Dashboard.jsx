import TsNotice from "../../common/components/controls/TsNotice.jsx";
import TsButton from "../../common/components/controls/TsButton.jsx";
import {getTranslations} from "../../common/utils/translations.js";

function Dashboard() {
    const tsreviewImage = tsreview_settings.plugin_url || '';
    const translations = getTranslations();
    return (
        <div className="min-h-fit flex">
            {/* Main Content */}
            <div className="flex-1">
                <TsNotice
                    heading={'Unlock Ts Review Showcase with an Exclusive Discount!'}
                    description={'Take your experience to the next level with TS Review Showcase Pro Version. For a limited time, we are offering an exclusive early bird discount - do not miss out!'}
                    label={translations.grabYourDiscount}
                    ctalink={'https://themespell.com/ts-review-showcase'}
                />

                <div className="flex justify-between items-center gap-6 mt-8">
                    <div className="bg-white p-12 pt-8 tsreview__global--border h-96">
                        <div>
                            <h2 className="text-3xl font-bold">Enhance Your TS Review Showcase Plugin</h2>
                            <p className="text-base mt-4">Maximize the potential of your TS Review Showcase WordPress plugin with our curated resources.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-4">
                            <div className="tsreview__dasboard--card tsreview__global--border">
                                <h4 className="text-xl">{translations.documentations}</h4>
                                <p className="mt-4 mb-4">Dive into detailed guides and tutorials to set up and customize your TS Review Showcase plugin.</p>
                                <a href="">Coming Soon</a>
                            </div>

                            <div className="tsreview__dasboard--card tsreview__global--border">
                                <h4 className="text-xl">{translations.helpAndSupport}</h4>
                                <p className="mt-4 mb-4">Need assistance? Our dedicated support team is here to help you troubleshoot issues.</p>
                                <a href="">Coming Soon</a>
                            </div>

                            <div className="tsreview__dasboard--card tsreview__global--border">
                                <h4 className="text-xl">{translations.videoGuide}</h4>
                                <p className="mt-4 mb-4">Watch easy-to-follow video tutorials to master the TS Review Showcase plugin.</p>
                                <a href="">Coming Soon</a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white h-96 tsreview__global--border p-6 flex flex-col justify-center items-center">
                        <h2 className="mt-4 text-xl">{translations.upgradeToPro}</h2>
                        <p className="mt-4 mb-4 text-center">Exciting new features and updates are on the way! Stay tuned for
                            enhancements that will make your TS Review Showcase plugin even more powerful.</p>
                        <a className="tsreview-button btn btn-primary" href="https://themespell.com/ts-review-showcase">Grab Discount</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
