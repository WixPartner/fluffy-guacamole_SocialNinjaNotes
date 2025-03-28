import { Box, Typography, IconButton, Menu, MenuItem, useTheme, TextField } from '@mui/material';
import {
  Message01Icon,
  Edit01Icon,
  Delete01Icon,
  Copy01Icon,
  Link01Icon,
  Move01Icon
} from 'hugeicons-react';
import { useState, useEffect } from 'react';
import { Block } from '../../api/pages';

interface Heading2BlockProps {
  block: Block & { type: 'heading2' };
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const Heading2Block = ({ block, onUpdate, onDelete }: Heading2BlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const theme = useTheme();

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX,
            mouseY: event.clientY,
          }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    handleCloseContextMenu();
    onDelete(block.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setContent(block.content);
      setIsEditing(false);
      return;
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== block.content) {
      onUpdate(block.id, content);
    }
  };

  if (isEditing) {
    return (
      <TextField
        fullWidth
        multiline
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        variant="standard"
        placeholder="Heading 2"
        sx={{
          '& .MuiInputBase-root': {
            fontSize: '1.3rem',
            fontWeight: 600,
            lineHeight: 1.3,
            padding: '8px 12px',
            mb: 1.5,
            '&:before, &:after': {
              display: 'none'
            }
          }
        }}
      />
    );
  }

  return (
    <>
      <Box
        onClick={() => setIsEditing(true)}
        onContextMenu={handleContextMenu}
        sx={{
          p: '8px 12px',
          cursor: 'text',
          minHeight: '2.5rem',
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
        <Typography 
          sx={{ 
            width: '100%', 
            whiteSpace: 'pre-wrap',
            fontSize: '1.3rem',
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 1.5,
            mt: 0
          }}
        >
          {content || (
            <Typography color="text.secondary" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
              Heading 2
            </Typography>
          )}
        </Typography>
      </Box>

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        slotProps={{
          root: {
            'aria-hidden': undefined
          },
          paper: {
            sx: {
              borderRadius: '12px',
              boxShadow: '0 0 0 1px rgba(15, 15, 15, 0.05), 0 3px 6px rgba(15, 15, 15, 0.1), 0 9px 24px rgba(15, 15, 15, 0.2)',
              minWidth: 260,
              maxWidth: 320,
              bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#2f3437',
              color: theme.palette.mode === 'light' ? '#37352f' : '#ffffff',
              overflow: 'hidden',
              p: 0.5,
              '& .MuiMenuItem-root': {
                py: 0.75,
                px: 1.5,
                gap: 1.5,
                fontSize: '14px',
                color: 'inherit',
                borderRadius: '8px',
                mx: 0.5,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
                }
              }
            }
          }
        }}
      >
        <MenuItem>
          <Message01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Comment</Box>
        </MenuItem>
        <MenuItem>
          <Edit01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Suggest edits</Box>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Delete</Box>
        </MenuItem>
        <MenuItem>
          <Copy01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Duplicate</Box>
        </MenuItem>
        <MenuItem>
          <Link01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Copy link to block</Box>
        </MenuItem>
        <MenuItem>
          <Move01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Move to</Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Heading2Block; 