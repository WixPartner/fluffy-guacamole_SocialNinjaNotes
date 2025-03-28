import { Box, Typography, IconButton, Menu, MenuItem, Tooltip, Divider, useTheme, TextField } from '@mui/material';
import {
  Message01Icon,
  Edit01Icon,
  Delete01Icon,
  Copy01Icon,
  TextIcon,
  ArrowRight01Icon,
  Link01Icon,
  Move01Icon,
  ColorsIcon,
  ListViewIcon
} from 'hugeicons-react';
import { useState, useEffect } from 'react';
import { Block } from '../../api/pages';

interface TextBlockProps {
  block: Block & { type: 'text' };
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const TextBlock = ({ block, onUpdate, onDelete }: TextBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [turnIntoAnchor, setTurnIntoAnchor] = useState<null | HTMLElement>(null);
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

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleFormat('**');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('*');
          break;
        case '`':
          e.preventDefault();
          handleFormat('`');
          break;
        case '-':
          e.preventDefault();
          handleFormat('~~');
          break;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart;
      const textBeforeCursor = content.slice(0, cursorPosition);
      const textAfterCursor = content.slice(cursorPosition);
      
      if (e.shiftKey) {
        if (textBeforeCursor.endsWith('  ')) {
          setContent(textBeforeCursor.slice(0, -2) + textAfterCursor);
          setTimeout(() => {
            (e.target as HTMLTextAreaElement).setSelectionRange(
              cursorPosition - 2,
              cursorPosition - 2
            );
          });
        }
      } else {
        setContent(textBeforeCursor + '  ' + textAfterCursor);
        setTimeout(() => {
          (e.target as HTMLTextAreaElement).setSelectionRange(
            cursorPosition + 2,
            cursorPosition + 2
          );
        });
      }
    }
  };

  const handleFormat = (marker: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);

    const isFormatted = 
      content.slice(start - marker.length, start) === marker && 
      content.slice(end, end + marker.length) === marker;

    if (isFormatted) {
      const newContent = 
        content.slice(0, start - marker.length) + 
        selectedText +
        content.slice(end + marker.length);
      setContent(newContent);
      setTimeout(() => {
        textarea.setSelectionRange(
          start - marker.length,
          end - marker.length
        );
      });
    } else {
      const newContent = 
        content.slice(0, start) + 
        marker + selectedText + marker +
        content.slice(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.setSelectionRange(
          start + marker.length,
          end + marker.length
        );
      });
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== block.content) {
      const marker = block.content.match(/^([#•>]|#{2,3}|\d+\.) /)?.[0] || '';
      const newContent = marker + content.replace(/^([#•>]|#{2,3}|\d+\.) /, '');
      onUpdate(block.id, newContent);
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
        sx={{
          '& .MuiInputBase-root': {
            fontSize: content.startsWith('# ') ? '1.5rem' :
                     content.startsWith('## ') ? '1.3rem' :
                     content.startsWith('### ') ? '1.15rem' :
                     '1rem',
            lineHeight: '1.5',
            padding: '8px 12px',
            fontFamily: content.match(/`.*`/) ? 'monospace' : 'inherit',
            ...(content.startsWith('• ') && { 
              paddingLeft: '36px',
              '&::before': {
                content: '"•"',
                position: 'absolute',
                left: '12px',
                color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                fontSize: '1.2em',
                lineHeight: '1.2'
              }
            }),
            ...(content.match(/^\d+\. /) && { 
              paddingLeft: '44px',
              '&::before': {
                content: `"${content.match(/^\d+/)?.[0] || '1'}."`,
                position: 'absolute',
                left: '8px',
                color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                fontWeight: 500
              }
            }),
            ...(content.startsWith('> ') && { 
              paddingLeft: '36px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderLeft: '3px solid',
              borderColor: theme.palette.mode === 'light' ? 'primary.light' : 'primary.dark',
              bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
              fontStyle: 'italic',
              color: 'text.secondary',
              borderRadius: '2px'
            }),
            '&:before, &:after': {
              display: 'none'
            },
            '& .MuiInputBase-input': {
              ...(content.match(/\*\*.*\*\*/) && {
                fontWeight: 600,
                color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.87)'
              }),
              ...(content.match(/\*[^*].*[^*]\*/) && {
                fontStyle: 'italic',
                color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.78)'
              }),
              ...(content.match(/~~.*~~/) && {
                textDecoration: 'line-through',
                color: 'text.disabled'
              }),
              ...(content.match(/`.*`/) && {
                fontFamily: 'monospace',
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.9em',
                color: theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light'
              })
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
          alignItems: 'center'
        }}
      >
        {content ? (
          <Typography 
            sx={{ 
              width: '100%', 
              whiteSpace: 'pre-wrap',
              ...(content.startsWith('# ') && {
                fontSize: '1.5rem',
                fontWeight: 600,
                lineHeight: 1.3,
                mb: 2
              }),
              ...(content.startsWith('## ') && {
                fontSize: '1.3rem',
                fontWeight: 600,
                lineHeight: 1.3,
                mb: 1.5
              }),
              ...(content.startsWith('### ') && {
                fontSize: '1.15rem',
                fontWeight: 600,
                lineHeight: 1.3,
                mb: 1
              }),
              ...(content.startsWith('• ') && {
                pl: 3,
                position: 'relative',
                '&::before': {
                  content: '"•"',
                  position: 'absolute',
                  left: '12px',
                  color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                  fontSize: '1.2em',
                  lineHeight: '1.2'
                }
              }),
              ...(content.match(/^\d+\. /) && {
                pl: 4,
                position: 'relative',
                '&::before': {
                  content: `"${content.match(/^\d+/)?.[0] || '1'}."`,
                  position: 'absolute',
                  left: '8px',
                  color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                  fontWeight: 500
                }
              }),
              ...(content.startsWith('> ') && {
                pl: 3,
                py: 1,
                borderLeft: '3px solid',
                borderColor: theme.palette.mode === 'light' ? 'primary.light' : 'primary.dark',
                bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                fontStyle: 'italic',
                color: 'text.secondary',
                borderRadius: '2px'
              }),
              ...(content.match(/\*\*.*\*\*/) && {
                '& .bold': {
                  fontWeight: 600,
                  color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.87)'
                }
              }),
              ...(content.match(/\*[^*].*[^*]\*/) && {
                '& .italic': {
                  fontStyle: 'italic',
                  color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.78)'
                }
              }),
              ...(content.match(/~~.*~~/) && {
                '& .strikethrough': {
                  textDecoration: 'line-through',
                  color: 'text.disabled'
                }
              }),
              ...(content.match(/`.*`/) && {
                '& .code': {
                  fontFamily: 'monospace',
                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  color: theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light'
                }
              })
            }}
          >
            {(() => {
              let text = content;
              // Remove block-level formatting
              text = text.replace(/^([#•>]|#{2,3}|\d+\.) /, '');
              
              // Apply inline formatting
              text = text
                .replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>')
                .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
                .replace(/~~(.*?)~~/g, '<span class="strikethrough">$1</span>')
                .replace(/`(.*?)`/g, '<span class="code">$1</span>');
              
              return <span dangerouslySetInnerHTML={{ __html: text }} />;
            })()}
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Press '/' for commands
          </Typography>
        )}
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
              },
              '& .MuiDivider-root': {
                my: 0.5,
                mx: 1,
                borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'
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
        <Divider />
        <MenuItem onClick={handleDelete}>
          <Delete01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Delete</Box>
        </MenuItem>
        <MenuItem>
          <Copy01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Duplicate</Box>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={(event) => {
            event.stopPropagation();
            setTurnIntoAnchor(event.currentTarget);
          }}
          sx={{ 
            '& .MuiBox-root': { 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5 
            }
          }}
        >
          <TextIcon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Turn into</Box>
          <ArrowRight01Icon size={14} style={{ opacity: 0.5 }} />
        </MenuItem>
        <Menu
          anchorEl={turnIntoAnchor}
          open={Boolean(turnIntoAnchor)}
          onClose={() => setTurnIntoAnchor(null)}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left'
          }}
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
                },
                '& .MuiDivider-root': {
                  my: 0.5,
                  mx: 1,
                  borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'
                }
              }
            }
          }}
        >
          <MenuItem onClick={() => {
            onUpdate(block.id, `# ${content}`);
            setContent(`# ${content}`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', opacity: 0.8 }}>H1</Typography>
              <Typography>Heading 1</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            onUpdate(block.id, `## ${content}`);
            setContent(`## ${content}`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '0.925rem', opacity: 0.8 }}>H2</Typography>
              <Typography>Heading 2</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            onUpdate(block.id, `### ${content}`);
            setContent(`### ${content}`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>H3</Typography>
              <Typography>Heading 3</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            onUpdate(block.id, `**${content}**`);
            setContent(`**${content}**`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', opacity: 0.8 }}>B</Typography>
              <Typography>Bold</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            onUpdate(block.id, `*${content}*`);
            setContent(`*${content}*`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ fontStyle: 'italic', opacity: 0.8 }}>I</Typography>
              <Typography>Italic</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            onUpdate(block.id, `~~${content}~~`);
            setContent(`~~${content}~~`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ textDecoration: 'line-through', opacity: 0.8 }}>S</Typography>
              <Typography>Strikethrough</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            onUpdate(block.id, `\`${content}\``);
            setContent(`\`${content}\``);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ fontFamily: 'monospace', opacity: 0.8 }}>{'<>'}</Typography>
              <Typography>Code</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            onUpdate(block.id, `• ${content}`);
            setContent(`• ${content}`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ opacity: 0.8 }}>•</Typography>
              <Typography>Bullet list</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            onUpdate(block.id, `1. ${content}`);
            setContent(`1. ${content}`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ opacity: 0.8 }}>1.</Typography>
              <Typography>Numbered list</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            onUpdate(block.id, `> ${content}`);
            setContent(`> ${content}`);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ opacity: 0.8 }}>❝</Typography>
              <Typography>Quote</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            const newContent = content.replace(/^[#•>1.\s]+/, '');
            onUpdate(block.id, newContent);
            setContent(newContent);
            setTurnIntoAnchor(null);
            handleCloseContextMenu();
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Typography sx={{ opacity: 0.8 }}>Aa</Typography>
              <Typography>Plain text</Typography>
            </Box>
          </MenuItem>
        </Menu>
        <MenuItem>
          <Link01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Copy link to block</Box>
        </MenuItem>
        <MenuItem>
          <Move01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Move to</Box>
        </MenuItem>
        <MenuItem>
          <ColorsIcon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Color</Box>
          <ArrowRight01Icon size={14} style={{ opacity: 0.5 }} />
        </MenuItem>
        <MenuItem>
          <ListViewIcon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>List format</Box>
          <ArrowRight01Icon size={14} style={{ opacity: 0.5 }} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default TextBlock; 