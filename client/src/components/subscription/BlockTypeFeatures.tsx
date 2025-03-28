import React from 'react';
import { Box, Typography, Grid, Paper, Chip, useTheme } from '@mui/material';
import { 
  TextIcon, 
  Heading01Icon, 
  ListViewIcon, 
  CheckListIcon, 
  ArrowRight01Icon, 
  CodeIcon, 
  Table01Icon, 
  Calendar01Icon, 
  Image01Icon, 
  FunctionIcon,
  DocumentAttachmentIcon
} from 'hugeicons-react';
import { BLOCK_CATEGORIES, isBlockTypeAllowedForTier } from '../../utils/blockPermissions';

interface BlockTypeProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  tier: 'free' | 'pro' | 'team';
}

const BlockType: React.FC<BlockTypeProps> = ({ type, label, icon, tier }) => {
  const theme = useTheme();
  const isAllowed = isBlockTypeAllowedForTier(type, tier);
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        opacity: isAllowed ? 1 : 0.5,
        mb: 1
      }}
    >
      <Box sx={{ 
        color: isAllowed ? 'primary.main' : 'text.disabled',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24
      }}>
        {icon}
      </Box>
      <Typography 
        variant="body2" 
        color={isAllowed ? 'text.primary' : 'text.disabled'}
      >
        {label}
      </Typography>
      {!isAllowed && (
        <Chip 
          label="Upgrade" 
          size="small" 
          color="primary" 
          variant="outlined" 
          sx={{ 
            height: 20, 
            fontSize: '0.625rem',
            ml: 'auto'
          }} 
        />
      )}
    </Box>
  );
};

interface BlockTypeFeaturesProps {
  tier: 'free' | 'pro' | 'team';
}

const BlockTypeFeatures: React.FC<BlockTypeFeaturesProps> = ({ tier }) => {
  const blockIcons: Record<string, React.ReactNode> = {
    'text': <TextIcon size={18} />,
    'heading1': <Heading01Icon size={18} />,
    'heading2': <Heading01Icon size={16} />,
    'heading3': <Heading01Icon size={14} />,
    'bullet-list': <ListViewIcon size={18} />,
    'numbered-list': <ListViewIcon size={18} />,
    'todo-list': <CheckListIcon size={18} />,
    'toggle-list': <ArrowRight01Icon size={18} />,
    'code': <CodeIcon size={18} />,
    'table': <Table01Icon size={18} />,
    'schedule': <Calendar01Icon size={18} />,
    'picture': <Image01Icon size={18} />,
    'equation': <FunctionIcon size={18} />,
    'file': <DocumentAttachmentIcon size={18} />
  };

  const blockLabels: Record<string, string> = {
    'text': 'Text',
    'heading1': 'Heading 1',
    'heading2': 'Heading 2',
    'heading3': 'Heading 3',
    'bullet-list': 'Bullet List',
    'numbered-list': 'Numbered List',
    'todo-list': 'Todo List',
    'toggle-list': 'Toggle List',
    'code': 'Code',
    'table': 'Table',
    'schedule': 'Schedule',
    'picture': 'Picture',
    'equation': 'Equation',
    'file': 'File'
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Block Types
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Basic Blocks
          </Typography>
          {BLOCK_CATEGORIES.BASIC.map(blockType => (
            <BlockType 
              key={blockType}
              type={blockType}
              label={blockLabels[blockType]}
              icon={blockIcons[blockType]}
              tier={tier}
            />
          ))}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            List Blocks
          </Typography>
          {BLOCK_CATEGORIES.LISTS.map(blockType => (
            <BlockType 
              key={blockType}
              type={blockType}
              label={blockLabels[blockType]}
              icon={blockIcons[blockType]}
              tier={tier}
            />
          ))}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Advanced Blocks
          </Typography>
          {BLOCK_CATEGORIES.ADVANCED.map(blockType => (
            <BlockType 
              key={blockType}
              type={blockType}
              label={blockLabels[blockType]}
              icon={blockIcons[blockType]}
              tier={tier}
            />
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BlockTypeFeatures; 