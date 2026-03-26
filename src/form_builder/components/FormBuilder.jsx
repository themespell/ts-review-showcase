import useFormBuilderStore from '../states/formBuilderStore';
import FormTemplates from './FormTemplates';
import FormEditor from './FormEditor';
import { getTranslations } from '../../common/utils/translations';

/**
 * Main Form Builder Component
 * Orchestrates the template selection and editing flow
 */
function FormBuilder() {
    const translations = getTranslations();
    const { currentView } = useFormBuilderStore();

    return (
        <div className="ts-form-builder">
            {currentView === 'templates' ? <FormTemplates /> : <FormEditor />}
        </div>
    );
}

export default FormBuilder;
