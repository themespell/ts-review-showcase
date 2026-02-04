import Container from '../../common/components/Container.jsx';
import {getTranslations} from "../../common/utils/translations.js";

function ReviewShowcase() {
  const translations = getTranslations();
  return (
    <div className="min-h-fit flex">
      {/* Main Content */}
      <div className="flex-1">
      <Container
            type='review_showcase'
            title={translations.reviewShowcase}
            editor={true}
        />
      </div>
    </div>
  );
}

export default ReviewShowcase;
