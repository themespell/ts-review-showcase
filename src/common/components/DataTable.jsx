import { useState, useEffect } from "react";
import { Table, Dropdown, Image } from 'antd';
import { fetchData } from '../services/fetchData';
import { deleteData } from "../services/deleteData";
import {duplicateData} from "../services/duplicateData.js";
import { toastNotification } from '.././utils/toastNotification.js';
import { TsModal } from './controls/tsControls.js';
import { FilePenLine, Brush, Copy, Trash2, AlertTriangle } from 'lucide-react';
import {getTranslations} from "../utils/translations.js";

import commonStore from "../states/commonStore.js";

import { Typography } from 'antd';
import TsButton from "./controls/TsButton.jsx";
const { Text } = Typography;

function DataTable({ type, title, editor }) {
  const translations = getTranslations();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const isPro = window.tsreview_settings?.is_pro || false;
  const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;
  const canDuplicate = isPro && !isLicenseInactive;

  const { saveSettings, updateModal, reloadData } = commonStore((state) => ({
    saveSettings: state.saveSettings,
    updateModal: state.updateModal,
    reloadData: state.reloadData,
  }));

  useEffect(() => {
    setLoading(true);
    fetchData(`tsreview/${type}/fetch`, (response) => {
      if (response && response.success) {
        const showcaseData = response.data.map((item) => ({
          key: item.post_id,
          ...item,
        }));

        const dynamicColumns = Object.keys(showcaseData[0])
        .filter((key) => key !== 'post_id' && key !== 'key')
        .map((key) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          key: key,
          render: (text) => {
            switch (key) {
              case 'image':
              case 'profileImage':
                  return <Image src={text} alt={key} style={{ width: '80px', height: '80px', borderRadius: '100%', objectFit: 'cover' }} />;
              case 'shortcode':
                return <Text copyable>{text}</Text>;
              case 'snippet':
               return <Text copyable>{text}</Text>;

              default:
                return <span>{text}</span>;
            }
          },
      }));

        const actionColumn = {
          title: 'Action',
          key: 'action',
          render: (_, record) => (
              <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'edit',
                        label: (
                            <div className="tsreview__action-dropdown flex items-center w-full space-x-2 p-2 rounded-xl">
                                <FilePenLine size={20} className="tsreview__color--icon" />
                                <span>{translations.edit}</span>
                            </div>
                        ),
                        onClick: () => handleEdit(record.key),
                      },
                      ...(editor
                          ? [
                            {
                              key: 'editor',
                              label: (
                                  <div className="tsreview__action-dropdown flex items-center w-full space-x-2 p-2 rounded-xl">
                                    <Brush size={20} className="tsreview__color--icon" />
                                    <span>{translations.editDesign}</span>
                                  </div>
                              ),
                              onClick: () => handleEditor(record.key, type),
                            },
                          ]
                          : []),
                        {
                            key: 'duplicate',
                            label: (
                                <div className="tsreview__action-dropdown flex items-center w-full space-x-2 p-2 rounded-xl">
                                    <div style={{ width: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Copy size={20} className={canDuplicate ? "tsreview__color--icon" : "text-gray-500"} />
                                    </div>
                                    <span className={!canDuplicate ? "text-gray-500" : ""} style={{ flexGrow: 1 }}>{translations.duplicate || 'Duplicate'}</span>
                                    {!canDuplicate && (
                                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium">PRO</span>
                                    )}
                                </div>
                            ),
                            onClick: canDuplicate ? () => handleDuplicate(record.key) : () => handleProFeature('duplicate'),
                            disabled: !canDuplicate,
                        },
                      {
                        key: 'delete',
                        label: (
                            <div className="tsreview__action-dropdown flex items-center space-x-2 w-full p-2 rounded-xl">
                              <Trash2 size={20} className="text-red-500" />
                              <span>{translations.delete}</span>
                            </div>
                        ),
                        onClick: () => handleDelete(record.key),
                      },
                    ],
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                  overlayStyle={{
                    width: '250px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgb(223, 231, 255)',
                    borderRadius: '10px',
              }}
              >
                <a onClick={(e) => e.preventDefault()}> {/* Prevent default link behavior */}
                  <span style={{ fontSize: '18px', cursor: 'pointer' }}>•••</span> {/* Three dots */}
                </a>
              </Dropdown>
          ),
        };

        setColumns([...dynamicColumns, actionColumn]);
        setData(showcaseData);
      } else {
        console.error('Error fetching showcases:', response);
      }
      setLoading(false);
    });
  }, [type, reloadData]);

    const handleDelete = (post_id) => {
        setDeleteId(post_id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        deleteData(`tsreview/${type}/delete`, deleteId)
            .then((response) => {
                if (response.success) {
                    toastNotification('success', `${title} Deleted`, `The ${title} has been successfully deleted.`);
                    setData((prevData) => prevData.filter((item) => item.key !== deleteId));
                    setDeleteModalOpen(false);
                } else {
                    toastNotification('error', 'Error', `There was an error deleting the ${title}.`);
                }
            })
            .catch((error) => {
                toastNotification('error', 'Error', `There was an error deleting the ${error}.`);
            });
    };

    const handleDuplicate = (post_id) => {
        duplicateData(`tsreview/${type}/duplicate`, post_id)
            .then((response) => {
                if (response.success) {
                    toastNotification('success', `${title} Duplicated`, `The ${title} has been successfully duplicated.`);
                    // Use saveSettings to update reloadData
                    saveSettings('reloadData', !reloadData);
                } else {
                    toastNotification('error', 'Error', `There was an error duplicating the ${title}.`);
                }
            })
            .catch((error) => {
                console.error('Duplicate error:', error);
                toastNotification('error', 'Error', `There was an error duplicating the ${title}.`);
            });
    };

  const handleEdit = (post_id) => {
    setSelectedPost(post_id);
    saveSettings('updateModal', true);
  };

  const closeModal = () => {
    saveSettings('updateModal', false);
    setSelectedPost(null);
  };

  const handleEditor = (post_id, type) => {
    let currentUrl = window.location.href;
    if (currentUrl.includes('?')) {
        currentUrl += `&path=editor&type=${type}&post_id=${post_id}`;
    } else {
        currentUrl += `?path=editor&type=${type}&post_id=${post_id}`;
    }
    window.location.href = currentUrl;
  }

  return (
    <div className="shadow-md rounded-lg overflow-hidden mt-4">
      <Table
      bordered
      columns={columns} 
      dataSource={data}
      loading={loading}
      pagination={{
          position: ['bottomCenter'],
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],  // Use numbers instead of strings
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
      />

      <TsModal
          actionType='edit'
          formSupport={true}
          name={title}
          type={type}
          id={selectedPost}
          isOpen={updateModal}
          isClose={closeModal}
          width={800} />

        <TsModal
            isOpen={deleteModalOpen}
            isClose={() => setDeleteModalOpen(false)}
            width={400}
            name={title}
        >
            <div className="flex flex-col items-center justify-center p-6">
                {/* Warning Icon Circle */}
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                {/* Text Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{translations.areYouSure}</h3>
                <p className="text-gray-600 text-center mb-8">
                    {translations.deleteConfirmation} "{title}". {translations.areYouSure}
                </p>

                {/* Buttons */}
                <div className="flex space-x-4 w-full">
                    <TsButton
                        label={translations.noKeepIt}
                        onClick={() => setDeleteModalOpen(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg"
                    />
                    <TsButton
                        label={translations.yesDelete}
                        onClick={confirmDelete}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg"
                    />
                </div>
            </div>
        </TsModal>
    </div>
  );
}

export default DataTable;