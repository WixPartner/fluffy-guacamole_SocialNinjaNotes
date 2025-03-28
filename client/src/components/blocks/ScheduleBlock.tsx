import React, { useState, useCallback } from 'react';
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  useTheme, 
  Paper,
  Typography,
  Tooltip,
  Dialog,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  alpha,
  Stack,
  Collapse,
  Zoom,
  Theme
} from '@mui/material';
import { Block } from '../../api/pages';
import { Clock01Icon, Calendar01Icon, Settings01Icon, Add01Icon, Delete01Icon, ArrowDown01Icon, ArrowUp01Icon } from 'hugeicons-react';
import { nanoid } from 'nanoid';
import { format, parse, isValid, set } from 'date-fns';

interface ScheduleEntry {
  id: string;
  time: string;
  activity: string;
  status: string;
  priority: string;
  assignee?: string;
}

interface ScheduleBlockProps {
  block: Block & { type: 'schedule' };
  onUpdate: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed'];

const STATUS_COLORS: Record<string, { color: (theme: Theme) => string; bgColor: (theme: Theme) => string }> = {
  'Not Started': { 
    color: (theme: Theme) => theme.palette.text.secondary,
    bgColor: (theme: Theme) => alpha(theme.palette.text.secondary, 0.08)
  },
  'In Progress': { 
    color: (theme: Theme) => theme.palette.primary.main,
    bgColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08)
  },
  'Completed': { 
    color: (theme: Theme) => theme.palette.success.main,
    bgColor: (theme: Theme) => alpha(theme.palette.success.main, 0.08)
  }
};

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const PRIORITY_COLORS: Record<string, { color: (theme: Theme) => string; bgColor: (theme: Theme) => string }> = {
  'Low': { 
    color: (theme: Theme) => theme.palette.info.main,
    bgColor: (theme: Theme) => alpha(theme.palette.info.main, 0.08)
  },
  'Medium': { 
    color: (theme: Theme) => theme.palette.warning.main,
    bgColor: (theme: Theme) => alpha(theme.palette.warning.main, 0.08)
  },
  'High': { 
    color: (theme: Theme) => theme.palette.error.main,
    bgColor: (theme: Theme) => alpha(theme.palette.error.main, 0.08)
  }
};

const textFieldStyles = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '100%',
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
    '& fieldset': {
      display: 'none'
    }
  },
  '& .MuiOutlinedInput-input': {
    height: '100%',
    padding: '0.5rem 0.75rem',
    textAlign: 'center',
    '&::placeholder': {
      color: (theme: Theme) => theme.palette.text.secondary,
      opacity: 0.5
    }
  }
};

const cellStyles = {
  cursor: 'text',
  p: '0.5rem 0.75rem',
  minHeight: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  '&:hover': {
    backgroundColor: 'action.hover'
  }
};

