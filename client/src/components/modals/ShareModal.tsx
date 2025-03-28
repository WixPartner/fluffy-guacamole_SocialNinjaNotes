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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateDocumentPermissions } from '../../store/slices/documentSlice';
import { closeModal } from '../../store/slices/uiSlice';

type Permission = 'view' | 'edit' | 'admin';

interface Collaborator {
  userId: string;
  email: string;
  permission: Permission;
}

const ShareModal = () => {
  const dispatch = useAppDispatch();
  const { currentDocument } = useAppSelector((state) => state.document);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('view');
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    currentDocument?.collaborators || []
  );

  const handleAddCollaborator = () => {
    if (email && !collaborators.find(c => c.email === email)) {
      const newCollaborator: Collaborator = {
        userId: '', // Will be set by the backend
        email,
        permission
      };
      setCollaborators([...collaborators, newCollaborator]);
      setEmail('');
    }
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(collaborators.filter(c => c.email !== email));
  };

  const handlePermissionChange = (email: string, newPermission: Permission) => {
    setCollaborators(collaborators.map(c => 
      c.email === email ? { ...c, permission: newPermission } : c
    ));
  };

  const handleSave = async () => {
    if (currentDocument) {
      await dispatch(updateDocumentPermissions({
        documentId: currentDocument._id,
        collaborators
      }));
      dispatch(closeModal());
    }
  };

  const handleCopyLink = () => {
    if (currentDocument) {
      const shareLink = `${window.location.origin}/documents/${currentDocument._id}`;
      navigator.clipboard.writeText(shareLink);
    }
  };

  if (!currentDocument) return null;

  return (
    <Dialog open onClose={() => dispatch(closeModal())} maxWidth="sm" fullWidth>
      <DialogTitle>Share Document</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Share Link
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              value={`${window.location.origin}/documents/${currentDocument._id}`}
              InputProps={{ readOnly: true }}
              size="small"
            />
            <IconButton onClick={handleCopyLink} color="primary">
              <CopyIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Add People
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={permission}
                onChange={(e) => setPermission(e.target.value as Permission)}
              >
                <MenuItem value="view">Can view</MenuItem>
                <MenuItem value="edit">Can edit</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddCollaborator}>
              Add
            </Button>
          </Box>

          <List>
            {collaborators.map((collaborator) => (
              <ListItem key={collaborator.email} divider>
                <ListItemText
                  primary={collaborator.email}
                  secondary={
                    <Chip
                      size="small"
                      label={collaborator.permission}
                      color={
                        collaborator.permission === 'admin'
                          ? 'secondary'
                          : collaborator.permission === 'edit'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ mr: 1, minWidth: 100 }}>
                    <Select
                      value={collaborator.permission}
                      onChange={(e) => 
                        handlePermissionChange(
                          collaborator.email,
                          e.target.value as Permission
                        )
                      }
                    >
                      <MenuItem value="view">Can view</MenuItem>
                      <MenuItem value="edit">Can edit</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveCollaborator(collaborator.email)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(closeModal())}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal; 