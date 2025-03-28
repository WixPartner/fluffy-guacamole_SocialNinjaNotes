import React, { useState, useRef } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, useTheme, Select, FormControl } from '@mui/material';
import {
  Message01Icon,
  Edit01Icon,
  Delete01Icon,
  Copy01Icon,
  Link01Icon,
  Move01Icon,
  CodeIcon,
  ArrowDown01Icon,
  ArrowUp01Icon
} from 'hugeicons-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Block } from '../../api/pages';

// Import commonly used languages
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby';
import swift from 'react-syntax-highlighter/dist/esm/languages/hljs/swift';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'xml', label: 'XML/HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
];

interface CodeBlockProps {
  block: Block & { type: 'code' };
  onUpdate: (id: string, content: string, language?: string) => void;
  onDelete: (id: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ block, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [language, setLanguage] = useState(block.language || 'javascript');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const theme = useTheme();
  const editorRef = useRef<HTMLPreElement>(null);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content);
    handleCloseContextMenu();
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

    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textArea = e.target as HTMLTextAreaElement;
      const start = textArea.selectionStart || 0;
      const end = textArea.selectionEnd || 0;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      // Set cursor position after indentation
      requestAnimationFrame(() => {
        if (editorRef.current) {
          const range = document.createRange();
          const sel = window.getSelection();
          range.setStart(editorRef.current.firstChild || editorRef.current, start + 2);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      });
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    const newContent = editorRef.current?.innerText || '';
    if (newContent !== content) {
      setContent(newContent);
      onUpdate(block.id, newContent, language);
    }
    setIsEditing(false);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onUpdate(block.id, content, newLanguage);
  };

  if (isEditing) {
    return (
      <Box
        sx={{
          position: 'relative',
          my: 1
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: '#1E1E1E',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            px: 2,
            py: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon style={{ width: 16, height: 16, color: '#D4D4D4' }} />
            <Select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: '24px',
                minWidth: 100,
                color: '#D4D4D4',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                '.MuiSelect-select': { 
                  py: 0,
                  pl: 1,
                  pr: '24px !important',
                },
                '.MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& .MuiSvgIcon-root': {
                  color: '#D4D4D4'
                }
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 0 0 1px rgba(15, 15, 15, 0.05), 0 3px 6px rgba(15, 15, 15, 0.1), 0 9px 24px rgba(15, 15, 15, 0.2)',
                      minWidth: 260,
                      maxWidth: 320,
                      bgcolor: '#1E1E1E',
                      color: '#D4D4D4',
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
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }
                    }
                  }
                }
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              handleBlur();
            }}
            sx={{ 
              color: '#D4D4D4',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Edit01Icon style={{ width: 16, height: 16 }} />
          </IconButton>
        </Box>

        <Box
          component="pre"
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          sx={{
            margin: 0,
            padding: 2,
            outline: 'none',
            backgroundColor: '#1E1E1E',
            color: '#D4D4D4',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            overflowX: 'auto',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            minHeight: '100px',
            maxHeight: '500px',
            overflowY: 'auto',
            msOverflowStyle: 'none', /* Hide scrollbar for IE and Edge */
            scrollbarWidth: 'none',   /* Hide scrollbar for Firefox */
            '&::-webkit-scrollbar': { /* Hide scrollbar for Chrome, Safari and Opera */
              display: 'none'
            },
            '&:focus': {
              boxShadow: 'none',
              outline: '2px solid #0078d4',
              outlineOffset: -2
            }
          }}
        >
          {content}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      sx={{
        position: 'relative',
        my: 1,
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#1E1E1E',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          px: 2,
          py: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon style={{ width: 16, height: 16, color: '#D4D4D4' }} />
          <Typography
            variant="caption"
            sx={{
              color: '#D4D4D4',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            {SUPPORTED_LANGUAGES.find(lang => lang.value === language)?.label || 'JavaScript'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode();
            }}
            sx={{ 
              color: '#D4D4D4',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Copy01Icon style={{ width: 16, height: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            sx={{ 
              color: '#D4D4D4',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {isCollapsed ? <ArrowDown01Icon style={{ width: 16, height: 16 }} /> : <ArrowUp01Icon style={{ width: 16, height: 16 }} />}
          </IconButton>
        </Box>
      </Box>
      
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          maxHeight: isCollapsed ? '100px' : '2000px',
          backgroundColor: '#1E1E1E',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          '&::after': isCollapsed ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50px',
            background: 'linear-gradient(transparent, #1E1E1E)',
            pointerEvents: 'none'
          } : {}
        }}
      >
        <SyntaxHighlighter
          language={language}
          style={vs2015}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.9rem',
          }}
        >
          {content}
        </SyntaxHighlighter>
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
        <MenuItem onClick={() => { setIsEditing(true); handleCloseContextMenu(); }}>
          <Edit01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Edit</Box>
        </MenuItem>
        <MenuItem onClick={handleCopyCode}>
          <Copy01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Copy code</Box>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Delete</Box>
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
    </Box>
  );
};

export default CodeBlock; 