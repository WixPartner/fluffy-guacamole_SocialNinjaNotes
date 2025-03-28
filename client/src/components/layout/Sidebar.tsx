import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, IconButton, TextField, Menu, MenuItem, Button, useTheme, Skeleton } from '@mui/material';
import {
  Message01Icon,
  Settings01Icon,
  Calendar01Icon,
  File01Icon,
  Delete01Icon,
  QuestionIcon,
  GameIcon,
  ArrowLeft01Icon,
  Menu01Icon,
  Add01Icon,
  MoreVerticalIcon,
  StarIcon,
  Link01Icon,
  Copy01Icon,
  Edit01Icon,
  ArrowUpRight01Icon,
  MoveIcon,
  Delete02Icon,
  RotateClockwiseIcon,
  Drag01Icon,
  DocumentAttachmentIcon,
  FileEditIcon,
  FolderCheckIcon,
  FileDownloadIcon,
  Video01Icon,
  MusicNote01Icon,
  HeadphonesIcon,
  School01Icon,
  Book01Icon,
  GlobalEducationIcon,
  Notebook01Icon,
  Briefcase01Icon,
  Calculator01Icon,
  ChartAverageIcon,
  Presentation01Icon,
  HeartCheckIcon,
  StarsIcon,
  SmileIcon,
  Home01Icon,
  Leaf01Icon,
  Sun01Icon,
  AiCloud01Icon,
  FlowerIcon,
  Database01Icon,
  CloudServerIcon,
  TextWrapIcon,
  ComputerDesk01Icon,
  DatabaseIcon
} from 'hugeicons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { toggleSidebar, fetchPages, fetchTrashedPages, createPage, updatePage, deletePage, restorePage, permanentlyDeletePage, reorderPages, fetchFavorites, addToFavorites, removeFromFavorites } from '../../store/slices/uiSlice';
import { RootState } from '../../store';
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DroppableProps, DropResult } from 'react-beautiful-dnd';
import { Page } from '../../api/pages';
import { addNotification } from '../../store/slices/uiSlice';

const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  
  if (!enabled) {
    return null;
  }
  
  return <Droppable {...props}>{children}</Droppable>;
};

const getIconComponent = (iconName: string): React.ReactNode => {
  const iconMap: { [key: string]: React.ReactNode } = {
    DocumentAttachmentIcon: <DocumentAttachmentIcon size={20} />,
    File01Icon: <File01Icon size={20} />,
    FileEditIcon: <FileEditIcon size={20} />,
    FolderCheckIcon: <FolderCheckIcon size={20} />,
    FileDownloadIcon: <FileDownloadIcon size={20} />,
    Video01Icon: <Video01Icon size={20} />,
    MusicNote01Icon: <MusicNote01Icon size={20} />,
    HeadphonesIcon: <HeadphonesIcon size={20} />,
    School01Icon: <School01Icon size={20} />,
    Book01Icon: <Book01Icon size={20} />,
    GlobalEducationIcon: <GlobalEducationIcon size={20} />,
    Notebook01Icon: <Notebook01Icon size={20} />,
    Briefcase01Icon: <Briefcase01Icon size={20} />,
    Calculator01Icon: <Calculator01Icon size={20} />,
    ChartAverageIcon: <ChartAverageIcon size={20} />,
    Presentation01Icon: <Presentation01Icon size={20} />,
    HeartCheckIcon: <HeartCheckIcon size={20} />,
    StarsIcon: <StarsIcon size={20} />,
    SmileIcon: <SmileIcon size={20} />,
    Home01Icon: <Home01Icon size={20} />,
    Leaf01Icon: <Leaf01Icon size={20} />,
    Sun01Icon: <Sun01Icon size={20} />,
    AiCloud01Icon: <AiCloud01Icon size={20} />,
    FlowerIcon: <FlowerIcon size={20} />,
    Database01Icon: <Database01Icon size={20} />,
    CloudServerIcon: <CloudServerIcon size={20} />,
    TextWrapIcon: <TextWrapIcon size={20} />,
    ComputerDesk01Icon: <ComputerDesk01Icon size={20} />,
    DatabaseIcon: <DatabaseIcon size={20} />
  };

  return iconMap[iconName] ?? <File01Icon size={20} />;
};

