import { Box, Typography, IconButton, Menu, MenuItem, useTheme, TextField, Collapse } from '@mui/material';
import {
  Message01Icon,
  Edit01Icon,
  Delete01Icon,
  Copy01Icon,
  Link01Icon,
  Move01Icon,
  ArrowRight01Icon,
  Add01Icon
} from 'hugeicons-react';
import { useState, useEffect } from 'react';
import { Block } from '../../api/pages';
import TextBlock from './TextBlock';
import BulletListBlock from './BulletListBlock';
import NumberListBlock from './NumberListBlock';
import TodoListBlock from './TodoListBlock';
import Heading1Block from './Heading1Block';
import Heading2Block from './Heading2Block';
import Heading3Block from './Heading3Block';


interface ToggleListBlockProps {
  block: Block & { type: 'toggle-list' };
  onUpdate: (id: string, content: string, toggleContent?: Block[]) => void;
  onDelete: (id: string) => void;
}

const ToggleListBlock = ({ block, onUpdate, onDelete }: ToggleListBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toggleContent, setToggleContent] = useState<Block[]>(block.toggleContent || []);
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [addBlockAnchor, setAddBlockAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  useEffect(() => {
    setContent(block.content);
    setToggleContent(block.toggleContent || []);
  }, [block.content, block.toggleContent]);

  const handleContentUpdate = (blockId: string, newContent: string, checkedOrToggleContent?: boolean | Block[]) => {
    const updatedContent = toggleContent.map(b => {
      if (b.id !== blockId) return b;
      
      const updatedBlock = { ...b, content: newContent };
      if (Array.isArray(checkedOrToggleContent)) {
        updatedBlock.toggleContent = checkedOrToggleContent;
      } else if (typeof checkedOrToggleContent === 'boolean') {
        updatedBlock.checked = checkedOrToggleContent;
      }
      return updatedBlock;
    });
    
    setToggleContent(updatedContent);
    onUpdate(block.id, content, updatedContent);
  };

  const handleContentDelete = (blockId: string) => {
    const updatedContent = toggleContent.filter(b => b.id !== blockId);
    setToggleContent(updatedContent);
    onUpdate(block.id, content, updatedContent);
  };

  const handleAddBlock = (blockType: string) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: blockType as Block['type'],
      content: ''
    };
    const updatedContent = [...toggleContent, newBlock];
    setToggleContent(updatedContent);
    onUpdate(block.id, content, updatedContent);
    setAddBlockAnchor(null);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.toggle-content')) {
      return;
    }
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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Calculate index for numbered lists within toggle content
  const calculateNumberedListIndex = (currentBlock: Block): number => {
    let index = 1;
    for (const b of toggleContent) {
      if (b.id === currentBlock.id) break;
      if (b.type === 'number-list') index++;
    }
    return index;
  };

  if (isEditing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 1,
        p: '8px 12px',
        minHeight: '2.5rem'
      }}>
        <IconButton
          size="small"
          onClick={handleToggle}
          sx={{
            transform: isExpanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s ease',
            width: 28,
            height: 28,
            p: 0.5,
            mt: '2px'
          }}
        >
          <ArrowRight01Icon size={18} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            minHeight: '24px'
          }}>
            <TextField
              fullWidth
              multiline
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              variant="standard"
              placeholder="Toggle list"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  padding: 0,
                  '&:before, &:after': {
                    display: 'none'
                  }
                }
              }}
            />
          </Box>
          <Collapse in={isExpanded}>
            <Box 
              className="toggle-content"
              sx={{ 
                pl: 2, 
                ml: 1,
                mt: 1, 
                borderLeft: '2px solid', 
                borderColor: theme.palette.mode === 'light' ? 'rgba(55, 53, 47, 0.16)' : 'rgba(255, 255, 255, 0.13)',
                minHeight: 32
              }}
            >
              {toggleContent.map((block) => {
                switch (block.type) {
                  case 'text':
                    return (
                      <TextBlock
                        key={block.id}
                        block={block as Block & { type: 'text' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'bullet-list':
                    return (
                      <BulletListBlock
                        key={block.id}
                        block={block as Block & { type: 'bullet-list' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'number-list':
                    return (
                      <NumberListBlock
                        key={block.id}
                        block={block as Block & { type: 'number-list' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                        index={calculateNumberedListIndex(block)}
                        level={1}
                      />
                    );
                  case 'todo-list':
                    return (
                      <TodoListBlock
                        key={block.id}
                        block={block as Block & { type: 'todo-list' }}
                        onUpdate={(id, content, checked) => handleContentUpdate(id, content, checked)}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'toggle-list':
                    return (
                      <ToggleListBlock
                        key={block.id}
                        block={block as Block & { type: 'toggle-list' }}
                        onUpdate={(id, content, toggleContent) => handleContentUpdate(id, content, toggleContent)}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'heading1':
                    return (
                      <Heading1Block
                        key={block.id}
                        block={block as Block & { type: 'heading1' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'heading2':
                    return (
                      <Heading2Block
                        key={block.id}
                        block={block as Block & { type: 'heading2' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'heading3':
                    return (
                      <Heading3Block
                        key={block.id}
                        block={block as Block & { type: 'heading3' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  default:
                    return null;
                }
              })}
              <Box 
                onClick={(e) => {
                  e.stopPropagation();
                  setAddBlockAnchor(e.currentTarget);
                }}
                sx={{ 
                  p: '4px 8px',
                  cursor: 'pointer',
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' 
                      ? 'rgba(55, 53, 47, 0.08)' 
                      : 'rgba(255, 255, 255, 0.055)'
                  }
                }}
              >
                <Add01Icon size={16} />
                Add a block
              </Box>
              <Menu
                anchorEl={addBlockAnchor}
                open={Boolean(addBlockAnchor)}
                onClose={() => setAddBlockAnchor(null)}
                slotProps={{
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
                <MenuItem onClick={() => handleAddBlock('text')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>Aa</Typography>
                    <Typography>Text</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('heading1')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', opacity: 0.8 }}>H1</Typography>
                    <Typography>Heading 1</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('heading2')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '0.925rem', opacity: 0.8 }}>H2</Typography>
                    <Typography>Heading 2</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('heading3')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>H3</Typography>
                    <Typography>Heading 3</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('bullet-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>•</Typography>
                    <Typography>Bullet list</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('number-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>1.</Typography>
                    <Typography>Numbered list</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('todo-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>☐</Typography>
                    <Typography>To-do list</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('toggle-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>▸</Typography>
                    <Typography>Toggle list</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          </Collapse>
        </Box>
      </Box>
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
          alignItems: 'flex-start',
          gap: 1
        }}
      >
        <IconButton
          size="small"
          onClick={handleToggle}
          sx={{
            transform: isExpanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s ease',
            width: 28,
            height: 28,
            p: 0.5,
            mt: '2px'
          }}
        >
          <ArrowRight01Icon size={18} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            minHeight: '24px'
          }}>
            <Typography 
              sx={{ 
                width: '100%', 
                whiteSpace: 'pre-wrap'
              }}
            >
              {content || (
                <Typography color="text.secondary">
                  Toggle list
                </Typography>
              )}
            </Typography>
          </Box>
          <Collapse in={isExpanded}>
            <Box 
              className="toggle-content"
              sx={{ 
                pl: 2, 
                ml: 1,
                mt: 1, 
                borderLeft: '2px solid', 
                borderColor: theme.palette.mode === 'light' ? 'rgba(55, 53, 47, 0.16)' : 'rgba(255, 255, 255, 0.13)',
                minHeight: 32
              }}
            >
              {toggleContent.map((block) => {
                switch (block.type) {
                  case 'text':
                    return (
                      <TextBlock
                        key={block.id}
                        block={block as Block & { type: 'text' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'bullet-list':
                    return (
                      <BulletListBlock
                        key={block.id}
                        block={block as Block & { type: 'bullet-list' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'number-list':
                    return (
                      <NumberListBlock
                        key={block.id}
                        block={block as Block & { type: 'number-list' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                        index={calculateNumberedListIndex(block)}
                        level={1}
                      />
                    );
                  case 'todo-list':
                    return (
                      <TodoListBlock
                        key={block.id}
                        block={block as Block & { type: 'todo-list' }}
                        onUpdate={(id, content, checked) => handleContentUpdate(id, content, checked)}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'toggle-list':
                    return (
                      <ToggleListBlock
                        key={block.id}
                        block={block as Block & { type: 'toggle-list' }}
                        onUpdate={(id, content, toggleContent) => handleContentUpdate(id, content, toggleContent)}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'heading1':
                    return (
                      <Heading1Block
                        key={block.id}
                        block={block as Block & { type: 'heading1' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'heading2':
                    return (
                      <Heading2Block
                        key={block.id}
                        block={block as Block & { type: 'heading2' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  case 'heading3':
                    return (
                      <Heading3Block
                        key={block.id}
                        block={block as Block & { type: 'heading3' }}
                        onUpdate={handleContentUpdate}
                        onDelete={handleContentDelete}
                      />
                    );
                  default:
                    return null;
                }
              })}
              <Box 
                onClick={(e) => {
                  e.stopPropagation();
                  setAddBlockAnchor(e.currentTarget);
                }}
                sx={{ 
                  p: '4px 8px',
                  cursor: 'pointer',
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' 
                      ? 'rgba(55, 53, 47, 0.08)' 
                      : 'rgba(255, 255, 255, 0.055)'
                  }
                }}
              >
                <Add01Icon size={16} />
                Add a block
              </Box>
              <Menu
                anchorEl={addBlockAnchor}
                open={Boolean(addBlockAnchor)}
                onClose={() => setAddBlockAnchor(null)}
                slotProps={{
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
                <MenuItem onClick={() => handleAddBlock('text')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>Aa</Typography>
                    <Typography>Text</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('heading1')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', opacity: 0.8 }}>H1</Typography>
                    <Typography>Heading 1</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('heading2')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '0.925rem', opacity: 0.8 }}>H2</Typography>
                    <Typography>Heading 2</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('heading3')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>H3</Typography>
                    <Typography>Heading 3</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('bullet-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>•</Typography>
                    <Typography>Bullet list</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('number-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>1.</Typography>
                    <Typography>Numbered list</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('todo-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>☐</Typography>
                    <Typography>To-do list</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAddBlock('toggle-list')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography sx={{ opacity: 0.8 }}>▸</Typography>
                    <Typography>Toggle list</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          </Collapse>
        </Box>
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

export default ToggleListBlock; 