import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import {
  Description as DocumentIcon,
  Folder as FolderIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchWorkspaceById } from '../../store/slices/workspaceSlice';
import { fetchWorkspaceDocuments } from '../../store/slices/documentSlice';
import { openModal } from '../../store/slices/uiSlice';

const Workspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const { documents } = useAppSelector((state) => state.document);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceById(workspaceId));
      dispatch(fetchWorkspaceDocuments(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCreateDocument = () => {
    dispatch(openModal({
      type: 'createDocument',
      data: { workspaceId }
    }));
  };

  const handleCreateFolder = () => {
    dispatch(openModal({
      type: 'createDocument',
      data: { workspaceId, type: 'folder' }
    }));
  };

  const handleManageMembers = () => {
    dispatch(openModal({
      type: 'manageMembers',
      data: { workspace: currentWorkspace }
    }));
    handleMenuClose();
  };

  const handleWorkspaceSettings = () => {
    dispatch(openModal({
      type: 'workspaceSettings',
      data: { workspace: currentWorkspace }
    }));
    handleMenuClose();
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            {currentWorkspace.name}
          </Typography>
          {currentWorkspace.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {currentWorkspace.description}
            </Typography>
          )}
        </Box>
        <Box>
          <Tooltip title="Create Document">
            <IconButton
              color="primary"
              onClick={handleCreateDocument}
              sx={{ mr: 1 }}
            >
              <AddIcon />
              <DocumentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create Folder">
            <IconButton
              color="primary"
              onClick={handleCreateFolder}
              sx={{ mr: 1 }}
            >
              <AddIcon />
              <FolderIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleManageMembers}>
              <ListItemIcon>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Manage Members</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleWorkspaceSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Workspace Settings</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper sx={{ mt: 2 }}>
        <List>
          {documents.map((doc) => (
            <ListItem
              button
              key={doc._id}
              onClick={() => navigate(`/document/${doc._id}`)}
            >
              <ListItemIcon>
                {doc.type === 'folder' ? <FolderIcon /> : <DocumentIcon />}
              </ListItemIcon>
              <ListItemText
                primary={doc.title}
                secondary={`Last modified: ${new Date(doc.lastModified).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end">
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {documents.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No documents yet"
                secondary="Create a new document or folder to get started"
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Workspace; 