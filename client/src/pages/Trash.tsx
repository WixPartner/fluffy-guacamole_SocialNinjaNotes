import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { File01Icon, RotateClockwiseIcon, Delete02Icon } from 'hugeicons-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { restorePage, permanentlyDeletePage } from '../store/slices/uiSlice';
import { Page } from '../api/pages';
import { useState } from 'react';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `Deleted ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const Trash = () => {
  const dispatch = useDispatch<AppDispatch>();
  const trashedPages = useSelector((state: RootState) => state.ui.trashedPages);

  const handleRestore = async (page: Page) => {
    await dispatch(restorePage(page._id)).unwrap();
  };

  const handlePermanentDelete = async (page: Page) => {
    await dispatch(permanentlyDeletePage(page._id)).unwrap();
  };

  const handleEmptyTrash = async () => {
    for (const page of trashedPages) {
      await dispatch(permanentlyDeletePage(page._id)).unwrap();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Trash</Typography>
        {trashedPages.length > 0 && (
          <IconButton onClick={handleEmptyTrash} color="error">
            <Delete02Icon size={20} />
          </IconButton>
        )}
      </Box>

      {trashedPages.length === 0 ? (
        <Typography color="text.secondary">No items in trash</Typography>
      ) : (
        <List>
          {trashedPages.map((page) => (
            <ListItem
              key={page._id}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  '& .restore-delete': {
                    opacity: 1
                  }
                }
              }}
            >
              <ListItemIcon>
                <File01Icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={page.name}
                secondary={formatDate(page.deletedAt)}
              />
              <Box
                className="restore-delete"
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  gap: 1
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleRestore(page)}
                  sx={{ color: 'primary.main' }}
                >
                  <RotateClockwiseIcon size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handlePermanentDelete(page)}
                  sx={{ color: 'error.main' }}
                >
                  <Delete02Icon size={16} />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Trash; 