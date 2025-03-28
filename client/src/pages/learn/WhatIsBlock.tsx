import React from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { ArrowLeft01Icon, CheckmarkCircle01Icon, File01Icon, TextWrapIcon, ListViewIcon, HeadingIcon, CodeIcon, TableIcon, Image01Icon, FunctionIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';

const WhatIsBlock = () => {
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
        What is a Block?
      </Typography>

      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 4, 
          color: 'text.secondary',
          maxWidth: 700
        }}
      >
        Blocks are the fundamental building units of your pages in Mentor. They allow you to create rich, interactive content with minimal effort.
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
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Understanding Blocks
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          A block is a modular content element that serves a specific purpose. Unlike traditional word processors where you're limited to basic text formatting, blocks in Mentor allow you to create diverse types of content that can be easily rearranged, styled, and interacted with.
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Think of blocks as LEGO pieces for your digital content. Each block has its own functionality, but they all work together to create a cohesive document.
        </Typography>

        <Box 
          component="img" 
          src="/sources/block_concept.png" 
          alt="Block concept illustration" 
          sx={{ 
            width: '100%', 
            maxWidth: 600, 
            height: 'auto', 
            my: 4,
            mx: 'auto',
            display: 'block',
            borderRadius: 2
          }} 
        />

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
          Types of Blocks
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TextWrapIcon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Text Block" 
                  secondary="For paragraphs and basic text content" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ListViewIcon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="List Blocks" 
                  secondary="Bullet lists, numbered lists, and todo lists" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HeadingIcon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Heading Blocks" 
                  secondary="H1, H2, and H3 for document structure" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CodeIcon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Code Block" 
                  secondary="For code snippets with syntax highlighting" 
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TableIcon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Table Block" 
                  secondary="For tabular data and information" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Image01Icon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Media Blocks" 
                  secondary="Images, files, and other media" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FunctionIcon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Function Block" 
                  secondary="For mathematical equations with LaTeX" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <File01Icon size={24} style={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Special Blocks" 
                  secondary="Toggle lists, schedules, and more" 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Working with Blocks
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Here's how you can work with blocks in Mentor:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Creating a block" 
              secondary="Press '/' to open the block menu or use the + button" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Moving blocks" 
              secondary="Drag and drop blocks to rearrange them" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Converting blocks" 
              secondary="Change a block's type through the block menu" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Deleting blocks" 
              secondary="Select a block and press Delete or use the block menu" 
            />
          </ListItem>
        </List>
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
          Next Steps
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Now that you understand what blocks are, learn how to create your first page and start using blocks effectively.
        </Typography>

        <Box 
          onClick={() => navigate('/learn/create-first-page')}
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'primary.soft', 
            color: 'primary.main',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'white'
            }
          }}
        >
          Next: Create Your First Page
        </Box>
      </Paper>
    </Box>
  );
};

export default WhatIsBlock; 