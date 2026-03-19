import ReviewShowcase from './components/ReviewShowcase';
import ReviewForm from './components/ReviewForm';
import Settings from './components/Settings';
import Dashboard from "./components/Dashboard.jsx";
import Topbar from './components/Topbar';

import {getTranslations} from "../common/utils/translations.js";

const currentUrl = window.location.href;
const translations = getTranslations();

function AdminPanel() {
  const isReviewFormPage = currentUrl.includes(`&path=review-form`);
  const isDashboardPage = currentUrl.includes(`&path=dashboard`);
  const isSettingsPage = currentUrl.includes(`&path=settings`);

  if (isDashboardPage) {
    return (
        <>
            <Topbar title={translations.dashboard}/>
            <div className='tsreview__admin--style overflow-x-auto w-full flex justify-center pt-12 pb-12'>
                <div className='flex justify-between gap-8 w-4/6'>
                    <div className='w-full'>
                        <Dashboard/>
                    </div>
                </div>
            </div>
        </>
    );
  } else if (isSettingsPage) {
    return (
        <>
            <Topbar title={translations.settings}/>
            <div className='tsreview__admin--style overflow-x-auto w-full flex justify-center pt-12 pb-12'>
                <div className='flex justify-between gap-8 w-4/6'>
                    <div className='w-full'>
                        <Settings/>
                    </div>
                </div>
            </div>
        </>
    );
  } else {
    return (
        <>
            <Topbar title={isReviewFormPage ? translations.reviewForm : translations.reviewShowcase}/>
            <div className='tsreview__admin--style overflow-x-auto w-full flex justify-center pt-12 pb-12'>
                <div className='flex justify-between gap-8 w-4/6'>
                    <div className='w-full'>
                        {isReviewFormPage ? (
                            <ReviewForm/>
                        ) : (
                            <ReviewShowcase />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
  }
}

export default AdminPanel;
