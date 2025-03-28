import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
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
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateWorkspaceMembers } from '../../store/slices/workspaceSlice';
import { closeModal } from '../../store/slices/uiSlice';

type Role = 'member' | 'admin' | 'owner';

interface Member {
  userId: string;
  email: string;
  role: Role;
}

const MembersModal = () => {
  const dispatch = useAppDispatch();
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const { user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [members, setMembers] = useState<Member[]>(
    currentWorkspace?.members || []
  );

  const handleAddMember = () => {
    if (email && !members.find(m => m.email === email)) {
      const newMember: Member = {
        userId: '', // Will be set by the backend
        email,
        role
      };
      setMembers([...members, newMember]);
      setEmail('');
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleRoleChange = (email: string, newRole: Role) => {
    setMembers(members.map(m => 
      m.email === email ? { ...m, role: newRole } : m
    ));
  };

  const handleSave = async () => {
    if (currentWorkspace) {
      await dispatch(updateWorkspaceMembers({
        workspaceId: currentWorkspace._id,
        members
      }));
      dispatch(closeModal());
    }
  };

  const isOwner = user?._id === currentWorkspace?.owner;

  if (!currentWorkspace) return null;

  return (
    <Dialog open onClose={() => dispatch(closeModal())} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Members</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {isOwner && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Add Member
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
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  startIcon={<PersonAddIcon />}
                >
                  Add
                </Button>
              </Box>
            </>
          )}

          <List>
            {members.map((member) => (
              <ListItem key={member.email} divider>
                <ListItemText
                  primary={member.email}
                  secondary={
                    <Chip
                      size="small"
                      label={member.role}
                      color={
                        member.role === 'owner'
                          ? 'secondary'
                          : member.role === 'admin'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  }
                />
                {isOwner && member.role !== 'owner' && (
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ mr: 1, minWidth: 100 }}>
                      <Select
                        value={member.role}
                        onChange={(e) => 
                          handleRoleChange(
                            member.email,
                            e.target.value as Role
                          )
                        }
                      >
                        <MenuItem value="member">Member</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMember(member.email)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(closeModal())}>Cancel</Button>
        {isOwner && (
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MembersModal; 