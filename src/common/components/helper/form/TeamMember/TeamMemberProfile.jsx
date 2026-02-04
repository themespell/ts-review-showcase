import { TsInput, TsRepeater } from '../../../controls/tsControls';
import { safeJsonParse } from '../../../../utils/safeJsonParse';
import {getTranslations} from "../../../../utils/translations.js";

function TeamMemberProfile({ form, social_links, skills }) {
  const translations = getTranslations();
  return (
    <div className="p-6">
        <div className='grid grid-cols-2 gap-3'>

        <TsInput
        label={translations.website}
        name="member_website"
        />

        <TsInput 
        label={translations.resumeLink}
        name="member_resume"
        />

        <TsInput 
        label={translations.hireLink}
        name="member_hire"
        />

        <TsInput
        label={translations.donationLink}
        name="member_donation"
        />
        
        </div>


        <TsRepeater
        form={form}
        label={translations.socialLinks}
        fieldName="member_social"
        defaultValues={safeJsonParse(social_links)}
        required={false}
        fieldNames={['link']}
        controlSupport={{
          type: 'select',
          name: 'socialChannel',
          options: [
            {
              label: 'Facebook',
              value: 'facebook',
            },
            {
              label: 'Twitter',
              value: 'twitter',
            },
            {
              label: 'Linkedin',
              value: 'linkedin',
            },
            {
              label: 'Instagram',
              value: 'instagram',
            },
            {
              label: 'Youtube',
              value: 'youtube',
            },
            {
              label: 'Github',
              value: 'github',
            },
          ],
          placeholder: 'Social Media',
        }}
      />


        <TsRepeater
            form={form}
            label={translations.skills}
            fieldName="member_skills"
            defaultValues={safeJsonParse(skills)}
            required={false}
            fieldNames={['skill']}
            controlSupport={{
                type: 'inputnumber',
                name: 'rating',
                placeholder: 'Social Media',
            }}
        />
    </div>
  );
}

export default TeamMemberProfile;