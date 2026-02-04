import { TsInput, TsEditor } from '../../../controls/tsControls';
import {getTranslations} from "../../../../utils/translations.js";

function TeamMemberDetails({ form, member_information }) {
  const translations = getTranslations();
  return (
    <div className="p-6">
        <div className='grid grid-cols-2 gap-3'>

        <TsInput 
        label={translations.memberTelephone}
        name="member_telephone"
        />

        <TsInput
        label={translations.yearsOfExperience}
        name="member_experience"
        />

        <TsInput
        label={translations.company}
        name="member_company"
        />

        <TsInput
        label={translations.location}
        name="member_location"
        />

        </div>

        <TsEditor
        label={translations.detailsInformation}
        name="member_information"
        defaultValue={member_information}
        required={false} 
        form={form} 
        />
    </div>
  );
}

export default TeamMemberDetails;