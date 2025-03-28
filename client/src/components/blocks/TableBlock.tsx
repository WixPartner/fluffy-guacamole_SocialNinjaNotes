import React, { useState, useCallback, useRef } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Paper, Menu, MenuItem, useTheme, IconButton } from '@mui/material';
import { Block, TableCell as TableCellType, TableRow as TableRowType } from '../../api/pages';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash/debounce';
import { Delete01Icon, Add01Icon, Drag01Icon } from 'hugeicons-react';

interface TableBlockProps {
  block: Block;
  onUpdateBlock: (id: string, content: string, checked?: boolean, toggleContent?: Block[], rows?: TableRowType[]) => void;
  onDelete?: (id: string) => void;
}

const TableBlock: React.FC<TableBlockProps> = ({ block, onUpdateBlock, onDelete }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [localCellContent, setLocalCellContent] = useState<string>('');
  const [columnWidths, setColumnWidths] = useState<number[]>(() => {
    const defaultWidth = 150;
    // Use persisted column widths if available, otherwise use default
    return block.rows?.[0]?.columnWidths || block.rows?.[0]?.cells.map(() => defaultWidth) || Array(3).fill(defaultWidth);
  });
  const [isResizing, setIsResizing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    rowIndex?: number;
  } | null>(null);
  const resizingColumnRef = useRef<number | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const theme = useTheme();
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dropTargetRowIndex, setDropTargetRowIndex] = useState<number | null>(null);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((rowId: string, cellId: string, newContent: string) => {
      const updatedRows = block.rows?.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            cells: row.cells.map(cell => 
              cell.id === cellId ? { ...cell, content: newContent } : cell
            )
          };
        }
        return row;
      });

      onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
    }, 500),
    [block, onUpdateBlock]
  );

  // Debounced column width update
  const debouncedWidthUpdate = useCallback(
    debounce((newWidths: number[]) => {
      const updatedRows = block.rows?.map((row, index) => ({
        ...row,
        columnWidths: index === 0 ? newWidths : row.columnWidths // Only store widths in first row
      }));
      onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
    }, 500),
    [block, onUpdateBlock]
  );

  const handleCellClick = (cellId: string, content: string) => {
    setIsEditing(cellId);
    setLocalCellContent(content);
  };

  const handleCellBlur = () => {
    setIsEditing(null);
  };

  const handleCellChange = (rowId: string, cellId: string, newContent: string) => {
    setLocalCellContent(newContent);
    debouncedUpdate(rowId, cellId, newContent);
  };

  const handleResizeStart = (e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizingColumnRef.current = columnIndex;
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[columnIndex];

    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumnRef.current === null) return;
      
      const diff = e.clientX - startXRef.current;
      const currentColIndex = resizingColumnRef.current;
      const nextColIndex = currentColIndex + 1;
      
      // Calculate new widths while respecting minimum width
      const currentColWidth = Math.max(100, startWidthRef.current + diff);
      const widthDiff = currentColWidth - columnWidths[currentColIndex];
      
      // Only proceed if we're not making the next column too narrow
      if (nextColIndex < columnWidths.length) {
        const nextColNewWidth = columnWidths[nextColIndex] - widthDiff;
        if (nextColNewWidth >= 100) {
          const newWidths = [...columnWidths];
          newWidths[currentColIndex] = currentColWidth;
          newWidths[nextColIndex] = nextColNewWidth;
          setColumnWidths(newWidths);
          debouncedWidthUpdate(newWidths);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizingColumnRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (event: React.MouseEvent, rowIndex?: number) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowIndex
          }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteRow = () => {
    if (contextMenu?.rowIndex === undefined || !block.rows) return;
    
    const updatedRows = [...block.rows];
    updatedRows.splice(contextMenu.rowIndex, 1);
    
    if (updatedRows.length === 0) {
      // If last row was deleted, delete the whole table
      onDelete?.(block.id);
    } else {
      onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
    }
    handleCloseContextMenu();
  };

  const handleAddRowBelow = () => {
    if (contextMenu?.rowIndex === undefined || !block.rows) return;
    
    const newRow: TableRowType = {
      id: uuidv4(),
      cells: Array(block.rows[0].cells.length).fill(null).map(() => ({
        id: uuidv4(),
        content: ''
      })),
      columnWidths: columnWidths
    };
    
    const updatedRows = [...block.rows];
    updatedRows.splice(contextMenu.rowIndex + 1, 0, newRow);
    
    onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
    handleCloseContextMenu();
  };

  const handleAddColumn = () => {
    if (!block.rows) return;
    
    const newColumnWidth = 150;
    const newWidths = [...columnWidths, newColumnWidth];
    
    const updatedRows = block.rows.map(row => ({
      ...row,
      cells: [...row.cells, { id: uuidv4(), content: '' }],
      columnWidths: newWidths
    }));
    
    setColumnWidths(newWidths);
    onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
    handleCloseContextMenu();
  };

  const handleDeleteColumn = () => {
    if (!block.rows || block.rows[0].cells.length <= 1) return;
    
    const newWidths = columnWidths.slice(0, -1);
    
    const updatedRows = block.rows.map(row => ({
      ...row,
      cells: row.cells.slice(0, -1),
      columnWidths: newWidths
    }));
    
    setColumnWidths(newWidths);
    onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
    handleCloseContextMenu();
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, cellIndex: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      // Move to next cell
      const nextCellIndex = cellIndex + 1;
      if (nextCellIndex < block.rows![rowIndex].cells.length) {
        // Move to next cell in same row
        const nextCell = block.rows![rowIndex].cells[nextCellIndex];
        handleCellClick(nextCell.id, nextCell.content);
      } else if (rowIndex + 1 < block.rows!.length) {
        // Move to first cell of next row
        const nextCell = block.rows![rowIndex + 1].cells[0];
        handleCellClick(nextCell.id, nextCell.content);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      // Move to previous cell
      const prevCellIndex = cellIndex - 1;
      if (prevCellIndex >= 0) {
        // Move to previous cell in same row
        const prevCell = block.rows![rowIndex].cells[prevCellIndex];
        handleCellClick(prevCell.id, prevCell.content);
      } else if (rowIndex > 0) {
        // Move to last cell of previous row
        const prevRow = block.rows![rowIndex - 1];
        const prevCell = prevRow.cells[prevRow.cells.length - 1];
        handleCellClick(prevCell.id, prevCell.content);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Move to cell below
      if (rowIndex + 1 < block.rows!.length) {
        const nextCell = block.rows![rowIndex + 1].cells[cellIndex];
        handleCellClick(nextCell.id, nextCell.content);
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      // Move to cell above
      if (rowIndex > 0) {
        const prevCell = block.rows![rowIndex - 1].cells[cellIndex];
        handleCellClick(prevCell.id, prevCell.content);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const prevCell = block.rows![rowIndex - 1].cells[cellIndex];
        handleCellClick(prevCell.id, prevCell.content);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex + 1 < block.rows!.length) {
        const nextCell = block.rows![rowIndex + 1].cells[cellIndex];
        handleCellClick(nextCell.id, nextCell.content);
      }
    } else if (e.key === 'ArrowLeft' && !isEditing) {
      e.preventDefault();
      if (cellIndex > 0) {
        const prevCell = block.rows![rowIndex].cells[cellIndex - 1];
        handleCellClick(prevCell.id, prevCell.content);
      }
    } else if (e.key === 'ArrowRight' && !isEditing) {
      e.preventDefault();
      if (cellIndex + 1 < block.rows![rowIndex].cells.length) {
        const nextCell = block.rows![rowIndex].cells[cellIndex + 1];
        handleCellClick(nextCell.id, nextCell.content);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCellBlur();
    }
  };

  const handleDragStart = (e: React.DragEvent, rowIndex: number) => {
    setDraggedRowIndex(rowIndex);
    e.dataTransfer.effectAllowed = 'move';
    // Add a class to the dragged row for styling
    const row = e.currentTarget as HTMLElement;
    row.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const row = e.currentTarget as HTMLElement;
    row.classList.remove('dragging');
    
    if (draggedRowIndex !== null && dropTargetRowIndex !== null && draggedRowIndex !== dropTargetRowIndex) {
      const updatedRows = [...block.rows!];
      const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
      updatedRows.splice(dropTargetRowIndex, 0, draggedRow);
      onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
    }
    
    setDraggedRowIndex(null);
    setDropTargetRowIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, rowIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetRowIndex(rowIndex);
  };

  // Initialize empty table if no rows exist
  if (!block.rows || block.rows.length === 0) {
    const defaultWidth = 150;
    const initialWidths = Array(3).fill(defaultWidth);
    const initialRows: TableRowType[] = Array(3).fill(null).map(() => ({
      id: uuidv4(),
      cells: Array(3).fill(null).map(() => ({
        id: uuidv4(),
        content: ''
      })),
      columnWidths: initialWidths
    }));

    onUpdateBlock(block.id, block.content, undefined, undefined, initialRows);
    return null;
  }

  return (
    <Box sx={{ my: 2, '&:hover .add-row-button': { opacity: 1 } }}>
      <TableContainer 
        component={Paper} 
        onContextMenu={(e) => handleContextMenu(e)}
        sx={{
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden',
          '&:hover': {
            borderColor: 'primary.light',
          }
        }}
      >
        <Table 
          size="small" 
          sx={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            tableLayout: 'fixed',
            width: '100%'
          }}
        >
          <TableBody>
            {block.rows.map((row, rowIndex) => (
              <TableRow 
                key={row.id}
                draggable
                onDragStart={(e) => handleDragStart(e, rowIndex)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, rowIndex)}
                onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                className={dropTargetRowIndex === rowIndex ? 'drop-target' : ''}
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                    cursor: 'grab',
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                  transition: 'background-color 0.2s ease-in-out',
                }}
              >
                {row.cells.map((cell, cellIndex) => (
                  <TableCell 
                    key={cell.id}
                    onClick={() => handleCellClick(cell.id, cell.content)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, cellIndex)}
                    tabIndex={0}
                    sx={{ 
                      position: 'relative',
                      p: '12px 16px',
                      width: `${columnWidths[cellIndex]}px`,
                      cursor: 'text',
                      borderBottom: '1px solid',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      fontWeight: rowIndex === 0 ? 500 : 400,
                      backgroundColor: isEditing === cell.id ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&:focus': {
                        outline: 'none',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&:last-child': {
                        borderRight: 0,
                      },
                      transition: 'all 0.2s ease-in-out',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {isEditing === cell.id ? (
                      <TextField
                        fullWidth
                        variant="standard"
                        value={localCellContent}
                        onChange={(e) => handleCellChange(row.id, cell.id, e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, cellIndex)}
                        autoFocus
                        sx={{ 
                          width: '100%',
                          '& .MuiInput-root': {
                            fontSize: 'inherit',
                            fontFamily: 'inherit',
                            fontWeight: 'inherit',
                            width: '100%',
                            '&:before, &:after': {
                              display: 'none'
                            }
                          },
                          '& .MuiInput-input': {
                            padding: 0,
                            width: '100%',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    ) : (
                      cell.content || '\u00A0'
                    )}
                    {cellIndex < row.cells.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -4,
                          top: 0,
                          bottom: 0,
                          width: 8,
                          cursor: 'col-resize',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            opacity: 0.2,
                          },
                          ...(isResizing && resizingColumnRef.current === cellIndex && {
                            backgroundColor: 'primary.main',
                            opacity: 0.2,
                            zIndex: 1,
                          }),
                        }}
                        onMouseDown={(e) => handleResizeStart(e, cellIndex)}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        className="add-row-button"
        onClick={() => {
          const newRow: TableRowType = {
            id: uuidv4(),
            cells: Array(block.rows![0].cells.length).fill(null).map(() => ({
              id: uuidv4(),
              content: ''
            })),
            columnWidths: columnWidths
          };
          const updatedRows = [...block.rows!, newRow];
          onUpdateBlock(block.id, block.content, undefined, undefined, updatedRows);
        }}
        sx={{
          opacity: 0,
          p: '8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          cursor: 'pointer',
          borderWidth: '0 1px 1px 1px',
          borderStyle: 'solid',
          borderColor: 'divider',
          borderRadius: '0 0 8px 8px',
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
          color: theme.palette.text.secondary,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
            color: theme.palette.text.primary,
          }
        }}
      >
        <Add01Icon size={16} />
        Add row
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
        slotProps={{
          root: {
            'aria-hidden': undefined
          },
          paper: {
            sx: {
              borderRadius: '12px',
              boxShadow: '0 0 0 1px rgba(15, 15, 15, 0.05), 0 3px 6px rgba(15, 15, 15, 0.1), 0 9px 24px rgba(15, 15, 15, 0.2)',
              minWidth: 260,
              maxWidth: 320,
              bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#2f3437',
              color: theme.palette.mode === 'light' ? '#37352f' : '#ffffff',
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
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
                }
              }
            }
          }
        }}
      >
        {contextMenu?.rowIndex !== undefined && (
          <>
            <MenuItem onClick={handleAddRowBelow}>
              <Add01Icon size={16} style={{ opacity: 0.8 }} />
              Add row below
            </MenuItem>
            <MenuItem onClick={handleDeleteRow}>
              <Delete01Icon size={16} style={{ opacity: 0.8 }} />
              Delete row
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleAddColumn}>
          <Add01Icon size={16} style={{ opacity: 0.8 }} />
          Add column
        </MenuItem>
        {block.rows && block.rows[0].cells.length > 1 && (
          <MenuItem onClick={handleDeleteColumn}>
            <Delete01Icon size={16} style={{ opacity: 0.8 }} />
            Delete column
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => { onDelete(block.id); handleCloseContextMenu(); }}>
            <Delete01Icon size={16} style={{ opacity: 0.8 }} />
            Delete table
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default TableBlock; 