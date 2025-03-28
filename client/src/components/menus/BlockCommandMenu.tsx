import { Menu, MenuItem, Box, Typography, useTheme, ListSubheader, Tooltip } from '@mui/material';
import {
  TextIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  ListViewIcon,
  CheckListIcon,
  ArrowRight01Icon,
  Table01Icon,
  Calendar01Icon,
  Image01Icon,
  CodeIcon,
  FunctionIcon,
  DocumentAttachmentIcon,
  LockIcon
} from 'hugeicons-react';
import { useBlockPermissions } from '../../utils/blockPermissions';

interface BlockCommandMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelect: (blockType: string) => void;
}

const BlockCommandMenu = ({ anchorEl, onClose, onSelect }: BlockCommandMenuProps) => {
  const theme = useTheme();
  const { isBlockTypeAllowed } = useBlockPermissions();

  const commandCategories = [
    {
      title: 'BASIC BLOCKS',
      items: [
        { type: 'text', value: 'text', icon: <TextIcon size={18} />, label: 'Text', description: 'Just start writing with plain text.' },
        { type: 'heading1', value: 'heading1', icon: <Heading01Icon size={18} />, label: 'Heading 1', description: 'Big section heading.' },
        { type: 'heading2', value: 'heading2', icon: <Heading02Icon size={18} />, label: 'Heading 2', description: 'Medium section heading.' },
        { type: 'heading3', value: 'heading3', icon: <Heading03Icon size={18} />, label: 'Heading 3', description: 'Small section heading.' },
        { type: 'picture', value: 'picture', icon: <Image01Icon size={18} />, label: 'Picture', description: 'Upload and display an image.' },
        { type: 'file', value: 'file', icon: <DocumentAttachmentIcon size={18} />, label: 'File', description: 'Upload and share any file.' },
      ]
    },
    {
      title: 'LISTS',
      items: [
        { type: 'bullet-list', value: 'bullet-list', icon: <ListViewIcon size={18} />, label: 'Bulleted list', description: 'Create a simple bulleted list.' },
        { type: 'number-list', value: 'number-list', icon: <ListViewIcon size={18} />, label: 'Numbered list', description: 'Create a list with numbering.' },
        { type: 'todo-list', value: 'todo-list', icon: <CheckListIcon size={18} />, label: 'To-do list', description: 'Track tasks with a to-do list.' },
        { type: 'toggle-list', value: 'toggle-list', icon: <ArrowRight01Icon size={18} />, label: 'Toggle list', description: 'Expandable list with nested content.' },
      ]
    },
    {
      title: 'ADVANCED BLOCKS',
      items: [
        { type: 'code', value: 'code', icon: <CodeIcon size={18} />, label: 'Code', description: 'Add code with syntax highlighting.' },
        { type: 'table', value: 'table', icon: <Table01Icon size={18} />, label: 'Table', description: 'Add a table to organize information.' },
        { type: 'schedule', value: 'schedule', icon: <Calendar01Icon size={18} />, label: 'Schedule', description: 'Create a schedule with time slots and assignments.' },
        { type: 'equation', value: 'equation', icon: <FunctionIcon size={18} />, label: 'Equation', description: 'Insert mathematical equations using LaTeX.' }
      ]
    }
    // Commented out until implementation is ready
    /*
    {
      title: 'MENTIONS & REFERENCES',
      items: [
        { type: 'mention', value: 'mention', icon: <AtIcon size={18} />, label: 'Mention person', description: 'Mention someone to notify them.' },
        { type: 'page', value: 'page', icon: <Link01Icon size={18} />, label: 'Page reference', description: 'Link to another page.' },
        { type: 'date', value: 'date', icon: <Clock01Icon size={18} />, label: 'Date or reminder', description: 'Add a date mention or reminder.' },
        { type: 'emoji', value: 'emoji', icon: <UserIcon size={18} />, label: 'Emoji', description: 'Add an emoji anywhere.' },
        { type: 'equation', value: 'equation', icon: <FunctionIcon size={18} />, label: 'Equation', description: 'Insert mathematical equations.' }
      ]
    }
    */
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 0,
            ml: -1,
            borderRadius: '8px',
            boxShadow: '0 0 0 1px rgba(15, 15, 15, 0.05), 0 3px 6px rgba(15, 15, 15, 0.1), 0 9px 24px rgba(15, 15, 15, 0.2)',
            minWidth: 280,
            maxWidth: 320,
            maxHeight: '60vh',
            bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#2f3437',
            color: theme.palette.mode === 'light' ? '#37352f' : '#ffffff',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }
        }
      }}
    >
      {commandCategories.map((category, index) => (
        <Box key={category.title} sx={{ py: 0.5 }}>
          {index > 0 && <Box sx={{ my: 0.5, borderTop: '1px solid', borderColor: 'divider' }} />}
          <ListSubheader 
            sx={{ 
              px: 1.5, 
              py: 0.75, 
              lineHeight: '1.2', 
              color: 'text.secondary',
              bgcolor: 'transparent',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            {category.title}
          </ListSubheader>
          {category.items.map((item) => {
            const allowed = isBlockTypeAllowed(item.type);
            
            return (
              <Tooltip 
                key={item.type}
                title={allowed ? '' : 'Upgrade your plan to use this block type'}
                arrow
                placement="right"
              >
                <div>
                  <MenuItem
                    onClick={() => {
                      if (allowed) {
                        onSelect(item.type);
                        onClose();
                      }
                    }}
                    disabled={!allowed}
                    sx={{
                      borderRadius: '6px',
                      py: 0.75,
                      px: 1.5,
                      mx: 0.75,
                      gap: 1.5,
                      opacity: allowed ? 1 : 0.6,
                      '&:hover': {
                        bgcolor: allowed 
                          ? (theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)')
                          : 'transparent'
                      }
                    }}
                  >
                    <Box sx={{ 
                      color: allowed ? 'text.secondary' : 'text.disabled',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20
                    }}>
                      {allowed ? item.icon : <LockIcon size={16} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" color={allowed ? 'text.primary' : 'text.disabled'}>
                        {item.label}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={allowed ? 'text.secondary' : 'text.disabled'} 
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {allowed ? item.description : 'Upgrade required'}
                      </Typography>
                    </Box>
                  </MenuItem>
                </div>
              </Tooltip>
            );
          })}
        </Box>
      ))}
    </Menu>
  );
};

export default BlockCommandMenu; 