const PageSkeleton = () => {
  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 1,
        p: 1,
        opacity: 0.7,
        animation: 'pulse 1.5s ease-in-out infinite',
        '@keyframes pulse': {
          '0%': { opacity: 0.7 },
          '50%': { opacity: 0.4 },
          '100%': { opacity: 0.7 },
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
        <Skeleton variant="circular" width={20} height={20} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Skeleton 
            variant="text" 
            width={Math.random() * (80 - 60) + 60 + '%'} 
            sx={{ 
              fontSize: '0.9rem',
              transform: 'scale(1, 0.8)',
              my: '2px'
            }}
          />
        }
      />
    </ListItem>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const customPages = useSelector((state: RootState) => state.ui.customPages);
  const trashedPages = useSelector((state: RootState) => state.ui.trashedPages);
  const favorites = useSelector((state: RootState) => state.ui.favorites);
  const isInitializing = useSelector((state: RootState) => state.ui.isInitializing);
  const isActive = (path: string) => location.pathname === path;
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [trashAnchorEl, setTrashAnchorEl] = useState<null | HTMLElement>(null);
  const [renamingPage, setRenamingPage] = useState<Page | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    void dispatch(fetchPages());
    void dispatch(fetchTrashedPages());
    void dispatch(fetchFavorites());
  }, [dispatch]);

  const handleCreatePage = () => {
    setIsCreatingPage(true);
  };

  const handleNewPageSubmit = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && newPageName.trim()) {
      try {
        const path = `/pages/${newPageName.toLowerCase().replace(/\s+/g, '-')}`;
        await dispatch(createPage({ name: newPageName, path })).unwrap();
        setIsCreatingPage(false);
        setNewPageName('');
        navigate(path);
      } catch (error: any) {
        dispatch(addNotification({
          type: 'error',
          message: error.message || 'Failed to create page'
        }));
      }
    } else if (e.key === 'Escape') {
      setIsCreatingPage(false);
      setNewPageName('');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, page: Page) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedPage(page);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedPage(null);
  };

  const handleDuplicate = async () => {
    if (selectedPage) {
      const newName = `${selectedPage.name} (copy)`;
      const newPath = `/pages/${newName.toLowerCase().replace(/\s+/g, '-')}`;
      await dispatch(createPage({ 
        name: newName, 
        path: newPath,
        blocks: selectedPage.blocks
      })).unwrap();
    }
    handleMenuClose();
  };

  const handleRename = () => {
    if (selectedPage) {
      setNewName(selectedPage.name);
      setMenuAnchorEl(null);
      setTimeout(() => {
        setRenamingPage(selectedPage);
      }, 0);
      setSelectedPage(null);
    }
  };

  const handleRenameSubmit = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && newName.trim() && renamingPage) {
      try {
        const newPath = `/pages/${newName.toLowerCase().replace(/\s+/g, '-')}`;
        await dispatch(updatePage({ 
          id: renamingPage._id,
          page: { 
            name: newName, 
            path: newPath 
          }
        })).unwrap();
        setRenamingPage(null);
        setNewName('');
        navigate(newPath);
      } catch (error: any) {
        dispatch(addNotification({
          type: 'error',
          message: error.message || 'Failed to rename page'
        }));
      }
    } else if (e.key === 'Escape') {
      setRenamingPage(null);
      setNewName('');
    }
  };

  const handleRenameBlur = async () => {
    if (newName.trim() && renamingPage && newName !== renamingPage.name) {
      const newPath = `/pages/${newName.toLowerCase().replace(/\s+/g, '-')}`;
      await dispatch(updatePage({ 
        id: renamingPage._id,
        page: { name: newName, path: newPath }
      })).unwrap();
    }
    setRenamingPage(null);
    setNewName('');
  };

  const handleMoveToTrash = async (e: React.MouseEvent) => {
    try {
      if (!selectedPage) return;
      
      // Close menu first
      handleMenuClose();
      
      // Wait for menu animation to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Then delete the page
      await dispatch(deletePage(selectedPage._id)).unwrap();
      
      // If we're on the page being deleted, navigate to another page
      if (location.pathname === selectedPage.path) {
        // Find the next page to navigate to
        const currentIndex = customPages.findIndex(p => p._id === selectedPage._id);
        const nextPage = customPages[currentIndex + 1] || customPages[currentIndex - 1];
        
        // If there's another page, navigate to it
        if (nextPage) {
          navigate(nextPage.path);
        } else {
          // If no pages left, go to dashboard
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to move page to trash'
      }));
    }
  };

  const handleTrashClick = (event: React.MouseEvent<HTMLElement>) => {
    setTrashAnchorEl(event.currentTarget);
  };

  const handleTrashClose = () => {
    setTrashAnchorEl(null);
  };

  const handleRestore = async (page: Page) => {
    try {
      await dispatch(restorePage(page._id)).unwrap();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to restore page'
      }));
    }
  };

  const handlePermanentDelete = async (page: Page) => {
    try {
      await dispatch(permanentlyDeletePage(page._id)).unwrap();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to permanently delete page'
      }));
    }
  };

  const handleEmptyTrash = async () => {
    for (const page of trashedPages) {
      await dispatch(permanentlyDeletePage(page._id)).unwrap();
    }
    handleTrashClose();
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    try {
      const reorderedPages = Array.from(customPages);
      const [removed] = reorderedPages.splice(source.index, 1);
      reorderedPages.splice(destination.index, 0, removed);

      // Map pages to include their new order
      const updatedPages = reorderedPages.map((page, index) => ({
        _id: page._id,
        order: index
      }));

      await dispatch(reorderPages(updatedPages));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to reorder pages. Please try again.'
      }));
    }
  };

  const handleCopyLink = () => {
    if (selectedPage) {
      navigator.clipboard.writeText(window.location.origin + selectedPage.path);
    }
    handleMenuClose();
  };

  const handleMoveTo = () => {
    // TODO: Implement move to functionality
    handleMenuClose();
  };

  const handleOpenInNewTab = () => {
    if (selectedPage) {
      window.open(selectedPage.path, '_blank');
    }
    handleMenuClose();
  };

  const handleOpenInNewWindow = () => {
    if (selectedPage) {
      window.open(selectedPage.path, '_blank', 'width=1200,height=800');
    }
    handleMenuClose();
  };

  const handleToggleFavorite = async (e: React.MouseEvent, page: Page) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (favorites.some(fav => fav._id === page._id)) {
        await dispatch(removeFromFavorites(page._id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Page removed from favorites'
        }));
      } else {
        await dispatch(addToFavorites(page._id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Page added to favorites'
        }));
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update favorites'
      }));
    }
  };

  return (
    <>
      {/* Menu Button - Visible when sidebar is closed */}
      <IconButton
        onClick={() => dispatch(toggleSidebar())}
        sx={{
          position: 'fixed',
          left: 20,
          top: 10,
          zIndex: 1200,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          opacity: isOpen ? 0 : 1,
          visibility: isOpen ? 'hidden' : 'visible',
          transform: isOpen ? 'translateX(-20px)' : 'translateX(0)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            bgcolor: 'background.paper',
            color: 'primary.main'
          }
        }}
      >
        <Menu01Icon size={24} />
      </IconButton>

      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 1200,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            component={Link}
            to="/"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'primary.main',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            Mentor
          </Typography>
          <IconButton
            onClick={() => dispatch(toggleSidebar())}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'primary.soft'
              }
            }}
          >
            <ArrowLeft01Icon size={24} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

        {/* Main Navigation */}
        <List sx={{ px: 2, py: 2 }}>
          <ListItem
            button
            component={Link}
            to="/dashboard"
            selected={isActive('/dashboard')}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.soft',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.soft'
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                }
              },
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <Home01Icon size={20} />
            </ListItemIcon>
            <ListItemText 
              primary="Home" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: isActive('/dashboard') ? 600 : 500
              }} 
            />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/inbox"
            selected={isActive('/inbox')}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.soft',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.soft'
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                }
              },
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <Message01Icon size={20} />
            </ListItemIcon>
            <ListItemText 
              primary="Inbox" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: isActive('/inbox') ? 600 : 500
              }} 
            />
          </ListItem>
        </List>

        <Divider sx={{ mx: 2, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

        {/* Private Section */}
        <Box sx={{ 
          px: 3, 
          py: 2,
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: favorites.length > 0 ? '50%' : '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
              Private
            </Typography>
            <IconButton
              size="small"
              onClick={handleCreatePage}
              sx={{
                padding: '2px',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'primary.soft'
                }
              }}
            >
              <Add01Icon size={16} />
            </IconButton>
          </Box>
          <Box sx={{
            flex: 1,
            overflow: 'auto',
            mt: 1,
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <StrictModeDroppable droppableId="pages">
                {(provided) => (
                  <List 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {isInitializing ? (
                      <>
                        <PageSkeleton />
                        <PageSkeleton />
                        <PageSkeleton />
                      </>
                    ) : (
                      <StrictModeDroppable droppableId="pages">
                        {(provided) => (
                          <List 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{
                              width: '100%',
                              p: 0
                            }}
                          >
                            {isCreatingPage && (
                              <ListItem
                                sx={{
                                  borderRadius: 2,
                                  mb: 1,
                                  p: 1,
                                }}
                              >
                                <TextField
                                  autoFocus
                                  fullWidth
                                  size="small"
                                  value={newPageName}
                                  onChange={(e) => setNewPageName(e.target.value)}
                                  onKeyDown={handleNewPageSubmit}
                                  onBlur={() => {
                                    setIsCreatingPage(false);
                                    setNewPageName('');
                                  }}
                                  placeholder="Enter page name..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: '0.9rem',
                                    }
                                  }}
                                />
                              </ListItem>
                            )}
                            {customPages.map((page, index) => (
                              <Draggable 
                                key={page._id}
                                draggableId={page._id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <ListItem
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    button
                                    component={renamingPage?.path === page.path ? 'div' : Link}
                                    to={renamingPage?.path === page.path ? undefined : page.path}
                                    selected={isActive(page.path)}
                                    sx={{
                                      borderRadius: 2,
                                      mb: 1,
                                      color: 'text.primary',
                                      textDecoration: 'none',
                                      '&:active': {
                                        color: 'text.primary'
                                      },
                                      '&.Mui-selected': {
                                        bgcolor: 'primary.soft',
                                        color: 'primary.main',
                                        '& .MuiListItemIcon-root': {
                                          color: 'primary.main'
                                        }
                                      },
                                      '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'text.primary',
                                        '& .MuiListItemIcon-root': {
                                          color: 'primary.main'
                                        },
                                        '& .more-options': {
                                          opacity: 1
                                        }
                                      },
                                      ...(snapshot.isDragging && {
                                        bgcolor: 'primary.soft',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                      }),
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                      {page.icon ? getIconComponent(page.icon) : <File01Icon size={20} />}
                                    </ListItemIcon>
                                    {renamingPage?.path === page.path ? (
                                      <TextField
                                        autoFocus
                                        fullWidth
                                        size="small"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={handleRenameSubmit}
                                        onBlur={handleRenameBlur}
                                        sx={{
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            fontSize: '0.9rem',
                                            '& input': {
                                              padding: '4px 8px'
                                            }
                                          }
                                        }}
                                      />
                                    ) : (
                                      <>
                                        <ListItemText 
                                          primary={page.name} 
                                          primaryTypographyProps={{ 
                                            fontSize: '0.9rem',
                                            fontWeight: isActive(page.path) ? 600 : 500,
                                            noWrap: true,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                        />
                                        <Box
                                          className="more-options"
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            ml: 1,
                                          }}
                                        >
                                          <IconButton
                                            size="small"
                                            {...provided.dragHandleProps}
                                            sx={{
                                              color: 'text.secondary',
                                              '&:hover': {
                                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                                              }
                                            }}
                                          >
                                            <Drag01Icon size={16} />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, page)}
                                            sx={{
                                              color: 'text.secondary',
                                              '&:hover': {
                                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                                              }
                                            }}
                                          >
                                            <MoreVerticalIcon size={16} />
                                          </IconButton>
                                        </Box>
                                      </>
                                    )}
                                  </ListItem>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </List>
                        )}
                      </StrictModeDroppable>
                    )}
                  </List>
                )}
              </StrictModeDroppable>
            </DragDropContext>
          </Box>
        </Box>

        {/* Favorites section */}
        {favorites.length > 0 && (
          <>
            <Divider sx={{ mx: 2, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
            <Box sx={{ 
              px: 3, 
              py: 2,
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '50%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon size={14} style={{ opacity: 0.8 }} />
                  Favorites
                </Typography>
              </Box>

              <Box sx={{
                flex: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}>
                <List>
                  {favorites.map((page) => (
                    <ListItem
                      key={page._id}
                      component={Link}
                      to={page.path}
                      selected={isActive(page.path)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        color: 'text.primary',
                        textDecoration: 'none',
                        '&:active': {
                          color: 'text.primary'
                        },
                        '&.Mui-selected': {
                          bgcolor: 'primary.soft',
                          color: 'primary.main',
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main'
                          }
                        },
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          color: 'text.primary',
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main'
                          },
                          '& .actions': {
                            opacity: 1
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                        {getIconComponent(page.icon || 'File01Icon')}
                      </ListItemIcon>
                      <ListItemText
                        primary={page.name}
                        primaryTypographyProps={{ 
                          fontSize: '0.9rem',
                          fontWeight: isActive(page.path) ? 600 : 500,
                          noWrap: true,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                      <Box
                        className="actions"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          ml: 1
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleToggleFavorite(e, page)}
                          sx={{
                            color: 'warning.main',
                            '&:hover': {
                              bgcolor: 'warning.soft'
                            }
                          }}
                        >
                          <StarIcon size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, page)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <MoreVerticalIcon size={16} />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </>
        )}

        <Box sx={{ mt: 'auto', px: 3, py: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
            Workspace
          </Typography>
          <List sx={{ mt: 1 }}>
            {[
              { path: '/calendar', icon: <Calendar01Icon size={20} />, label: 'Calendar' },
              { path: '/templates', icon: <File01Icon size={20} />, label: 'Templates' },
              { path: '/settings', icon: <Settings01Icon size={20} />, label: 'Settings' },
              { 
                path: '#', 
                icon: <Delete01Icon size={20} />, 
                label: 'Trash',
                onClick: handleTrashClick,
                badge: trashedPages.length || undefined
              },
              { path: '/help', icon: <QuestionIcon size={20} />, label: 'Help' }
            ].map((item) => (
              <ListItem
                key={item.path}
                button
                component={item.onClick ? 'div' : Link}
                to={item.onClick ? undefined : item.path}
                onClick={item.onClick}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.soft',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main'
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive(item.path) ? 600 : 500
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      ml: 1,
                      bgcolor: 'primary.soft',
                      color: 'primary.main',
                      borderRadius: '10px',
                      px: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left'
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '12px',
            boxShadow: '0 0 0 1px rgba(15, 15, 15, 0.05), 0 3px 6px rgba(15, 15, 15, 0.1), 0 9px 24px rgba(15, 15, 15, 0.2)',
            minWidth: 260,
            maxWidth: 320,
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#ffffff' : '#2f3437',
            color: (theme) => theme.palette.mode === 'light' ? '#37352f' : '#ffffff',
            overflow: 'hidden',
            p: 0.5,
            '& .MuiMenuItem-root': {
              py: 0.75,
              px: 1.5,
              gap: 1.5,
              fontSize: '14px',
              color: 'inherit',
              borderRadius: '8px',
              mx: 0.5,
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
              }
            },
            '& .MuiDivider-root': {
              my: 0.5,
              mx: 1,
              borderColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'
            }
          }
        }}
      >
        {selectedPage && (
          favorites.some(fav => fav._id === selectedPage._id) ? (
            <MenuItem onClick={() => {
              handleToggleFavorite(new MouseEvent('click') as any, selectedPage);
              handleMenuClose();
            }}>
              <StarIcon size={16} style={{ opacity: 0.8, color: theme.palette.warning.main }} />
              <Box sx={{ flex: 1 }}>Remove from Favorites</Box>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => {
              handleToggleFavorite(new MouseEvent('click') as any, selectedPage);
              handleMenuClose();
            }}>
              <StarIcon size={16} style={{ opacity: 0.8 }} />
              <Box sx={{ flex: 1 }}>Add to Favorites</Box>
            </MenuItem>
          )
        )}
        <MenuItem onClick={handleCopyLink}>
          <Link01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Copy link</Box>
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <Copy01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Duplicate</Box>
        </MenuItem>
        <MenuItem onClick={handleRename}>
          <Edit01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Rename</Box>
        </MenuItem>
        <MenuItem onClick={handleMoveTo}>
          <MoveIcon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Move to</Box>
        </MenuItem>
        <MenuItem onClick={handleMoveToTrash}>
          <Delete02Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Move to Trash</Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenInNewTab}>
          <ArrowUpRight01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Open in new tab</Box>
        </MenuItem>
        <MenuItem onClick={handleOpenInNewWindow}>
          <ArrowUpRight01Icon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Open in new window</Box>
        </MenuItem>
        <MenuItem onClick={handleMoveTo}>
          <MoveIcon size={16} style={{ opacity: 0.8 }} />
          <Box sx={{ flex: 1 }}>Open in side peek</Box>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={trashAnchorEl}
        open={Boolean(trashAnchorEl)}
        onClose={handleTrashClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
              Trash
            </Typography>
            {trashedPages.length > 0 && (
              <Button
                startIcon={<Delete02Icon size={16} />}
                onClick={handleEmptyTrash}
                color="error"
                size="small"
              >
                Empty
              </Button>
            )}
          </Box>
          <TextField
            size="small"
            fullWidth
            placeholder="Search pages in Trash"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'action.hover',
                '& fieldset': {
                  border: 'none'
                }
              }
            }}
          />
        </Box>
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {trashedPages.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                No items in trash
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {trashedPages.map((page) => (
                <ListItem
                  key={page.path}
                  sx={{
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      '& .restore-delete': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <File01Icon size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary={page.name}
                    secondary={page.deletedAt ? new Date(page.deletedAt).toLocaleDateString() : ''}
                    primaryTypographyProps={{
                      fontSize: '0.9rem'
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem'
                    }}
                  />
                  <Box
                    className="restore-delete"
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      gap: 0.5
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
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover'
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Pages in Trash for over 30 days will be automatically deleted
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default Sidebar; 