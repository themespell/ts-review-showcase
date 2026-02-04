import { useState, useEffect } from 'react';
import { TsInput, TsMedia, TsImage } from '../../../controls/tsControls';
import { CloudUpload } from 'lucide-react';
import {getTranslations} from "../../../../utils/translations.js";

function TeamMemberBasic({ form, member_image }) {
  const translations = getTranslations();
  const [memberImage, setMemberImage] = useState(member_image || null);

  useEffect(() => {
    if (member_image) {
      setMemberImage(member_image);
    }
  }, [member_image]);
  
  return (
      <div className="p-6 bg-white">
          <div className='grid grid-cols-2 gap-4'>
              <TsInput
                  label={translations.memberName}
                  name="member_name"
                  required={true}
              />

              <TsInput
                  label={translations.memberDesignation}
                  name="member_designation"
              />

              <TsInput
                  label={translations.memberEmail}
                  name="member_email"
              />

              <TsInput
                  label={translations.memberMobile}
                  name="member_phone"
              />

          </div>


          <div className="grid grid-cols-2 gap-4">
              <TsInput
                  label={translations.memberDescription}
                  name="member_description"
                  type="description"
                  maxLength={150}
              />

              <div>
                  <label>{translations.memberImage}</label>
                  <div
                      className='tsreview__color--bg-light flex flex-col items-center gap-2 w-full border border-dashed rounded-2xl mt-2'>
                      {memberImage ? (
                          <TsImage
                              mediaUrl={memberImage}
                              type='avatar'
                          />
                      ) : (
                          <CloudUpload className="h-12 w-12 mt-8 tsreview__color--text"/>
                      )}

                      <TsMedia
                          label={translations.memberImage}
                          name="member_image"
                          form={form}
                          style="dnd"
                          mediaUrl={memberImage}
                          setMediaUrl={setMemberImage}
                      />
                  </div>
              </div>
          </div>
      </div>
  );
}

export default TeamMemberBasic;