import { useState } from "react";
import { SquareChevronLeft, SquareChevronRight, LayoutDashboard, Paintbrush, Settings, Type, Facebook, NotebookPen, Play } from "lucide-react"; // Import Lucide icons
import ContentTab from "./Tabs/ContentTab";
import StyleTab from './Tabs/StyleTab';
import TypographyTab from "./Tabs/TypographyTab.jsx";
import SocialTab from "./Tabs/SocialTab.jsx";
import DetailsTab from "./Tabs/DetailsTab.jsx";
import MotionTab from "./Tabs/MotionTab.jsx";
import GlobalTab from "./Tabs/GlobalTab.jsx";

import {getTranslations} from "../../../common/utils/translations.js";

function Sidebar({ isOpen, selectedLayout, layoutType, onToggleSidebar }) {
    const translations = getTranslations();
    const [activeTab, setActiveTab] = useState("1"); // State to manage active tab

    return (
        <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
            {/* Small section (blue section) that is always visible */}
            <div className="sidebar-toggle">
                {/* Toggle button */}
                <div className="toggle-icon pb-12" onClick={onToggleSidebar}>
                    {isOpen ? (
                        <SquareChevronLeft size={22} /> // Show left chevron when sidebar is open
                    ) : (
                        <SquareChevronRight size={22} /> // Show right chevron when sidebar is closed
                    )}
                </div>

                {/* Buttons to toggle between tabs */}
                <div className="sidebar-buttons flex flex-col gap-12 pt-12">
                    <div className="flex flex-col justify-center items-center"
                         onClick={() => setActiveTab("1")}>
                        <button className={`sidebar-button ${activeTab === "1" ? "active" : ""}`}>
                            <LayoutDashboard size={22}/>
                        </button>
                        <p className="text-xs mt-1">{translations.content}</p>
                    </div>

                    <div className="flex flex-col justify-center items-center"
                         onClick={() => setActiveTab("2")}>
                        <button className={`sidebar-button ${activeTab === "2" ? "active" : ""}`}>
                            <Paintbrush size={22}/>
                        </button>
                        <p className="text-xs mt-1">{translations.style}</p>
                    </div>

                    <div className="flex flex-col justify-center items-center"
                         onClick={() => setActiveTab("3")}>
                        <button className={`sidebar-button ${activeTab === "3" ? "active" : ""}`}>
                            <Type size={22}/> {/* Icon for Font */}
                        </button>
                        <p className="text-xs mt-1">{translations.font}</p>
                    </div>

                    {/*<div className="flex flex-col justify-center items-center"*/}
                    {/*     onClick={() => setActiveTab("4")}>*/}
                    {/*    <button className={`sidebar-button ${activeTab === "4" ? "active" : ""}`}>*/}
                    {/*        <Facebook size={22}/> /!* Icon for Social *!/*/}
                    {/*    </button>*/}
                    {/*    <p className="text-xs mt-1">{translations.social}</p>*/}
                    {/*</div>*/}

                    <div className="flex flex-col justify-center items-center"
                         onClick={() => setActiveTab("5")}>
                        <button className={`sidebar-button ${activeTab === "5" ? "active" : ""}`}>
                            <NotebookPen size={22}/> {/* Icon for Social */}
                        </button>
                        <p className="text-xs mt-1">Details</p>
                    </div>

                    <div className="flex flex-col justify-center items-center"
                         onClick={() => setActiveTab("6")}>
                        <button className={`sidebar-button ${activeTab === "6" ? "active" : ""}`}>
                            <Play size={22}/> {/* Icon for Advance */}
                        </button>
                        <p className="text-xs mt-1">{translations.motion}</p>
                    </div>

                    <div className="flex flex-col justify-center items-center"
                         onClick={() => setActiveTab("7")}>
                        <button className={`sidebar-button ${activeTab === "7" ? "active" : ""}`}>
                            <Settings size={22}/>
                        </button>
                        <p className="text-xs mt-1">{translations.global}</p>
                    </div>

                </div>
            </div>

            {/* Main sidebar content */}
            <div className="sidebar">
                {/* Render the active tab component */}
                <div className="sidebar-content">
                    {activeTab === "1" && <ContentTab/>}
                    {activeTab === "2" && (
                        <StyleTab selectedLayout={selectedLayout} layoutType={layoutType}/>
                    )}
                    {activeTab === "3" && <TypographyTab />}
                    {activeTab === "4" && <SocialTab />}
                    {activeTab === "5" && <DetailsTab />}
                    {activeTab === "6" && <MotionTab />}
                    {activeTab === "7" && <GlobalTab />}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;