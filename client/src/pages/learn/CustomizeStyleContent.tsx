import React from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { ArrowLeft01Icon, CheckmarkCircle01Icon, ParallelogramIcon, TextAlignLeftIcon, TextAlignCenterIcon, TextAlignRightIcon, TextBoldIcon, TextItalicIcon, TextUnderlineIcon, TextStrikethroughIcon, ColorPickerIcon, Image01Icon, Link01Icon, CodeIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';

const CustomizeStyleContent = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 900,
        mx: 'auto',
        minHeight: '100vh',
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)'
          : 'linear-gradient(180deg, #111827 0%, #1F2937 100%)'
      }}
    >
      {/* Back button */}
      <Box 
        onClick={() => navigate('/dashboard')}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 4, 
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main'
          }
        }}
      >
        <ArrowLeft01Icon size={20} />
        <Typography variant="body2">Back to Dashboard</Typography>
      </Box>

      {/* Header */}
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 2, 
          fontWeight: 700,
          color: 'text.primary'
        }}
      >
        Customize & Style Content
      </Typography>

      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 4, 
          color: 'text.secondary',
          maxWidth: 700
        }}
      >
        Learn how to format, style, and customize your content to make it visually appealing and easier to read.
      </Typography>

      {/* Main content */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ParallelogramIcon size={24} style={{ color: theme.palette.primary.main }} />
          Text Formatting
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Mentor provides rich text formatting options to help you create visually appealing content. You can format text within blocks to emphasize important information and improve readability.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Formatting
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TextBoldIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Bold" 
                    secondary="Ctrl+B (or Cmd+B on Mac)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TextItalicIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Italic" 
                    secondary="Ctrl+I (or Cmd+I on Mac)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TextUnderlineIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Underline" 
                    secondary="Ctrl+U (or Cmd+U on Mac)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TextStrikethroughIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Strikethrough" 
                    secondary="Ctrl+Shift+X (or Cmd+Shift+X on Mac)" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Text Alignment
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TextAlignLeftIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Left Align" 
                    secondary="Default alignment for most text" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TextAlignCenterIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Center Align" 
                    secondary="Great for headings and quotes" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TextAlignRightIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Right Align" 
                    secondary="Useful for specific design needs" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Box 
          component="img" 
          src="./sources/text-formatting.svg" 
          alt="Text formatting toolbar" 
          sx={{ 
            width: '100%', 
            maxWidth: 600, 
            height: 'auto', 
            my: 4,
            mx: 'auto',
            display: 'block',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }} 
        />

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorPickerIcon size={24} style={{ color: theme.palette.primary.main }} />
          Advanced Styling
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Text Styling
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enhance your text with these styling options:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  label="Highlight" 
                  sx={{ 
                    bgcolor: 'warning.soft', 
                    color: 'warning.main',
                    fontWeight: 600
                  }} 
                />
                <Chip 
                  label="Text Color" 
                  sx={{ 
                    bgcolor: 'primary.soft', 
                    color: 'primary.main',
                    fontWeight: 600
                  }} 
                />
                <Chip 
                  label="Background Color" 
                  sx={{ 
                    bgcolor: 'success.soft', 
                    color: 'success.main',
                    fontWeight: 600
                  }} 
                />
                <Chip 
                  label="Code" 
                  sx={{ 
                    bgcolor: 'grey.100', 
                    color: 'grey.800',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }} 
                />
              </Box>
              
              <Typography variant="body2">
                Select text and use the formatting toolbar to apply these styles. You can also use keyboard shortcuts like <code>Ctrl+E</code> for code formatting.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Links and Media
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Link01Icon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Add Links" 
                    secondary="Ctrl+K (or Cmd+K on Mac)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Image01Icon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Insert Images" 
                    secondary="Use the image block or paste directly" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon size={20} style={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Code Blocks" 
                    secondary="With syntax highlighting for various languages" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Block Customization
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Each block type has its own customization options. Here are some examples:
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'primary.main',
                bgcolor: 'primary.soft'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Text Blocks
              </Typography>
              <List sx={{ pl: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Font formatting" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Text alignment" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Color options" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'success.main',
                bgcolor: 'success.soft'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                List Blocks
              </Typography>
              <List sx={{ pl: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Bullet style" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Indentation levels" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Checkbox styling" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'warning.main',
                bgcolor: 'warning.soft'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
                Code Blocks
              </Typography>
              <List sx={{ pl: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Language selection" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Syntax highlighting" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Line numbers" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Pro Tip:</strong> Hover over any block to see its toolbar with customization options. You can also right-click on a block to access a context menu with additional options.
          </Typography>
          
          <Box 
            component="img" 
            src="./sources/block-toolbar.svg" 
            alt="Block toolbar" 
            sx={{ 
              width: '100%', 
              maxWidth: 600, 
              height: 'auto', 
              my: 2,
              mx: 'auto',
              display: 'block',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }} 
          />
        </Box>
      </Paper>

      {/* Next steps */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Congratulations!
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          You've completed all the basic tutorials for Mentor. You now know how to create pages, work with blocks, use AI to generate content, and customize your content.
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Continue exploring Mentor to discover more advanced features and make the most of your productivity tool.
        </Typography>

        <Box 
          onClick={() => navigate('/dashboard')}
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }}
        >
          Return to Dashboard
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomizeStyleContent; 