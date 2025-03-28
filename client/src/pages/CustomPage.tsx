import { Box, Typography, Paper, IconButton, Menu, MenuItem, Tooltip, Divider, Avatar, useTheme, TextField, CircularProgress, Fade } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import { addBlock, updateBlock, deleteBlock, updatePageIcon, addToRecentlyVisited, fetchPageByPath, addToFavorites, removeFromFavorites, fetchFavorites, addNotification } from '../store/slices/uiSlice';
import { useState, useEffect } from 'react';
import { Block, Page, TableRow as TableRowType } from '../api/pages';
import TextBlock from '../components/blocks/TextBlock';
import BulletListBlock from '../components/blocks/BulletListBlock';
import NumberListBlock from '../components/blocks/NumberListBlock';
import TodoListBlock from '../components/blocks/TodoListBlock';
import ToggleListBlock from '../components/blocks/ToggleListBlock';
import Heading1Block from '../components/blocks/Heading1Block';
import Heading2Block from '../components/blocks/Heading2Block';
import Heading3Block from '../components/blocks/Heading3Block';
import TableBlock from '../components/blocks/TableBlock';
import ScheduleBlock from '../components/blocks/ScheduleBlock';
import PictureBlock from '../components/blocks/PictureBlock';
import CodeBlock from '../components/blocks/CodeBlock';
import EquationBlock from '../components/blocks/EquationBlock';
import FileBlock from '../components/blocks/FileBlock';
import {
  MoreHorizontalIcon,
  Share01Icon,
  StarIcon,
  Copy01Icon,
  FileExportIcon,
  Delete01Icon,
  Add01Icon,
  Image01Icon,
  TextIcon,
  CodeIcon,
  Table01Icon,
  ListViewIcon,
  Clock01Icon,
  GridIcon,
  File01Icon,
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
  DatabaseIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  CheckListIcon,
  ArrowRight01Icon,
  FunctionIcon,
  Calendar01Icon,
  UserIcon,
  AtIcon
} from 'hugeicons-react';
import BlockCommandMenu from '../components/menus/BlockCommandMenu';
import { formatDistanceToNow } from 'date-fns';
import MessageInput from '../components/MessageInput';
import { nanoid } from 'nanoid';
import { useBlockPermissions } from '../utils/blockPermissions';

const iconCategories = [
  {
    name: 'Document',
    icons: [
      { icon: <DocumentAttachmentIcon size={20} />, value: 'DocumentAttachmentIcon' },
      { icon: <File01Icon size={20} />, value: 'File01Icon' },
      { icon: <FileEditIcon size={20} />, value: 'FileEditIcon' },
      { icon: <FolderCheckIcon size={20} />, value: 'FolderCheckIcon' },
      { icon: <FileDownloadIcon size={20} />, value: 'FileDownloadIcon' },
    ]
  },
  {
    name: 'Media',
    icons: [
      { icon: <Image01Icon size={20} />, value: 'Image01Icon' },
      { icon: <Video01Icon size={20} />, value: 'Video01Icon' },
      { icon: <MusicNote01Icon size={20} />, value: 'MusicNote01Icon' },
      { icon: <HeadphonesIcon size={20} />, value: 'HeadphonesIcon' },
    ]
  },
  {
    name: 'Education',
    icons: [
      { icon: <School01Icon size={20} />, value: 'School01Icon' },
      { icon: <Book01Icon size={20} />, value: 'Book01Icon' },
      { icon: <GlobalEducationIcon size={20} />, value: 'GlobalEducationIcon' },
      { icon: <Notebook01Icon size={20} />, value: 'Notebook01Icon' },
    ]
  },
  {
    name: 'Work',
    icons: [
      { icon: <Briefcase01Icon size={20} />, value: 'Briefcase01Icon' },
      { icon: <Calculator01Icon size={20} />, value: 'Calculator01Icon' },
      { icon: <ChartAverageIcon size={20} />, value: 'ChartAverageIcon' },
      { icon: <Presentation01Icon size={20} />, value: 'Presentation01Icon' },
    ]
  },
  {
    name: 'Personal',
    icons: [
      { icon: <HeartCheckIcon size={20} />, value: 'HeartCheckIcon' },
      { icon: <StarsIcon size={20} />, value: 'StarsIcon' },
      { icon: <SmileIcon size={20} />, value: 'SmileIcon' },
      { icon: <Home01Icon size={20} />, value: 'Home01Icon' },
    ]
  },
  {
    name: 'Nature',
    icons: [
      { icon: <Leaf01Icon size={20} />, value: 'Leaf01Icon' },
      { icon: <Sun01Icon size={20} />, value: 'Sun01Icon' },
      { icon: <AiCloud01Icon size={20} />, value: 'AiCloud01Icon' },
      { icon: <FlowerIcon size={20} />, value: 'FlowerIcon' },
    ]
  },
  {
    name: 'Tech',
    icons: [
      { icon: <CodeIcon size={20} />, value: 'CodeIcon' },
      { icon: <DatabaseIcon size={20} />, value: 'DatabaseIcon' },
      { icon: <CloudServerIcon size={20} />, value: 'CloudServerIcon' },
      { icon: <ComputerDesk01Icon size={20} />, value: 'ComputerDesk01Icon' },
    ]
  },
];

