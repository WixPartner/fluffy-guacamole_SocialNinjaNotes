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

interface NumberListBlockProps {
  block: Block & { type: 'number-list' };
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  index: number;
  level?: number;
}

const NumberListBlock = ({ block, onUpdate, onDelete, index, level = 0 }: NumberListBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [isInitialFocus, setIsInitialFocus] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const theme = useTheme();

  // Get the numbering style based on the nesting level
  const getNumberStyle = (level: number, index: number): string => {
    switch (level % 3) {
      case 0: return `${index}.`; // 1. 2. 3.
      case 1: return `${String.fromCharCode(96 + index)}.`; // a. b. c.
      case 2: return `${index})`; // 1) 2) 3)
      default: return `${index}.`;
    }
  };

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    // If it's a new block with default content, enter edit mode automatically
    if (block.content === 'List item' && isInitialFocus) {
      setIsEditing(true);
      setIsInitialFocus(false);
    }
  }, [block.content, isInitialFocus]);

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

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Implement indentation logic
    }
  };

  const handleFocus = () => {
    if (content === 'List item') {
      setContent('');
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Only update if content has changed and is not empty
    if (content !== block.content) {
      // If content is empty, revert to default content
      const newContent = content.trim() === '' ? 'List item' : content;
      setContent(newContent);
      onUpdate(block.id, newContent);
    }
  };

  const numberStyle = getNumberStyle(level, index);
  const leftPadding = 20 + (level * 20); // Decreased from 28 to 20
  const commonStyles = {
    p: '4px 8px', // Decreased from '8px 12px'
    minHeight: '2rem', // Decreased from '2.5rem'
    cursor: 'text',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(55, 53, 47, 0.08)' 
        : 'rgba(255, 255, 255, 0.055)'
    }
  };

  if (isEditing) {
    return (
      <Box sx={commonStyles}>
        <TextField
          fullWidth
          multiline
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          variant="standard"
          placeholder="List item"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '1rem',
              lineHeight: 1.5,
              p: 0,
              position: 'relative',
              '&:before, &:after': {
                display: 'none'
              }
            },
            '& .MuiInputBase-input': {
              pl: `${leftPadding}px`,
              py: 0,
              '&::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 1
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <Typography 
                sx={{ 
                  position: 'absolute',
                  left: `${leftPadding - 16}px`, // Adjusted from -20 to -16
                  color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                  fontWeight: 500,
                  userSelect: 'none'
                }}
              >
                {numberStyle}
              </Typography>
            )
          }}
        />
      </Box>
    );
  }

  return (
    <>
      <Box
        onClick={() => setIsEditing(true)}
        onContextMenu={handleContextMenu}
        sx={commonStyles}
      >
        <Typography 
          sx={{ 
            width: '100%', 
            whiteSpace: 'pre-wrap',
            pl: `${leftPadding}px`,
            position: 'relative',
            lineHeight: 1.5,
            color: content ? 'text.primary' : 'text.secondary',
            '&::before': {
              content: `"${numberStyle}"`,
              position: 'absolute',
              left: `${leftPadding - 16}px`, // Adjusted from -20 to -16
              color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
              fontWeight: 500,
              userSelect: 'none'
            }
          }}
        >
          {content || 'List item'}
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

export default NumberListBlock; 