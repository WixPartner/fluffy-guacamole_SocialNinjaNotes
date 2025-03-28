import React from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider, List, ListItem, ListItemIcon, ListItemText, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle01Icon, PlusSignCircleIcon, File01Icon, Edit01Icon, TextWrapIcon, Settings01Icon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';

const CreateFirstPage = () => {
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
        Create Your First Page
      </Typography>

      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 4, 
          color: 'text.secondary',
          maxWidth: 700
        }}
      >
        Learn how to create and organize your first page in Mentor. Pages are where you'll store all your notes, ideas, and projects.
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
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Step-by-Step Guide
        </Typography>
        
        <Stepper orientation="vertical" sx={{ mb: 4 }}>
          <Step active={true} completed={false}>
            <StepLabel 
              StepIconProps={{ 
                icon: <PlusSignCircleIcon size={24} style={{ color: theme.palette.primary.main }} /> 
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>Create a new page</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                In the sidebar, click on the "+" button next to "Pages" to create a new page.
              </Typography>
              <Box 
                component="img" 
                src="/sources/new_page_button.png" 
                alt="New page button" 
                sx={{ 
                  width: '100%', 
                  maxWidth: 200, 
                  height: 'auto', 
                  my: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }} 
              />
            </StepContent>
          </Step>

          <Step active={true} completed={false}>
            <StepLabel 
              StepIconProps={{ 
                icon: <Edit01Icon size={24} style={{ color: theme.palette.primary.main }} /> 
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>Name your page</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Enter a descriptive name for your page. This will help you identify it later.
              </Typography>
              <Box 
                component="img" 
                src="/sources/naming_page.png" 
                alt="Naming a page" 
                sx={{ 
                  width: '100%', 
                  maxWidth: 200, 
                  height: 'auto', 
                  my: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }} 
              />
            </StepContent>
          </Step>

          <Step active={true} completed={false}>
            <StepLabel 
              StepIconProps={{ 
                icon: <TextWrapIcon size={24} style={{ color: theme.palette.primary.main }} /> 
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>Add content with blocks</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Start adding content to your page using blocks. Click anywhere on the page and start typing, or press "/" to open the block menu and select a block type.
              </Typography>
              <Box 
                component="img" 
                src="/sources/add_block.png" 
                alt="Adding blocks" 
                sx={{ 
                  width: '100%', 
                  maxWidth: 600, 
                  height: 'auto', 
                  my: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }} 
              />
            </StepContent>
          </Step>

          <Step active={true} completed={false}>
            <StepLabel 
              StepIconProps={{ 
                icon: <Settings01Icon size={24} style={{ color: theme.palette.primary.main }} /> 
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>Customize your page</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Personalize your page by adding an icon. Click on the icon button next to the page title and select an icon that represents your page's content.
              </Typography>
              <Box 
                component="img" 
                src="/sources/customize_page.png" 
                alt="Customizing a page" 
                sx={{ 
                  width: '100%', 
                  maxWidth: 400, 
                  height: 'auto', 
                  my: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }} 
              />
            </StepContent>
          </Step>
        </Stepper>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Page Organization Tips
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Use descriptive names" 
                  secondary="Make your page names clear and specific" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Add page icons" 
                  secondary="Visual cues help identify pages quickly" 
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Favorite important pages" 
                  secondary="Click the star icon to add to favorites" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Reorder pages" 
                  secondary="Drag and drop to organize your sidebar" 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
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
          Now that you know how to create pages, learn how to use AI to generate content for your pages.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box 
            onClick={() => navigate('/learn/what-is-block')}
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'action.hover', 
              color: 'text.primary',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'action.selected'
              }
            }}
          >
            <ArrowLeft01Icon size={20} />
            Previous: What is a Block?
          </Box>
          
          <Box 
            onClick={() => navigate('/learn/use-ai-content')}
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
            Next: Use AI to Create Content
            <ArrowRight01Icon size={20} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateFirstPage; 