const BlockButton = ({ 
  icon, 
  label, 
  onClick, 
  blockType 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  blockType?: string;
}) => {
  const { isBlockTypeAllowed } = useBlockPermissions();
  const allowed = blockType ? isBlockTypeAllowed(blockType) : true;
  
  return (
    <Tooltip title={allowed ? label : `${label} (Upgrade required)`}>
      <span>
        <IconButton
          size="small"
          sx={{
            color: allowed ? 'text.secondary' : 'text.disabled',
            '&:hover': {
              color: allowed ? 'primary.main' : 'text.disabled',
              backgroundColor: allowed ? 'action.hover' : 'transparent'
            },
            opacity: allowed ? 1 : 0.6
          }}
          onClick={allowed ? onClick : undefined}
          disabled={!allowed}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

const CustomPage = () => {
  const { pagePath } = useParams();
  const dispatch = useAppDispatch();
  const customPages = useSelector((state: RootState) => state.ui.customPages);
  const isInitializing = useSelector((state: RootState) => state.ui.isInitializing);
  const page = customPages.find(p => p.path === pagePath || p.path === `/pages/${pagePath}`);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [commandMenuAnchorEl, setCommandMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const theme = useTheme();
  const [menuAnchorRef, setMenuAnchorRef] = useState<HTMLDivElement | null>(null);
  const [iconMenuAnchorEl, setIconMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [newBlockIds, setNewBlockIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const favorites = useSelector((state: RootState) => state.ui.favorites);
  const isFavorite = favorites.some(favPage => favPage._id === page?._id);

  useEffect(() => {
    const loadPage = async () => {
      if (!pagePath || isInitializing) return;
      
      if (!page) {
        setIsLoading(true);
        try {
          await dispatch(fetchPageByPath(pagePath)).unwrap();
        } catch (error) {
          console.error('Failed to fetch page:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPage();
  }, [pagePath, page, isInitializing, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't show menu if we're in a text input or contenteditable element
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && 
          (activeElement.isContentEditable || 
           activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === '/' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setCommandMenuAnchorEl(menuAnchorRef);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuAnchorRef]);

  const handleCommandMenuClose = () => {
    setCommandMenuAnchorEl(null);
  };

  const handleBlockTypeSelect = (blockType: string) => {
    if (!page) return;

    // Map the block type to match server schema
    const blockTypeMap: { [key: string]: Block['type'] } = {
      'text': 'text',
      'heading1': 'heading1',
      'heading2': 'heading2',
      'heading3': 'heading3',
      'bullet-list': 'bullet-list',
      'numbered-list': 'number-list',
      'todo-list': 'todo-list',
      'toggle-list': 'toggle-list',
      'table': 'table',
      'schedule': 'schedule',
      'picture': 'picture',
      'code': 'code',
      'equation': 'equation',
      'file': 'file'
    };

    // Get default content based on block type
    const getDefaultContent = (type: string) => {
      switch (type) {
        case 'heading1':
        case 'heading2':
        case 'heading3':
          return 'Heading';
        case 'bullet-list':
        case 'number-list':
        case 'todo-list':
          return 'List item';
        case 'toggle-list':
          return 'Toggle item';
        case 'table':
        case 'schedule':
          return '';
        case 'equation':
          return '';
        case 'code':
          return '// Write your code here';
        case 'file':
          return '';  // Empty content for file blocks
        case 'text':
        default:
          return 'Type something...';
      }
    };

    const newBlock: Block = {
      id: Date.now().toString(),
      type: blockTypeMap[blockType] || 'text',
      content: blockType === 'table' || blockType === 'schedule' ? '' : getDefaultContent(blockTypeMap[blockType] || 'text'),
      checked: blockType === 'todo-list' ? false : undefined,
      toggleContent: blockType === 'toggle-list' ? [] : undefined,
      // Initialize equation-specific properties
      ...(blockType === 'equation' && {
        mathMode: 'display',
        latex: '\\sum_{i=1}^n i = \\frac{n(n+1)}{2}'  // Default example equation
      }),
      // Initialize table/schedule properties
      ...((blockType === 'table') && {
        rows: [
          // Header row
          {
            id: nanoid(),
            cells: Array(3).fill(null).map((_, index) => ({
              id: nanoid(),
              content: ``
            })),
            columnWidths: [200, 200, 200]
          },
          // Empty data rows
          {
            id: nanoid(),
            cells: Array(3).fill(null).map(() => ({
              id: nanoid(),
              content: ''
            })),
            columnWidths: [200, 200, 200]
          },
          {
            id: nanoid(),
            cells: Array(3).fill(null).map(() => ({
              id: nanoid(),
              content: ''
            })),
            columnWidths: [200, 200, 200]
          }
        ],
      })
    };

    console.log('Adding block:', { pageId: page._id, block: newBlock });
    dispatch(addBlock({ pageId: page._id, block: newBlock }));
    handleCommandMenuClose();
  };

  useEffect(() => {
    if (page) {
      dispatch(addToRecentlyVisited({
        id: page._id,
        title: page.name,
        path: page.path,
        icon: page.icon || 'File01Icon'
      }));
    }
  }, [page?._id, dispatch]);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleFavoriteToggle = async () => {
    if (!page) return;

    try {
      if (isFavorite) {
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

  // Show loading state while initializing or loading page
  if (isInitializing || isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show not found only after initialization and loading
  if (!page) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Page not found</Typography>
      </Box>
    );
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleAddTextBlock = () => {
    if (!page) return;
    
    const newBlock: Block = {
      id: Date.now().toString(),
      type: 'text',
      content: 'Type something...'
    };
    
    console.log('Adding text block:', { pageId: page._id, block: newBlock });
    dispatch(addBlock({ pageId: page._id, block: newBlock }));
  };

  const handleUpdateBlock = (
    id: string, 
    content: string, 
    checkedOrLanguage?: boolean | string, 
    toggleContent?: Block[], 
    rows?: TableRowType[],
    columns?: number,
    language?: string,
    mathMode?: 'inline' | 'display',
    latex?: string,
    fileProps?: {
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      fileKey?: string;
      downloadUrl?: string;
    }
  ) => {
    if (!page) return;

    const block = page.blocks.find(b => b.id === id);
    if (!block) return;

    // For code blocks, the third parameter is language
    // For todo lists, it's checked
    // For toggle lists, we use the fourth parameter for toggleContent
    // For equation blocks, we use mathMode and latex parameters
    // For file blocks, we use fileProps
    const updateData = {
      pagePath: page._id,
      blockId: id,
      content,
      type: block.type,
      checked: block.type === 'todo-list' ? checkedOrLanguage as boolean : undefined,
      language: block.type === 'code' ? checkedOrLanguage as string : undefined,
      toggleContent,
      rows: rows || block.rows,
      columns,
      mathMode: block.type === 'equation' ? mathMode : undefined,
      latex: block.type === 'equation' ? latex : undefined,
      // Spread file properties if it's a file block
      ...(block.type === 'file' && fileProps ? {
        fileName: fileProps.fileName,
        fileSize: fileProps.fileSize,
        mimeType: fileProps.mimeType,
        fileKey: fileProps.fileKey,
        downloadUrl: fileProps.downloadUrl
      } : {})
    };

    console.log('Updating block:', updateData);
    dispatch(updateBlock(updateData));
  };

  const handleDeleteBlock = (id: string) => {
    dispatch(deleteBlock({ pagePath: page._id, blockId: id }));
  };

  const handleIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setIconMenuAnchorEl(event.currentTarget);
  };

  const handleIconMenuClose = () => {
    setIconMenuAnchorEl(null);
  };

  const handleIconSelect = (iconName: string) => {
    if (!page) return;
    dispatch(updatePageIcon({ pageId: page._id, icon: iconName }));
    handleIconMenuClose();
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return <File01Icon size={20} />;
    for (const category of iconCategories) {
      const icon = category.icons.find(i => i.value === iconName);
      if (icon) return icon.icon;
    }
    return <File01Icon size={20} />;
  };

  const renderBlock = (block: Block) => {
    // Calculate indices for numbered lists
    const calculateNumberedListIndex = (currentBlock: Block): number => {
      if (!page) return 1;
      let index = 1;
      for (const b of page.blocks) {
        if (b.id === currentBlock.id) break;
        if (b.type === 'number-list') index++;
      }
      return index;
    };

    switch (block.type) {
      case 'heading1':
        return (
          <Heading1Block
            key={block.id}
            block={block as Block & { type: 'heading1' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'heading2':
        return (
          <Heading2Block
            key={block.id}
            block={block as Block & { type: 'heading2' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'heading3':
        return (
          <Heading3Block
            key={block.id}
            block={block as Block & { type: 'heading3' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'text':
        return (
          <TextBlock
            key={block.id}
            block={block as Block & { type: 'text' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'bullet-list':
        return (
          <BulletListBlock
            key={block.id}
            block={block as Block & { type: 'bullet-list' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'number-list':
        return (
          <NumberListBlock
            key={block.id}
            block={block as Block & { type: 'number-list' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            index={calculateNumberedListIndex(block)}
          />
        );
      case 'todo-list':
        return (
          <TodoListBlock
            key={block.id}
            block={block as Block & { type: 'todo-list' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'toggle-list':
        return (
          <ToggleListBlock
            key={block.id}
            block={block as Block & { type: 'toggle-list' }}
            onUpdate={(id, content, toggleContent) => handleUpdateBlock(id, content, undefined, toggleContent)}
            onDelete={handleDeleteBlock}
          />
        );
      case 'table':
        return (
          <TableBlock
            key={block.id}
            block={block as Block & { type: 'table' }}
            onUpdateBlock={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'schedule':
        return (
          <ScheduleBlock
            key={block.id}
            block={block as Block & { type: 'schedule' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'picture':
        return (
          <PictureBlock
            key={block.id}
            block={block as Block & { type: 'picture' }}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        );
      case 'code':
        return (
          <CodeBlock
            key={block.id}
            block={block as Block & { type: 'code' }}
            onUpdate={(id, content, language) => handleUpdateBlock(id, content, language)}
            onDelete={handleDeleteBlock}
          />
        );
      case 'equation':
        return (
          <EquationBlock
            key={block.id}
            block={block as Block & { type: 'equation' }}
            onUpdate={(id, content, mathMode, latex) => handleUpdateBlock(id, content, undefined, undefined, undefined, undefined, undefined, mathMode, latex)}
            onDelete={handleDeleteBlock}
          />
        );
      case 'file':
        return (
          <FileBlock
            key={block.id}
            block={block as Block & { type: 'file' }}
            onUpdate={(id, content, fileName, fileSize, mimeType, fileKey, downloadUrl) =>
              handleUpdateBlock(id, content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
                fileName,
                fileSize,
                mimeType,
                fileKey,
                downloadUrl
              })
            }
            onDelete={handleDeleteBlock}
          />
        );
      default:
        return null;
    }
  };

  const handleAIBlocksGenerated = (blocks: Block[]) => {
    if (!page) return;
    
    const newIds = blocks.map(block => {
      const newBlock = {
        ...block,
        id: nanoid()
      };
      dispatch(addBlock({ pageId: page._id, block: newBlock }));
      return newBlock.id;
    });
    
    setNewBlockIds(newIds);
    
    // Clear the newBlockIds after all animations are done
    // 500ms for animation + 200ms delay between blocks + 300ms buffer
    setTimeout(() => {
      setNewBlockIds([]);
    }, (blocks.length * 200) + 800);
  };

  return (
    <Box 
      sx={{ 
        height: '100vh',
        overflow: 'auto',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: isGridVisible ? 0.6 : 0,
          backgroundImage: theme.palette.mode === 'light' 
            ? `
              linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
              linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px),
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: '0 0, 0 0, 50px 50px, 50px 50px',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'opacity 0.3s ease'
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'light'
            ? `
              radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.8), transparent 50%),
              radial-gradient(circle at 0% 50%, rgba(103, 178, 255, 0.1), transparent 50%),
              radial-gradient(circle at 100% 50%, rgba(128, 0, 255, 0.1), transparent 50%)
            `
            : `
              radial-gradient(circle at 50% 0%, rgba(55, 65, 81, 0.8), transparent 50%),
              radial-gradient(circle at 0% 50%, rgba(59, 130, 246, 0.2), transparent 50%),
              radial-gradient(circle at 100% 50%, rgba(139, 92, 246, 0.2), transparent 50%)
            `,
          opacity: isGridVisible ? 0.8 : 0,
          pointerEvents: 'none',
          zIndex: 1,
          animation: isGridVisible ? 'gradient-shift 15s ease infinite' : 'none',
          transition: 'opacity 0.3s ease'
        },
        '@keyframes gradient-shift': {
          '0%, 100%': {
            transform: 'scale(1)'
          },
          '50%': {
            transform: 'scale(1.1)'
          }
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            px: 3,
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                onClick={handleIconClick}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.5,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  opacity: 0.8,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    opacity: 1
                  }
                }}
              >
                {getIconComponent(page?.icon)}
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {page.name}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Clock01Icon size={14} />
                {page.lastEditedAt 
                  ? `Last edited ${formatDistanceToNow(new Date(page.lastEditedAt))} ago`
                  : 'Not edited yet'
                }
              </Typography>
              <Tooltip title={isGridVisible ? "Hide grid" : "Show grid"}>
                <IconButton 
                  size="small" 
                  onClick={() => setIsGridVisible(!isGridVisible)}
                  sx={{
                    color: isGridVisible ? 'primary.main' : 'text.secondary',
                    opacity: isGridVisible ? 1 : 0.5,
                    '&:hover': {
                      color: isGridVisible ? 'primary.dark' : 'primary.main',
                      opacity: 1
                    }
                  }}
                >
                  <GridIcon size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton size="small">
                  <Share01Icon size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <IconButton 
                  size="small" 
                  onClick={handleFavoriteToggle}
                  sx={{
                    color: isFavorite ? 'warning.main' : 'text.secondary',
                    opacity: isFavorite ? 1 : 0.5,
                    '&:hover': {
                      color: isFavorite ? 'warning.dark' : 'warning.main',
                      opacity: 1
                    }
                  }}
                >
                  <StarIcon size={20} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreHorizontalIcon size={20} />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    borderRadius: '12px',
                    mt: 1,
                    minWidth: 180
                  },
                }}
              >
                <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5 }}>
                  <Copy01Icon size={18} /> Duplicate
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5 }}>
                  <FileExportIcon size={18} /> Export
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5, color: 'error.main' }}>
                  <Delete01Icon size={18} /> Delete
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>

        <Box 
          sx={{ 
            maxWidth: 900,
            mx: 'auto',
            px: 4,
            py: 6,
            position: 'relative',
            height: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1,
              mb: 4,
              position: 'sticky',
              top: 80,
              zIndex: 99,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
              bgcolor: theme.palette.mode === 'light'
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: theme.palette.mode === 'light'
                  ? 'rgba(255,255,255,0.4)'
                  : 'rgba(0,0,0,0.3)',
                boxShadow: 'none'
              }
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Basic Blocks */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <BlockButton icon={<TextIcon size={18} />} label="Text" onClick={handleAddTextBlock} blockType="text" />
                <BlockButton icon={<Heading01Icon size={18} />} label="Heading 1" onClick={() => handleBlockTypeSelect('heading1')} blockType="heading1" />
                <BlockButton icon={<Heading02Icon size={18} />} label="Heading 2" onClick={() => handleBlockTypeSelect('heading2')} blockType="heading2" />
                <BlockButton icon={<Heading03Icon size={18} />} label="Heading 3" onClick={() => handleBlockTypeSelect('heading3')} blockType="heading3" />
                <BlockButton icon={<Image01Icon size={18} />} label="Picture" onClick={() => handleBlockTypeSelect('picture')} blockType="picture" />
                <BlockButton icon={<DocumentAttachmentIcon size={18} />} label="File" onClick={() => handleBlockTypeSelect('file')} blockType="file" />
              </Box>

              {/* Category Separator */}
              <Box sx={{ width: '1px', height: 24, bgcolor: 'divider' }} />

              {/* Lists */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <BlockButton icon={<ListViewIcon size={18} />} label="Bullet List" onClick={() => handleBlockTypeSelect('bullet-list')} blockType="bullet-list" />
                <BlockButton icon={<ListViewIcon size={18} />} label="Numbered List" onClick={() => handleBlockTypeSelect('number-list')} blockType="number-list" />
                <BlockButton icon={<CheckListIcon size={18} />} label="Todo List" onClick={() => handleBlockTypeSelect('todo-list')} blockType="todo-list" />
                <BlockButton icon={<ArrowRight01Icon size={18} />} label="Toggle List" onClick={() => handleBlockTypeSelect('toggle-list')} blockType="toggle-list" />
              </Box>

              {/* Category Separator */}
              <Box sx={{ width: '1px', height: 24, bgcolor: 'divider' }} />

              {/* Advanced Blocks */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <BlockButton icon={<CodeIcon size={18} />} label="Code" onClick={() => handleBlockTypeSelect('code')} blockType="code" />
                <BlockButton icon={<Table01Icon size={18} />} label="Table" onClick={() => handleBlockTypeSelect('table')} blockType="table" />
                <BlockButton icon={<Calendar01Icon size={18} />} label="Schedule" onClick={() => handleBlockTypeSelect('schedule')} blockType="schedule" />
                <BlockButton icon={<FunctionIcon size={18} />} label="Equation" onClick={() => handleBlockTypeSelect('equation')} blockType="equation" />
              </Box>
            </Box>
          </Paper>

          <Box 
            sx={{ 
              flex: 1,
              overflow: 'auto',
              msOverflowStyle: 'none',  /* Hide scrollbar for IE and Edge */
              scrollbarWidth: 'none',   /* Hide scrollbar for Firefox */
              '&::-webkit-scrollbar': { /* Hide scrollbar for Chrome, Safari and Opera */
                display: 'none'
              }
            }}
          >
            {page.blocks && page.blocks.length > 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                pb: 30 // Add bottom padding of 160px (20 * 8px) to allow scrolling up the last item
              }}>
                {page.blocks.map((block, index) => {
                  const isNewBlock = newBlockIds.includes(block.id);
                  const animationDelay = isNewBlock ? index * 200 : 0;
                  
                  return (
                    <Box 
                      key={block.id}
                      sx={{ 
                        position: 'relative',
                        opacity: isNewBlock ? 0 : 1,
                        transform: isNewBlock ? 'translateY(40px)' : 'translateY(0)',
                        animation: isNewBlock ? `fadeInUp 0.5s ease forwards ${animationDelay}ms` : 'none',
                        '@keyframes fadeInUp': {
                          '0%': {
                            opacity: 0,
                            transform: 'translateY(40px)'
                          },
                          '100%': {
                            opacity: 1,
                            transform: 'translateY(0)'
                          }
                        }
                      }}
                    >
                      {renderBlock(block)}
                    </Box>
                  );
                })}
              </Box>
            ) : !commandMenuAnchorEl ? (
              <Box 
                sx={{ 
                  textAlign: 'center',
                  py: 8,
                  px: 4,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: '16px',
                  bgcolor: theme.palette.mode === 'light'
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'light'
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(0,0,0,0.3)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                  This page is empty
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Click on a block type below or press '/' to insert a block
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      bgcolor: theme.palette.mode === 'light'
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent onClick from firing
                      handleAddTextBlock();
                    }}
                  >
                    <TextIcon size={24} style={{ marginBottom: 8 }} />
                    <Typography variant="subtitle2">Text block</Typography>
                  </Paper>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      bgcolor: theme.palette.mode === 'light'
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent onClick from firing
                      handleBlockTypeSelect('bullet-list');
                    }}
                  >
                    <ListViewIcon size={24} style={{ marginBottom: 8 }} />
                    <Typography variant="subtitle2">List block</Typography>
                  </Paper>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      bgcolor: theme.palette.mode === 'light'
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent onClick from firing
                      handleBlockTypeSelect('picture');
                    }}
                  >
                    <Image01Icon size={24} style={{ marginBottom: 8 }} />
                    <Typography variant="subtitle2">Media block</Typography>
                  </Paper>
                </Box>
              </Box>
            ) : null}
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: commandMenuAnchorEl ? 'block' : 'none',
                position: 'relative',
                zIndex: 1,
                mt: 2,
                pointerEvents: 'auto'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
            </Box>
            
            <Box
              ref={setMenuAnchorRef}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 0
              }}
            />
          </Box>
        </Box>
      </Box>
      
      <BlockCommandMenu
        anchorEl={commandMenuAnchorEl}
        onClose={handleCommandMenuClose}
        onSelect={handleBlockTypeSelect}
      />

      <Menu
        anchorEl={iconMenuAnchorEl}
        open={Boolean(iconMenuAnchorEl)}
        onClose={handleIconMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            maxHeight: 400,
            width: 320,
            overflow: 'auto',
            msOverflowStyle: 'none',  /* Hide scrollbar for IE and Edge */
            scrollbarWidth: 'none',   /* Hide scrollbar for Firefox */
            '&::-webkit-scrollbar': { /* Hide scrollbar for Chrome, Safari and Opera */
              display: 'none'
            },
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            borderRadius: '12px',
            mt: 1,
            p: 1,
            '& .MuiList-root': {
              p: 0
            }
          }
        }}
      >
        {iconCategories.map((category, index) => (
          <Box key={category.name}>
            {index > 0 && <Divider sx={{ my: 1 }} />}
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 1,
                display: 'block',
                color: 'text.secondary',
                fontWeight: 600
              }}
            >
              {category.name}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 0.5,
                px: 1
              }}
            >
              {category.icons.map((icon) => (
                <IconButton
                  key={icon.value}
                  onClick={() => handleIconSelect(icon.value)}
                  sx={{
                    borderRadius: 1,
                    color: page?.icon === icon.value ? 'primary.main' : 'inherit',
                    bgcolor: page?.icon === icon.value ? 'primary.soft' : 'transparent',
                    '&:hover': {
                      bgcolor: page?.icon === icon.value ? 'primary.soft' : 'action.hover'
                    }
                  }}
                >
                  {icon.icon}
                </IconButton>
              ))}
            </Box>
          </Box>
        ))}
      </Menu>

      {/* Only render MessageInput if we have a valid page */}
      {!isInitializing && page && (
        <MessageInput 
          onSend={handleAIBlocksGenerated}
        />
      )}
    </Box>
  );
};

export default CustomPage; 