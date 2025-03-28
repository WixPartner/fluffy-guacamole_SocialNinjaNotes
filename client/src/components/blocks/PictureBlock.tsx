import { Box, IconButton, Menu, MenuItem, Typography, useTheme, TextField, Dialog, Tooltip, Fade, Skeleton, CircularProgress, Paper, Button } from '@mui/material';
import {
  Image01Icon,
  Edit01Icon,
  Delete01Icon,
  Copy01Icon,
  Move01Icon,
  ZoomIcon,
  TextAlignJustifyLeftIcon,
  Download01Icon,
  Link01Icon,
  Layout04Icon,
  LayoutBottomIcon,
  Upload01Icon,
  XVariableIcon,
  Cone01Icon,
} from 'hugeicons-react';
import { useState, useEffect, useRef } from 'react';
import { Block } from '../../api/pages';

interface PictureBlockProps {
  block: Block & { type: 'picture' };
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const PictureBlock = ({ block, onUpdate, onDelete }: PictureBlockProps) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [showCaption, setShowCaption] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    // Extract caption from content if it exists in format "imageData|||caption"
    if (block.content && block.content.includes('|||')) {
      const parts = block.content.split('|||');
      setCaption(parts[1] || '');
      setShowCaption(!!parts[1]);
    } else {
      setCaption('');
      setShowCaption(false);
    }
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Preserve caption if exists
        if (showCaption && caption) {
          onUpdate(block.id, `${base64String}|||${caption}`);
        } else {
          onUpdate(block.id, base64String);
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
    if (block.content) {
      const imagePart = block.content.split('|||')[0];
      onUpdate(block.id, `${imagePart}|||${newCaption}`);
    }
  };

  const toggleCaption = () => {
    setShowCaption(!showCaption);
    if (!showCaption) {
      // Adding caption mode
      if (block.content) {
        const imagePart = block.content.split('|||')[0];
        onUpdate(block.id, `${imagePart}|||${caption || 'Add a caption...'}`);
      }
    } else {
      // Removing caption
      if (block.content && block.content.includes('|||')) {
        const imagePart = block.content.split('|||')[0];
        onUpdate(block.id, imagePart);
      }
    }
  };

  const handleZoom = () => {
    setIsZoomed(true);
  };

  const getImageContent = () => {
    if (block.content && block.content.includes('|||')) {
      return block.content.split('|||')[0];
    }
    return block.content;
  };

