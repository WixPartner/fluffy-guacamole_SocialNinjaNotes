import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Chip,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDocumentById, updateDocument } from '../../store/slices/documentSlice';
import { openModal } from '../../store/slices/uiSlice';
import socketService from '../../services/socket';

const Document = () => {
  const { documentId } = useParams();
  const dispatch = useAppDispatch();
  const { currentDocument, isLoading } = useAppSelector((state) => state.document);
  const { user } = useAppSelector((state) => state.auth);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (documentId) {
      dispatch(fetchDocumentById(documentId));
    }
  }, [dispatch, documentId]);

  useEffect(() => {
    if (currentDocument?.content) {
      const contentState = convertFromRaw(currentDocument.content);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [currentDocument]);

  useEffect(() => {
    if (documentId && user) {
      socketService.joinDocument(documentId);

      const handleDocumentEvent = (type: string, data: any) => {
        switch (type) {
          case 'user_joined':
          case 'user_left':
            setActiveUsers(data.activeUsers);
            break;
          case 'document_updated':
            if (data.userId !== user._id) {
              const contentState = convertFromRaw(data.content);
              setEditorState(EditorState.createWithContent(contentState));
            }
            break;
        }
      };

      socketService.addDocumentListener(documentId, handleDocumentEvent);

      return () => {
        socketService.leaveDocument(documentId);
        socketService.removeDocumentListener(documentId, handleDocumentEvent);
      };
    }
  }, [documentId, user]);

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const content = convertToRaw(newEditorState.getCurrentContent());
    
    // Debounced save
    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      if (documentId) {
        dispatch(updateDocument({
          documentId,
          data: { content }
        }));
        socketService.updateDocument({
          documentId,
          content,
          version: (currentDocument?.version || 0) + 1
        });
      }
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleShare = () => {
    dispatch(openModal({
      type: 'shareDocument',
      data: { document: currentDocument }
    }));
    handleMenuClose();
  };

  const handleHistory = () => {
    dispatch(openModal({
      type: 'documentHistory',
      data: { document: currentDocument }
    }));
    handleMenuClose();
  };

  const handleSettings = () => {
    dispatch(openModal({
      type: 'documentSettings',
      data: { document: currentDocument }
    }));
    handleMenuClose();
  };

  if (!currentDocument) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            {currentDocument.title}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AvatarGroup max={4}>
              {activeUsers.map((userId) => (
                <Tooltip key={userId} title={userId === user?._id ? 'You' : 'Collaborator'}>
                  <Avatar src={`/api/users/${userId}/avatar`} />
                </Tooltip>
              ))}
            </AvatarGroup>
            {isSaving ? (
              <Chip
                size="small"
                label="Saving..."
                icon={<SaveIcon />}
              />
            ) : (
              <Chip
                size="small"
                label="Saved"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Box>
          <IconButton onClick={handleShare} sx={{ mr: 1 }}>
            <ShareIcon />
          </IconButton>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleHistory}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Version History</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Document Settings</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper sx={{ p: 2, minHeight: '500px' }}>
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          placeholder="Start typing..."
        />
      </Paper>
    </Box>
  );
};

export default Document; 