import { Box, Typography, IconButton, Menu, MenuItem, useTheme, CircularProgress } from '@mui/material';
import {
  DocumentAttachmentIcon,
  Edit01Icon,
  Delete01Icon,
  Copy01Icon,
  Move01Icon,
  Download01Icon,
  File01Icon
} from 'hugeicons-react';
import { useState } from 'react';
import { Block } from '../../api/pages';
import { api } from '../../api/axios';

interface FileBlockProps {
  block: Block & { type: 'file' };
  onUpdate: (id: string, content: string, fileName?: string, fileSize?: number, mimeType?: string, fileKey?: string, downloadUrl?: string) => void;
  onDelete: (id: string) => void;
}

const FileBlock = ({ block, onUpdate, onDelete }: FileBlockProps) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const theme = useTheme();

  // Add debug logging
  console.log('FileBlock render:', {
    blockId: block.id,
    fileName: block.fileName,
    fileSize: block.fileSize,
    mimeType: block.mimeType,
    fileKey: block.fileKey,
    downloadUrl: block.downloadUrl
  });

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFriendlyFileType = (mimeType: string): string => {
    const mimeTypeMap: { [key: string]: string } = {
      // Documents
      'application/pdf': 'PDF',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/vnd.ms-powerpoint': 'PowerPoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
      // Text
      'text/plain': 'Text File',
      'text/csv': 'CSV File',
      'text/markdown': 'Markdown File',
      // Code
      'application/json': 'JSON File',
      'text/javascript': 'JavaScript File',
      'text/typescript': 'TypeScript File',
      'text/html': 'HTML File',
      'text/css': 'CSS File',
      // Images
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/svg+xml': 'SVG Image',
      'image/webp': 'WebP Image',
    };

    return mimeTypeMap[mimeType] || 'File';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'documents');

      // Upload file
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { key, url, size, mimeType } = response.data;
      
      // Add debug logging
      console.log('File upload response:', { key, url, size, mimeType });

      // Update block with file information
      onUpdate(
        block.id,
        file.name, // Use filename as content for display
        file.name, // fileName
        size, // fileSize
        mimeType, // mimeType
        key, // fileKey
        url // downloadUrl
      );
      
      // Add debug logging
      console.log('Block update called with:', {
        blockId: block.id,
        content: file.name,
        fileName: file.name,
        fileSize: size,
        mimeType: mimeType,
        fileKey: key,
        downloadUrl: url
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      // TODO: Show error notification
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (block.fileKey) {
      try {
        // Extract just the filename from the full path
        const encodedKey = encodeURIComponent(block.fileKey);
        
        // Create XMLHttpRequest to handle the download
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${api.defaults.baseURL}/files/${encodedKey}`, true);
        xhr.responseType = 'blob';
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

        xhr.onload = function() {
          if (this.status === 200) {
            // Create blob URL
            const blob = new Blob([this.response], { type: this.response.type });
            const url = window.URL.createObjectURL(blob);
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.setAttribute('download', block.fileName || 'download');
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          } else {
            console.error('Error downloading file:', this.statusText);
          }
        };

        xhr.onerror = function() {
          console.error('Error downloading file');
        };

        xhr.send();
      } catch (error) {
        console.error('Error downloading file:', error);
        // TODO: Show error notification
      }
    }
  };

  return (
    <Box
      onContextMenu={handleContextMenu}
      sx={{
        position: 'relative',
        '&:hover': {
          '& .block-actions': {
            opacity: 1,
          },
        },
      }}
    >
      {block.fileKey ? (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <DocumentAttachmentIcon size={24} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{block.fileName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {block.fileSize && formatFileSize(block.fileSize)} • {block.mimeType && getFriendlyFileType(block.mimeType)}
            </Typography>
          </Box>
          <Box
            className="block-actions"
            sx={{
              opacity: 0,
              transition: 'opacity 0.2s',
              display: 'flex',
              gap: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => document.getElementById(`file-upload-${block.id}`)?.click()}
              sx={{ color: 'text.secondary' }}
            >
              <Edit01Icon size={18} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDownload}
              sx={{ color: 'text.secondary' }}
            >
              <Download01Icon size={18} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: 'text.secondary' }}
            >
              <Delete01Icon size={18} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={() => document.getElementById(`file-upload-${block.id}`)?.click()}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            },
          }}
        >
          {isUploading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <File01Icon size={24} />
              <Typography variant="body2" color="text.secondary">
                Click to upload a file
              </Typography>
            </>
          )}
        </Box>
      )}

      <input
        type="file"
        id={`file-upload-${block.id}`}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept={[
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
          'text/markdown',
          'application/json',
          'text/javascript',
          'text/typescript',
          'text/html',
          'text/css'
        ].join(',')}
      />

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleDelete} dense>
          <Delete01Icon size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu} dense>
          <Copy01Icon size={18} style={{ marginRight: 8 }} />
          Copy
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu} dense>
          <Move01Icon size={18} style={{ marginRight: 8 }} />
          Move
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FileBlock; 