  const hasValidImage = () => {
    return !!block.content && block.content.trim() !== '';
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  const getImageSizeInfo = () => {
    if (!imageSize) return '';
    return `${imageSize.width} × ${imageSize.height}`;
  };

  return (
    <Box
      ref={containerRef}
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
      <Box
        sx={{
          position: 'relative',
          maxWidth: '100%',
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }
        }}
      >
        {isLoading ? (
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={300}
            animation="wave"
            sx={{ 
              borderRadius: 0,
              backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(0,0,0,0.08)' 
                : 'rgba(255,255,255,0.08)'
            }}
          />
        ) : (
          <>
            <Box 
              sx={{ 
                position: 'relative',
                cursor: hasValidImage() ? 'zoom-in' : 'pointer',
              }}
              onClick={hasValidImage() ? handleZoom : () => document.getElementById(`image-upload-${block.id}`)?.click()}
            >
              {!hasValidImage() ? (
                // Placeholder illustration when no image
                <Box
                  sx={{
                    height: 200,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                    border: '1px dashed',
                    borderColor: 'divider',
                    p: 3,
                    gap: 2
                  }}
                >
                  <Box sx={{ 
                    position: 'relative', 
                    width: 60, 
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1
                  }}>
                    {/* Simple frame illustration */}
                    <Box sx={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      border: '2px solid',
                      borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                    }} />
                    
                    {/* Mountain illustration */}
                    <Box sx={{ 
                      position: 'absolute',
                      bottom: '25%',
                      left: '15%',
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderBottom: `15px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                    }} />
                    
                    <Box sx={{ 
                      position: 'absolute',
                      bottom: '25%',
                      right: '20%',
                      width: 0,
                      height: 0,
                      borderLeft: '15px solid transparent',
                      borderRight: '15px solid transparent',
                      borderBottom: `25px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`,
                    }} />
                    
                    {/* Sun illustration */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: '20%',
                      right: '25%',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                    }} />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Click to add an image
                  </Typography>
                </Box>
              ) : (
                <img
                  src={getImageContent()}
                  alt="Image content"
                  onLoad={handleImageLoad}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                  }}
                />
              )}
              
              {hasValidImage() && imageSize && (
                <Typography 
                  variant="caption" 
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 0,
                    fontSize: '10px',
                    opacity: 0.7
                  }}
                >
                  {getImageSizeInfo()}
                </Typography>
              )}
            </Box>
            
            {hasValidImage() && showCaption && (
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: { 
                      fontSize: '0.9rem', 
                      textAlign: 'center',
                      color: 'text.secondary',
                      '&::placeholder': {
                        opacity: 0.7,
                        fontStyle: 'italic'
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
        
        <Box
          className="block-actions"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            opacity: 0,
            transition: 'opacity 0.2s, transform 0.2s',
            bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
            borderRadius: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            transform: 'translateY(-5px)',
            '&:hover': {
              transform: 'translateY(0)',
            }
          }}
        >
          <Tooltip title="Replace image">
            <IconButton
              size="small"
              onClick={() => document.getElementById(`image-upload-${block.id}`)?.click()}
              sx={{ color: 'text.secondary' }}
            >
              <Edit01Icon size={18} />
            </IconButton>
          </Tooltip>
          {hasValidImage() && (
            <>
              <Tooltip title="Zoom">
                <IconButton
                  size="small"
                  onClick={handleZoom}
                  sx={{ color: 'text.secondary' }}
                >
                  <ZoomIcon size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title={showCaption ? "Remove caption" : "Add caption"}>
                <IconButton
                  size="small"
                  onClick={toggleCaption}
                  sx={{ 
                    color: showCaption ? 'primary.main' : 'text.secondary'
                  }}
                >
                  <TextAlignJustifyLeftIcon size={18} />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: 'error.light' }}
            >
              <Delete01Icon size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <input
        type="file"
        id={`image-upload-${block.id}`}
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
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
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            padding: 0.5,
            borderRadius: 0,
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem onClick={() => document.getElementById(`image-upload-${block.id}`)?.click()} dense>
          <Edit01Icon size={18} style={{ marginRight: 10 }} />
          Replace image
        </MenuItem>
        {hasValidImage() && (
          <>
            <MenuItem onClick={toggleCaption} dense>
              <TextAlignJustifyLeftIcon size={18} style={{ marginRight: 10 }} />
              {showCaption ? 'Remove caption' : 'Add caption'}
            </MenuItem>
            <MenuItem onClick={handleZoom} dense>
              <ZoomIcon size={18} style={{ marginRight: 10 }} />
              Zoom image
            </MenuItem>
            <MenuItem onClick={handleCloseContextMenu} dense>
              <Layout04Icon size={18} style={{ marginRight: 10 }} />
              Full width
            </MenuItem>
            <MenuItem onClick={handleCloseContextMenu} dense>
              <Download01Icon size={18} style={{ marginRight: 10 }} />
              Download
            </MenuItem>
            <MenuItem onClick={handleCloseContextMenu} dense>
              <Copy01Icon size={18} style={{ marginRight: 10 }} />
              Duplicate
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleDelete} dense sx={{ color: 'error.main' }}>
          <Delete01Icon size={18} style={{ marginRight: 10 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Image Zoom Dialog */}
      {hasValidImage() && (
        <Dialog
          open={isZoomed}
          onClose={() => setIsZoomed(false)}
          maxWidth="xl"
          PaperProps={{
            elevation: 24,
            sx: {
              overflow: 'hidden',
              borderRadius: 0,
              bgcolor: 'transparent',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10
              }}
            >
              <IconButton 
                onClick={() => setIsZoomed(false)}
                sx={{
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <XVariableIcon size={20} />
              </IconButton>
            </Box>
            <img
              src={getImageContent()}
              alt="Zoomed image view"
              style={{
                maxHeight: 'calc(100vh - 64px)',
                maxWidth: '100%',
                display: 'block',
                margin: '0 auto',
                objectFit: 'contain'
              }}
            />
            {showCaption && caption && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(0,0,0,0.8)', 
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="body2">{caption}</Typography>
              </Box>
            )}
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default PictureBlock; 