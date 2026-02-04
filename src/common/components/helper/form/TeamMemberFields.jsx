import { useState, useEffect } from 'react';
import { Form, Tabs } from 'antd';

import TeamMemberBasic from './TeamMember/TeamMemberBasic';
import TeamMemberProfile from './TeamMember/TeamMemberProfile';
import TeamMemberDetails from './TeamMember/TeamMemberDetails';
import TeamMemberCustom from './TeamMember/TeamMemberCustom';

import { fetchData } from '../../../services/fetchData';
import {getTranslations} from "../../../utils/translations.js";

function TeamMemberFields({ form, post_id }) {
  const translations = getTranslations();
  const [memberImage, setMemberImage] = useState(null);
  const [memberInformation, setMemberInformation] = useState(null);
  const [socialLinks, setSocialLinks] = useState(null);
  const [skills, setSkills] = useState(null);

  useEffect(() => {
    if (memberInformation) {
      form.setFieldsValue({
        member_information: memberInformation
      });
    }

    if (socialLinks) {
      form.setFieldsValue({
        social_links: socialLinks
      });
    }

    if (skills) {
      form.setFieldsValue({
        skills: skills
      });
    }
  }, [memberInformation, socialLinks, skills, form]);

  useEffect(() => {
    if (post_id) {
      fetchData(`tsteam/team_member/fetch/single`, (response) => {
        if (response.success && response.data) {
          form.setFieldsValue({
            member_name: response.data.title,
            member_designation: response.data.meta_data.designation,
            member_image: response.data.meta_data.image,
            member_description: response.data.content,
            member_email: response.data.meta_data.email,
            member_phone: response.data.meta_data.phone,

            member_telephone: response.data.meta_data.telephone,
            member_experience: response.data.meta_data.experience,
            member_company: response.data.meta_data.company,
            member_location: response.data.meta_data.location,
            member_website: response.data.meta_data.website,
            member_resume: response.data.meta_data.resume,
            member_hire: response.data.meta_data.hireLink,
            member_donation: response.data.meta_data.donationLink,
          });
          setMemberImage(response.data.meta_data.image);
          setMemberInformation(response.data.meta_data.information);
          setSocialLinks(response.data.meta_data.socialLinks);
          setSkills(response.data.meta_data.skills);
        } else {
          console.error('Failed to fetch showcase data.');
        }
      }, { post_id: post_id });
    }
  }, [post_id, form]);

  const items = [
    {
      key: '1',
      label: 'Basic Information',
      children: <TeamMemberBasic form={form} member_image={memberImage} />,
    },
    {
      key: '2',
      label: 'Details Information',
      children: <TeamMemberDetails form={form} member_information={memberInformation} />,
    },
    {
      key: '3',
      label: 'Profile Links',
      children: <TeamMemberProfile form={form} social_links={socialLinks} skills={skills} />,
    },
    // {
    //   key: '4',
    //   label: 'Custom Fields',
    //   children: <TeamMemberCustom form={form} />,
    // },
  ];
    

  return (
    <>
      <Form.Item name="member_information" hidden>
        <input type="hidden" />
      </Form.Item>
      <Form.Item name="social_links" hidden>
        <input type="hidden" />
      </Form.Item>
      <Form.Item name="skills" hidden>
        <input type="hidden" />
      </Form.Item>
      <Tabs
          defaultActiveKey="1"
          items={items}
          tabPosition="left"
          tabBarStyle={{
            width: '200px',
            borderRight: '1px solid #f0f0f0',
            paddingTop: '2rem'
            // backgroundColor: '#F3EEFF',
          }}
      />
    </>
  );
}

export default TeamMemberFields;