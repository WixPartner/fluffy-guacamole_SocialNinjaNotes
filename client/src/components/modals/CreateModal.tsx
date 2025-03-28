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
  Typography
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createDocument } from '../../store/slices/documentSlice';
import { createWorkspace } from '../../store/slices/workspaceSlice';
import { closeModal } from '../../store/slices/uiSlice';

type CreateType = 'document' | 'workspace';

const CreateModal = () => {
  const dispatch = useAppDispatch();
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const [type, setType] = useState<CreateType>('document');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'document' && currentWorkspace) {
      await dispatch(createDocument({
        title: name,
        description,
        workspaceId: currentWorkspace._id
      }));
    } else if (type === 'workspace') {
      await dispatch(createWorkspace({
        name,
        description
      }));
    }

    dispatch(closeModal());
  };

  return (
    <Dialog open onClose={() => dispatch(closeModal())} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Create New {type.charAt(0).toUpperCase() + type.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={(e) => setType(e.target.value as CreateType)}
              >
                <MenuItem value="document">Document</MenuItem>
                <MenuItem value="workspace">Workspace</MenuItem>
              </Select>
            </FormControl>

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
            />
          </Box>

          {type === 'document' && !currentWorkspace && (
            <Typography color="error" variant="body2">
              Please select a workspace first to create a document.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch(closeModal())}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={type === 'document' && !currentWorkspace}
          >
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateModal; 