const ScheduleBlock: React.FC<ScheduleBlockProps> = ({ block, onUpdate, onDelete }) => {
  const theme = useTheme();
  const [entries, setEntries] = useState<ScheduleEntry[]>(() => {
    try {
      const parsedEntries = JSON.parse(block.content || '[]');
      // Ensure each entry has valid status and priority
      return parsedEntries.map((entry: any) => ({
        ...entry,
        status: STATUS_OPTIONS.includes(entry.status) ? entry.status : 'Not Started',
        priority: PRIORITY_OPTIONS.includes(entry.priority) ? entry.priority : 'Medium'
      }));
    } catch {
      return [];
    }
  });
  
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof ScheduleEntry } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    entryId?: string;
  } | null>(null);

  const handleSave = useCallback((updatedEntries: ScheduleEntry[]) => {
    const sortedEntries = [...updatedEntries].sort((a, b) => {
      const timeA = parse(a.time, 'HH:mm', new Date());
      const timeB = parse(b.time, 'HH:mm', new Date());
      return timeA.getTime() - timeB.getTime();
    });
    setEntries(sortedEntries);
    onUpdate(block.id, JSON.stringify(sortedEntries));
  }, [block.id, onUpdate]);

  const handleCellChange = (id: string, field: keyof ScheduleEntry, value: string) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    handleSave(updatedEntries);
  };

  const handleAddRow = () => {
    const newEntry: ScheduleEntry = {
      id: nanoid(),
      time: format(new Date(), 'HH:mm'),
      activity: '',
      status: 'Not Started',
      priority: 'Medium'
    };
    handleSave([...entries, newEntry]);
  };

  const handleDeleteRow = (id: string) => {
    handleSave(entries.filter(entry => entry.id !== id));
  };

  const handleContextMenu = (event: React.MouseEvent, entryId?: string) => {
    event.preventDefault();
    event.stopPropagation(); // Stop event bubbling
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      entryId: entryId // This will be undefined when clicking the schedule, and set when clicking an entry
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteSchedule = () => {
    if (onDelete) {
      onDelete(block.id);
    }
    handleCloseContextMenu();
  };

  const handleClearEntries = () => {
    handleSave([]);
    handleCloseContextMenu();
  };

  const handleSortByTime = () => {
    const sortedEntries = [...entries].sort((a, b) => {
      const timeA = parse(a.time, 'HH:mm', new Date());
      const timeB = parse(b.time, 'HH:mm', new Date());
      return timeA.getTime() - timeB.getTime();
    });
    handleSave(sortedEntries);
    handleCloseContextMenu();
  };

  const handleDeleteEntry = () => {
    if (contextMenu?.entryId) {
      handleDeleteRow(contextMenu.entryId);
    }
    handleCloseContextMenu();
  };

  const handleDuplicateEntry = () => {
    if (contextMenu?.entryId) {
      const entryToDuplicate = entries.find(e => e.id === contextMenu.entryId);
      if (entryToDuplicate) {
        const newEntry = {
          ...entryToDuplicate,
          id: nanoid()
        };
        handleSave([...entries, newEntry]);
      }
    }
    handleCloseContextMenu();
  };

  const handleMoveEntryUp = () => {
    if (contextMenu?.entryId) {
      const index = entries.findIndex(e => e.id === contextMenu.entryId);
      if (index > 0) {
        const newEntries = [...entries];
        [newEntries[index - 1], newEntries[index]] = [newEntries[index], newEntries[index - 1]];
        handleSave(newEntries);
      }
    }
    handleCloseContextMenu();
  };

  const handleMoveEntryDown = () => {
    if (contextMenu?.entryId) {
      const index = entries.findIndex(e => e.id === contextMenu.entryId);
      if (index < entries.length - 1) {
        const newEntries = [...entries];
        [newEntries[index], newEntries[index + 1]] = [newEntries[index + 1], newEntries[index]];
        handleSave(newEntries);
      }
    }
    handleCloseContextMenu();
  };

  const handleAddEntryAbove = () => {
    if (contextMenu?.entryId) {
      const index = entries.findIndex(e => e.id === contextMenu.entryId);
      const newEntry: ScheduleEntry = {
        id: nanoid(),
        time: format(new Date(), 'HH:mm'),
        activity: '',
        status: 'Not Started',
        priority: 'Medium'
      };
      const newEntries = [...entries];
      newEntries.splice(index, 0, newEntry);
      handleSave(newEntries);
    }
    handleCloseContextMenu();
  };

  const handleAddEntryBelow = () => {
    if (contextMenu?.entryId) {
      const index = entries.findIndex(e => e.id === contextMenu.entryId);
      const newEntry: ScheduleEntry = {
        id: nanoid(),
        time: format(new Date(), 'HH:mm'),
        activity: '',
        status: 'Not Started',
        priority: 'Medium'
      };
      const newEntries = [...entries];
      newEntries.splice(index + 1, 0, newEntry);
      handleSave(newEntries);
    }
    handleCloseContextMenu();
  };

  const handleMarkAllComplete = () => {
    const updatedEntries = entries.map(entry => ({
      ...entry,
      status: 'Completed'
    }));
    handleSave(updatedEntries);
    handleCloseContextMenu();
  };

  const handleMarkAllNotStarted = () => {
    const updatedEntries = entries.map(entry => ({
      ...entry,
      status: 'Not Started'
    }));
    handleSave(updatedEntries);
    handleCloseContextMenu();
  };

  return (
    <Paper 
      sx={{
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.light',
        }
      }}
    >
      <Box>
        <Box 
          onContextMenu={(e) => handleContextMenu(e)}
          sx={{ 
            borderColor: 'divider',
            borderRadius: '8px'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: '80px 1fr 100px 100px 120px 40px',
              gap: 1,
              p: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption">Time</Typography>
            <Typography variant="caption">Activity</Typography>
            <Typography variant="caption">Status</Typography>
            <Typography variant="caption">Priority</Typography>
            <Typography variant="caption">Assignee</Typography>
            <Box />
          </Box>

          {/* Rows */}
          {entries.map(entry => (
            <Box 
              key={entry.id}
              onContextMenu={(e) => {
                e.stopPropagation(); // Stop event bubbling
                handleContextMenu(e, entry.id);
              }}
              sx={{ 
                display: 'grid',
                gridTemplateColumns: '80px 1fr 100px 100px 120px 40px',
                gap: 1,
                p: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                },
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              {/* Time */}
              {editingCell?.id === entry.id && editingCell.field === 'time' ? (
                <TextField
                  size="small"
                  value={entry.time}
                  onChange={(e) => handleCellChange(entry.id, 'time', e.target.value)}
                  onBlur={() => setEditingCell(null)}
                  autoFocus
                  placeholder="Enter time..."
                  sx={textFieldStyles}
                />
              ) : (
                <Typography 
                  variant="body2" 
                  onClick={() => setEditingCell({ id: entry.id, field: 'time' })}
                  sx={cellStyles}
                >
                  {entry.time}
                </Typography>
              )}

              {/* Activity */}
              {editingCell?.id === entry.id && editingCell.field === 'activity' ? (
                <TextField
                  size="small"
                  value={entry.activity}
                  onChange={(e) => handleCellChange(entry.id, 'activity', e.target.value)}
                  onBlur={() => setEditingCell(null)}
                  autoFocus
                  placeholder="Enter activity..."
                  sx={textFieldStyles}
                />
              ) : (
                <Typography 
                  variant="body2" 
                  onClick={() => setEditingCell({ id: entry.id, field: 'activity' })}
                  sx={{
                    ...cellStyles,
                    color: entry.activity ? 'text.primary' : 'text.secondary'
                  }}
                >
                  {entry.activity || 'Click to add...'}
                </Typography>
              )}

              {/* Status */}
              <Box
                onClick={() => {
                  const currentIndex = STATUS_OPTIONS.indexOf(entry.status);
                  const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
                  handleCellChange(entry.id, 'status', STATUS_OPTIONS[nextIndex]);
                }}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  cursor: 'pointer'
                }}
              >
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    color: STATUS_COLORS[entry.status].color(theme),
                    bgcolor: STATUS_COLORS[entry.status].bgColor(theme),
                    width: 'fit-content',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      filter: 'brightness(0.95)'
                    }
                  }}
                >
                  {entry.status}
                </Box>
              </Box>

              {/* Priority */}
              <Box
                onClick={() => {
                  const currentIndex = PRIORITY_OPTIONS.indexOf(entry.priority);
                  const nextIndex = (currentIndex + 1) % PRIORITY_OPTIONS.length;
                  handleCellChange(entry.id, 'priority', PRIORITY_OPTIONS[nextIndex]);
                }}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  cursor: 'pointer'
                }}
              >
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    color: PRIORITY_COLORS[entry.priority].color(theme),
                    bgcolor: PRIORITY_COLORS[entry.priority].bgColor(theme),
                    width: 'fit-content',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      filter: 'brightness(0.95)'
                    }
                  }}
                >
                  {entry.priority}
                </Box>
              </Box>

              {/* Assignee */}
              {editingCell?.id === entry.id && editingCell.field === 'assignee' ? (
                <TextField
                  size="small"
                  value={entry.assignee || ''}
                  onChange={(e) => handleCellChange(entry.id, 'assignee', e.target.value)}
                  onBlur={() => setEditingCell(null)}
                  autoFocus
                  placeholder="Enter assignee..."
                  sx={textFieldStyles}
                />
              ) : (
                <Typography 
                  variant="body2" 
                  onClick={() => setEditingCell({ id: entry.id, field: 'assignee' })}
                  sx={{
                    ...cellStyles,
                    color: entry.assignee ? 'text.primary' : 'text.secondary'
                  }}
                >
                  {entry.assignee || 'Click to add...'}
                </Typography>
              )}

              {/* Delete */}
              <IconButton 
                size="small" 
                onClick={() => handleDeleteRow(entry.id)}
                sx={{
                  opacity: 0,
                  '.MuiBox-root:hover &': {
                    opacity: 1
                  }
                }}
              >
                <Delete01Icon size={16} />
              </IconButton>
            </Box>
          ))}

          {/* Add Row */}
          <Button
            fullWidth
            onClick={handleAddRow}
            
            startIcon={<Add01Icon size={16} />}
            sx={{ 
              color: 'text.secondary',
              
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
              py: 1,
              borderColor: 'divider',
              textTransform: 'none',
              borderRadius: 0
            }}
          >
            New
          </Button>
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
          PaperProps={{
            elevation: 0,
            sx: {
              minWidth: 160,
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              '& .MuiMenuItem-root': {
                fontSize: '0.875rem',
                py: 1,
                px: 1.5,
                borderRadius: 0.75,
                mx: 0.5,
                my: '2px'
              }
            }
          }}
        >
          {contextMenu?.entryId ? [
            <MenuItem key="add-above" onClick={handleAddEntryAbove}>
              <ArrowUp01Icon size={18} style={{ marginRight: 8 }} />
              Add entry above
            </MenuItem>,
            <MenuItem key="add-below" onClick={handleAddEntryBelow}>
              <ArrowDown01Icon size={18} style={{ marginRight: 8 }} />
              Add entry below
            </MenuItem>,
            <MenuItem key="move-up" onClick={handleMoveEntryUp}>
              <ArrowUp01Icon size={18} style={{ marginRight: 8 }} />
              Move up
            </MenuItem>,
            <MenuItem key="move-down" onClick={handleMoveEntryDown}>
              <ArrowDown01Icon size={18} style={{ marginRight: 8 }} />
              Move down
            </MenuItem>,
            <MenuItem key="duplicate" onClick={handleDuplicateEntry}>
              <Add01Icon size={18} style={{ marginRight: 8 }} />
              Duplicate
            </MenuItem>,
            <Divider key="divider" sx={{ my: 0.5, mx: 1 }} />,
            <MenuItem 
              key="delete"
              onClick={handleDeleteEntry} 
              sx={{ 
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.lighter'
                }
              }}
            >
              <Delete01Icon size={18} style={{ marginRight: 8 }} />
              Delete entry
            </MenuItem>
          ] : [
            <MenuItem key="sort" onClick={handleSortByTime}>
              <ArrowDown01Icon size={18} style={{ marginRight: 8 }} />
              Sort by time
            </MenuItem>,
            <MenuItem key="complete-all" onClick={handleMarkAllComplete}>
              <Clock01Icon size={18} style={{ marginRight: 8 }} />
              Mark all as completed
            </MenuItem>,
            <MenuItem key="not-started-all" onClick={handleMarkAllNotStarted}>
              <Clock01Icon size={18} style={{ marginRight: 8 }} />
              Mark all as not started
            </MenuItem>,
            <MenuItem key="clear" onClick={handleClearEntries}>
              <Delete01Icon size={18} style={{ marginRight: 8 }} />
              Clear all entries
            </MenuItem>,
            <Divider key="divider" sx={{ my: 0.5, mx: 1 }} />,
            <MenuItem 
              key="delete"
              onClick={handleDeleteSchedule} 
              sx={{ 
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.lighter'
                }
              }}
            >
              <Delete01Icon size={18} style={{ marginRight: 8 }} />
              Delete schedule
            </MenuItem>
          ]}
        </Menu>
      </Box>
    </Paper>
  );
};

export default ScheduleBlock; 