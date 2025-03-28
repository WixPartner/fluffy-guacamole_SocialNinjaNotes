import { Box, Typography, IconButton, Menu, MenuItem, useTheme, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  Delete01Icon,
  Copy01Icon,
  Link01Icon,
  Move01Icon,
  FunctionIcon
} from 'hugeicons-react';
import { useState, useEffect, useRef } from 'react';
import { Block } from '../../api/pages';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface EquationBlockProps {
  block: Block & { type: 'equation' };
  onUpdate: (id: string, content: string, mathMode?: 'inline' | 'display', latex?: string) => void;
  onDelete: (id: string) => void;
}

const EquationBlock = ({ block, onUpdate, onDelete }: EquationBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(block.latex || '');
  const [mathMode, setMathMode] = useState<'inline' | 'display'>(block.mathMode || 'display');
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const theme = useTheme();
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLatex(block.latex || '');
    setMathMode(block.mathMode || 'display');
  }, [block.latex, block.mathMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blockRef.current && !blockRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleLatexChange = (newLatex: string) => {
    setLatex(newLatex);
    try {
      // Test if LaTeX is valid
      katex.renderToString(newLatex, {
        throwOnError: true,
        displayMode: mathMode === 'display'
      });
      setError(null);
      onUpdate(block.id, '', mathMode, newLatex);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleMathModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'inline' | 'display') => {
    if (newMode !== null) {
      setMathMode(newMode);
      onUpdate(block.id, '', newMode, latex);
    }
  };

  const renderEquation = () => {
    if (!latex) return null;
    try {
      const html = katex.renderToString(latex, {
        throwOnError: true,
        displayMode: mathMode === 'display'
      });
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err) {
      return <Typography color="error">{(err as Error).message}</Typography>;
    }
  };

  if (isEditing) {
    return (
      <Box
        ref={blockRef}
        sx={{
          position: 'relative',
          my: 1
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ToggleButtonGroup
            value={mathMode}
            exclusive
            onChange={handleMathModeChange}
            size="small"
          >
            <ToggleButton value="inline">
              Inline
            </ToggleButton>
            <ToggleButton value="display">
              Display
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            fullWidth
            multiline
            value={latex}
            onChange={(e) => handleLatexChange(e.target.value)}
            placeholder="Enter LaTeX equation..."
            error={!!error}
            helperText={error}
            autoFocus
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
              },
            }}
          />

          {latex && (
            <Box sx={{ mt: 1 }}>
              {renderEquation()}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        onContextMenu={handleContextMenu}
        onClick={() => setIsEditing(true)}
        sx={{
          position: 'relative',
          my: mathMode === 'display' ? 2 : 0,
          cursor: 'pointer'
        }}
      >
        {renderEquation()}
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
        <MenuItem onClick={handleDelete}>
          <Delete01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Delete</Box>
        </MenuItem>
        <MenuItem onClick={() => {
          navigator.clipboard.writeText(latex);
          handleCloseContextMenu();
        }}>
          <Copy01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Copy LaTeX</Box>
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

export default EquationBlock; 