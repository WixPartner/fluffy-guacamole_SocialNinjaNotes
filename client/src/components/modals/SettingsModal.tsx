import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateDocument } from '../../store/slices/documentSlice';
import { updateWorkspace } from '../../store/slices/workspaceSlice';
import { closeModal } from '../../store/slices/uiSlice';

type SettingsType = 'document' | 'workspace';

interface DocumentSettings {
  title: string;
  description?: string;
  permissions: {
    public: boolean;
    canEdit: string[];
    canView: string[];
  };
}

interface WorkspaceSettings {
  name: string;
  description?: string;
  settings: {
    defaultDocumentPermission: 'private' | 'public';
  };
}

const SettingsModal = () => {
  const dispatch = useAppDispatch();
  const { currentDocument } = useAppSelector((state) => state.document);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const type: SettingsType = currentDocument ? 'document' : 'workspace';

  const [name, setName] = useState(
    type === 'document' ? currentDocument?.title : currentWorkspace?.name
  );
  const [description, setDescription] = useState(
    type === 'document' ? currentDocument?.description : currentWorkspace?.description
  );
  const [isPublic, setIsPublic] = useState(
    type === 'document'
      ? currentDocument?.permissions?.public || false
      : currentWorkspace?.settings?.defaultDocumentPermission === 'public'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'document' && currentDocument) {
      const documentSettings: DocumentSettings = {
        title: name || '',
        description,
        permissions: {
          ...currentDocument.permissions,
          public: isPublic
        }
      };
      await dispatch(updateDocument({
        documentId: currentDocument._id,
        data: documentSettings
      }));
    } else if (type === 'workspace' && currentWorkspace) {
      const workspaceSettings: WorkspaceSettings = {
        name: name || '',
        description,
        settings: {
          ...currentWorkspace.settings,
          defaultDocumentPermission: isPublic ? 'public' : 'private'
        }
      };
      await dispatch(updateWorkspace({
        workspaceId: currentWorkspace._id,
        data: workspaceSettings
      }));
    }

    dispatch(closeModal());
  };

  if (!currentDocument && !currentWorkspace) return null;

  return (
    <Dialog open onClose={() => dispatch(closeModal())} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {type.charAt(0).toUpperCase() + type.slice(1)} Settings
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <TextField
              fullWidth
              label={type === 'document' ? 'Title' : 'Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              }
              label={
                type === 'document'
                  ? 'Make document public'
                  : 'Make new documents public by default'
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch(closeModal())}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SettingsModal; 