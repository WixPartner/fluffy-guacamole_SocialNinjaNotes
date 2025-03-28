import React from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle01Icon, AiCloud01Icon, LighthouseIcon, SparklesIcon, DangerIcon, InformationCircleIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';

const UseAiContent = () => {
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
        Use AI to Create Content
      </Typography>

      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 4, 
          color: 'text.secondary',
          maxWidth: 700
        }}
      >
        Learn how to leverage Mentor's AI capabilities to generate content, brainstorm ideas, and enhance your productivity.
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
          <AiCloud01Icon size={24} style={{ color: theme.palette.primary.main }} />
          AI-Powered Content Generation
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Mentor's AI assistant can help you create various types of content with just a few prompts. Whether you need to draft an email, create a list, generate code, or build a table, the AI can help you save time and overcome writer's block.
        </Typography>

        <Box 
          component="img" 
          src="/sources/ai_assistant.png" 
          alt="AI Assistant" 
          sx={{ 
            width: '100%', 
            maxWidth: 600, 
            height: 'auto', 
            my: 4,
            mx: 'auto',
            display: 'block',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }} 
        />

        <Alert 
          severity="info" 
          icon={<InformationCircleIcon size={24} />}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <Typography variant="subtitle2">AI Credit System</Typography>
          <Typography variant="body2">
            Mentor uses a credit system for AI features. Free accounts get 10 credits per month, Pro accounts get 100 credits, and Team accounts get 500 credits. Each AI generation uses 1 credit.
          </Typography>
        </Alert>

        <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: 600 }}>
          How to Use AI in Mentor
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SparklesIcon size={24} style={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Using the AI Command
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                The easiest way to use AI is with the "/" command:
              </Typography>
              
              <List sx={{ pl: 2 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Type '/' anywhere in the page" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Enter your prompt" 
                    secondary="Example: 'Write a plan for a new website'" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Press Enter" 
                    secondary="The AI will generate content based on your prompt" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* comment 
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LighthouseIcon size={24} style={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Using the AI Sidebar
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                For more advanced AI features, use the AI sidebar:
              </Typography>
              
              <List sx={{ pl: 2 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Click the AI icon in the top right" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Select a template or enter a custom prompt" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Customize options if needed" 
                    secondary="Block type, tone, length, etc." 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckmarkCircle01Icon size={20} style={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Click 'Generate'" 
                  />
                </ListItem>
              </List>

              <Box 
                component="img" 
                src="./sources/ai-sidebar.svg" 
                alt="AI Sidebar" 
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  mt: 'auto',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }} 
              />
            </Paper>
          </Grid>
          */}
        </Grid>

        

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Effective AI Prompts
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          The quality of AI-generated content depends on your prompts. Here are some tips for writing effective prompts:
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
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
                Good Prompt Examples
              </Typography>
              <List sx={{ pl: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Write a 3-paragraph introduction to machine learning for beginners" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Create a 5-step checklist for launching a website" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Generate a table comparing React, Angular, and Vue.js" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Write a JavaScript function that sorts an array of objects by a specific property" 
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
                borderColor: 'warning.main',
                bgcolor: 'warning.soft'
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
                Less Effective Prompt Examples
              </Typography>
              <List sx={{ pl: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Tell me about machine learning" 
                    secondary="Too vague, no specific output format or audience" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Website checklist" 
                    secondary="Lacks details about what kind of checklist is needed" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Compare frameworks" 
                    secondary="Doesn't specify which frameworks or comparison criteria" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Sort function" 
                    secondary="Lacks specifics about language, input, and requirements" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Alert 
          severity="warning" 
          icon={<DangerIcon size={24} />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          <Typography variant="subtitle2">AI Limitations</Typography>
          <Typography variant="body2">
            While powerful, AI has limitations. It may occasionally produce incorrect information or misunderstand complex requests. Always review AI-generated content for accuracy.
          </Typography>
        </Alert>
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
          Now that you know how to use AI to generate content, learn how to customize and style your content to make it visually appealing.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box 
            onClick={() => navigate('/learn/create-first-page')}
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
            Previous: Create Your First Page
          </Box>
          
          <Box 
            onClick={() => navigate('/learn/customize-style-content')}
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
            Next: Customize & Style Content
            <ArrowRight01Icon size={20} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UseAiContent; 