/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Modal, Input, Dropdown, type MenuProps, message } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { useChatMutations } from '../hooks/chatHooks';
import { useNavigate } from 'react-router-dom';

interface ChatItemProps {
  id: string;
  title: string;
  closeDrawer:()=>void;
  onChatRenamed?: (newTitle: string) => void;
  onChatDeleted?: (chatId: string) => void;
}

export default function ChatItem({ id, title, closeDrawer, onChatRenamed, onChatDeleted }: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const  navigate=useNavigate()
  const { renameChat, deleteChat, isRenaming, isDeleting } = useChatMutations();

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === title) {
      setIsEditing(false);
      return;
    }

    try {
      await renameChat({ chatId: id, newName: newTitle.trim() });
      message.success('Chat renamed successfully');
      onChatRenamed?.(newTitle.trim());
    } catch (error) {
      message.error('Failed to rename chat');
      setNewTitle(title); 
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChat(id);
      message.success('Chat deleted successfully');
      onChatDeleted?.(id);
    } catch (error) {
      message.error('Failed to delete chat');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'rename',
      label: 'Rename',
      icon: <EditOutlined />,
      onClick: () => setIsEditing(true),
      disabled: isRenaming || isDeleting,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => setIsDeleteModalOpen(true),
      disabled: isRenaming || isDeleting,
    },
  ];
  const chat_id=id;

  return (
    <div className="flex bg-green-300 items-center text-white justify-between group hover:opacity-90 transition-opacity duration-200 ease-in-out p-2 rounded">
  
         {isEditing ? (
        <Input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleRename}
          className="flex-1"
          disabled={isRenaming}
        />
      ) : (
        <span onClick={()=>{closeDrawer();navigate(`/chat/${chat_id}`)}} className="flex-1 truncate">{title}</span>
      )}

      <Dropdown menu={{ items }} trigger={['click']}>
        <button 
          className=" group-hover:opacity-100 transition-opacity p-1"
          disabled={isRenaming || isDeleting}
        >
         ...
        </button>
      </Dropdown>

      <Modal
        title="Delete Chat"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
        confirmLoading={isDeleting}
        closable={!isDeleting}
      >
        <p>Are you sure you want to delete "{title}"?</p>
        <p className="text-gray-500">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}