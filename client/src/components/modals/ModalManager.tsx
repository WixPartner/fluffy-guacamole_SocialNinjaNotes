import { useAppSelector } from '../../store/hooks';
import CreateModal from './CreateModal';
import ShareModal from './ShareModal';
import MembersModal from './MembersModal';
import SettingsModal from './SettingsModal';

const ModalManager = () => {
  const { modal } = useAppSelector((state) => state.ui);

  if (!modal.isOpen) return null;

  switch (modal.type) {
    case 'createDocument':
    case 'createWorkspace':
      return <CreateModal />;
    case 'shareDocument':
      return <ShareModal />;
    case 'members':
      return <MembersModal />;
    case 'documentSettings':
    case 'settings':
      return <SettingsModal />;
    default:
      return null;
  }
};

export default ModalManager; 