import { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Button, IconButton, Menu, MenuItem, useTheme, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, RadioGroup, FormControlLabel, Radio, CircularProgress, Fade, Backdrop } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar01Icon,
  Add01Icon,
  MoreVerticalIcon,
  Delete01Icon,
  Edit01Icon,
  Clock01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ViewIcon,
} from 'hugeicons-react';
import eventsApi, { Event, CreateEventDto } from '../api/events';
import { addNotification } from '../store/slices/uiSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';

const Calendar = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [viewType, setViewType] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<CreateEventDto>({
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const eventColors = [
    { value: '#3788d8', label: 'Blue' },
    { value: '#28a745', label: 'Green' },
    { value: '#dc3545', label: 'Red' },
    { value: '#fd7e14', label: 'Orange' },
    { value: '#6f42c1', label: 'Purple' },
    { value: '#e83e8c', label: 'Pink' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      setCurrentDate(calendarRef.current.getApi().view.title);
    }
  }, [viewType]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await eventsApi.getEvents();
      
      // Process the events to ensure dates are properly formatted
      const processedEvents = fetchedEvents.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      
      setEvents(processedEvents);
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to fetch events'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getViewLabel = (view: typeof viewType) => {
    switch (view) {
      case 'dayGridMonth':
        return 'Month';
      case 'timeGridWeek':
        return 'Week';
      case 'timeGridDay':
        return 'Day';
      case 'listWeek':
        return 'List';
      default:
        return 'Month';
    }
  };

  const switchToListView = async () => {
    setViewType('listWeek');
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView('listWeek');
      
      // Refresh events specifically for list view
      await fetchEvents();
      
      setCurrentDate(calendarApi.view.title);
    }
  };

  const cycleView = () => {
    const views: (typeof viewType)[] = ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'];
    const currentIndex = views.indexOf(viewType);
    const nextIndex = (currentIndex + 1) % views.length;
    const nextView = views[nextIndex];
    
    if (nextView === 'listWeek') {
      switchToListView();
    } else {
      handleViewChange(nextView);
    }
    
    // Update the current date after view change
    setTimeout(() => {
      if (calendarRef.current) {
        setCurrentDate(calendarRef.current.getApi().view.title);
      }
    }, 100);
  };

  const handleViewChange = (type: typeof viewType) => {
    setViewType(type);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(type);
      
      // Refresh events when switching views
      if (type === 'listWeek') {
        fetchEvents();
      }
      
      setCurrentDate(calendarApi.view.title);
    }
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e._id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setNewEvent({
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        description: event.description || '',
        color: event.color,
      });
      setIsEventModalOpen(true);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setNewEvent({
      title: '',
      start: selectInfo.start,
      end: selectInfo.end,
      description: '',
    });
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;

    setIsSaving(true);
    try {
      // Format the event data to ensure dates are properly sent
      const eventData = {
        ...newEvent,
        start: typeof newEvent.start === 'object' ? newEvent.start.toISOString() : newEvent.start,
        end: typeof newEvent.end === 'object' ? newEvent.end.toISOString() : newEvent.end
      };

      if (selectedEvent) {
        // Update existing event
        const updatedEvent = await eventsApi.updateEvent({
          id: selectedEvent._id,
          ...eventData,
        });
        setEvents(events.map(event => 
          event._id === selectedEvent._id ? updatedEvent : event
        ));
        dispatch(addNotification({
          type: 'success',
          message: 'Event updated successfully'
        }));
      } else {
        // Create new event
        const createdEvent = await eventsApi.createEvent(eventData);
        setEvents([...events, createdEvent]);
        dispatch(addNotification({
          type: 'success',
          message: 'Event created successfully'
        }));
      }

      setIsEventModalOpen(false);
      setNewEvent({
        title: '',
        start: new Date(),
        end: new Date(),
        description: '',
      });
      setSelectedEvent(null);
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || `Failed to ${selectedEvent ? 'update' : 'create'} event`
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await eventsApi.deleteEvent(selectedEvent._id);
        setEvents(events.filter(event => event._id !== selectedEvent._id));
        setIsEventModalOpen(false);
        setSelectedEvent(null);
        dispatch(addNotification({
          type: 'success',
          message: 'Event deleted successfully'
        }));
      } catch (error: any) {
        dispatch(addNotification({
          type: 'error',
          message: error.message || 'Failed to delete event'
        }));
      }
    }
  };

  const handlePrevClick = () => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.prev();
      setCurrentDate(api.view.title);
    }
  };

  const handleNextClick = () => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.next();
      setCurrentDate(api.view.title);
    }
  };

  const handleTodayClick = () => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.today();
      setCurrentDate(api.view.title);
    }
  };

  return (
    <Box 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'width 0.3s ease-out, margin 0.3s ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Absolute Header Section */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            maxWidth: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Calendar01Icon size={20} style={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Calendar</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, sm: 'auto' }, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tooltip title="Add Event">
              <IconButton
                size="small"
                onClick={() => {
                  setNewEvent({
                    title: '',
                    start: new Date(),
                    end: new Date(),
                    description: '',
                  });
                  setSelectedEvent(null);
                  setIsEventModalOpen(true);
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <Add01Icon size={18} />
              </IconButton>
            </Tooltip>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Tooltip title="Previous">
                  <IconButton
                    size="small"
                    onClick={handlePrevClick}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ArrowLeft01Icon size={18} />
                  </IconButton>
                </Tooltip>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.primary', 
                    fontWeight: 500, 
                    minWidth: 120,
                    textAlign: 'center',
                    mx: 2
                  }}
                >
                  {currentDate}
                </Typography>

                <Tooltip title="Next">
                  <IconButton
                    size="small"
                    onClick={handleNextClick}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ArrowRight01Icon size={18} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Tooltip title="Today">
                <IconButton
                  size="small"
                  onClick={handleTodayClick}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Clock01Icon size={18} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
                onClick={cycleView}
              >
                {getViewLabel(viewType)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Spacer for header */}
      <Box sx={{ height: { xs: 120, sm: 60 }, mb: 3 }} />

      {/* Calendar Container */}
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          height: { xs: 'calc(100vh - 180px)', md: 'calc(100vh - 140px)' },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '.fc': {
            '--fc-border-color': theme.palette.divider,
            '--fc-button-text-color': theme.palette.text.primary,
            '--fc-button-bg-color': 'transparent',
            '--fc-button-border-color': theme.palette.divider,
            '--fc-button-hover-bg-color': theme.palette.action.hover,
            '--fc-button-hover-border-color': theme.palette.primary.main,
            '--fc-button-active-bg-color': theme.palette.primary.main,
            '--fc-button-active-border-color': theme.palette.primary.main,
            '--fc-event-bg-color': theme.palette.primary.main,
            '--fc-event-border-color': theme.palette.primary.main,
            '--fc-today-bg-color': `${theme.palette.primary.main}10`,
            '--fc-page-bg-color': 'transparent',
            '--fc-neutral-bg-color': 'transparent',
            '--fc-list-event-hover-bg-color': theme.palette.action.hover,
            '--fc-small-font-size': { xs: '0.75rem', sm: '0.85rem' },
            '--fc-font-size': { xs: '0.85rem', sm: '1rem' },
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            position: 'relative',
            '& table': {
              width: '100% !important',
              tableLayout: 'fixed !important',
            },
            '& td, & th': {
              position: 'relative !important',
            },
            '& .fc-scrollgrid-sync-table': {
              width: '100% !important',
            },
            '& .fc-daygrid-body': {
              width: '100% !important',
              '& table': {
                width: '100% !important',
              }
            },
            '& .fc-scroller-liquid-absolute': {
              position: 'relative !important',
            }
          },
          '.fc .fc-view-harness': {
            flex: 1,
            minHeight: 0,
            position: 'relative !important',
            width: '100% !important',
          },
          '.fc .fc-view': {
            position: 'absolute !important',
            left: '0 !important',
            right: '0 !important',
            top: '0 !important',
            bottom: '0 !important',
            width: '100% !important',
            height: '100% !important',
          },
          '.fc .fc-scrollgrid': {
            width: '100% !important',
            height: '100% !important',
            borderRadius: '0 0 20px 20px',
            border: 'none',
            '& table': {
              width: '100% !important',
              height: '100%',
            },
            '& td, & th': {
              width: 'auto !important',
            }
          },
          '.fc .fc-scroller': {
            height: '100% !important',
            overflow: 'auto !important',
            '-webkit-overflow-scrolling': 'touch',
          },
          // Calendar Header
          '.fc .fc-toolbar': {
            px: { xs: 1, sm: 2, md: 3 },
            pt: { xs: 1, sm: 2, md: 3 },
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          },
          '.fc .fc-toolbar-title': {
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            fontWeight: 600,
            color: theme.palette.text.primary,
          },
          // Calendar Grid
          '.fc-theme-standard td, & .fc-theme-standard th': {
            borderColor: `${theme.palette.divider}80`,
          },
          '.fc-daygrid-day-number': {
            color: theme.palette.text.primary,
            textDecoration: 'none !important',
            padding: { xs: '4px', sm: '8px' },
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            fontWeight: 500,
          },
          '.fc-col-header-cell-cushion': {
            color: theme.palette.text.secondary,
            textDecoration: 'none !important',
            padding: { xs: '8px 4px', sm: '12px 8px' },
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          },
          // Time Grid
          '.fc-timegrid-slot-label': {
            color: theme.palette.text.secondary,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          },
          '.fc-timegrid-axis': {
            borderColor: 'transparent',
          },
          // List View
          '.fc-list': {
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
          },
          '.fc-list-day-cushion': {
            backgroundColor: `${theme.palette.primary.main}10 !important`,
          },
          '.fc-list-event:hover td': {
            backgroundColor: `${theme.palette.action.hover} !important`,
          },
          // More Link
          '.fc-more-link': {
            color: theme.palette.primary.main,
            fontWeight: 500,
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            '&:hover': {
              textDecoration: 'none',
              color: theme.palette.primary.dark,
            }
          },
          // Mobile optimizations
          '.fc-view': {
            minHeight: { xs: 400, sm: 500, md: 600 },
          },
          '.fc-toolbar-chunk': {
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-start' },
            width: { xs: '100%', sm: 'auto' },
          },
          // Hide certain elements on small screens
          '.fc-timegrid-axis-cushion': {
            display: { xs: 'none', sm: 'block' },
          },
          '.fc-timegrid-slot-label-cushion': {
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          },
        }}
      >
        {isLoading && (
          <Backdrop
            open={true}
            sx={{ 
              position: 'absolute', 
              zIndex: 10, 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
            }}
          >
            <CircularProgress color="primary" />
          </Backdrop>
        )}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={viewType}
          headerToolbar={false}
          events={events.map(event => {
            // Ensure dates are properly formatted for FullCalendar
            const start = new Date(event.start);
            const end = new Date(event.end);
            
            return {
              id: event._id,
              title: event.title,
              start: start,
              end: end,
              backgroundColor: event.color || '#3788d8',
              borderColor: event.color || '#3788d8',
              textColor: '#ffffff',
              extendedProps: {
                description: event.description
              }
            };
          })}
          eventContent={(eventInfo) => {
            return (
              <Tooltip title={eventInfo.event.extendedProps.description || eventInfo.event.title}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  width: '100%',
                  overflow: 'hidden',
                  p: '2px 4px',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  lineHeight: 1.2
                }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: eventInfo.event.backgroundColor,
                      flexShrink: 0
                    }} 
                  />
                  <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eventInfo.event.title}
                  </Box>
                </Box>
              </Tooltip>
            );
          }}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={window.innerWidth < 600 ? 2 : window.innerWidth < 960 ? 3 : true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="100%"
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          expandRows={true}
          stickyHeaderDates={true}
          handleWindowResize={true}
          windowResizeDelay={100}
          listDayFormat={{ month: 'long', day: 'numeric', weekday: 'long' }}
          listDaySideFormat={{ month: 'short', day: 'numeric', year: 'numeric' }}
          views={{
            listWeek: {
              type: 'list',
              duration: { weeks: 1 },
              buttonText: 'List',
              titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
            }
          }}
          noEventsContent={
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 1,
              color: 'text.secondary'
            }}>
              <Calendar01Icon size={24} />
              <Typography variant="body2">No events to display</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Event Modal */}
      <Dialog 
        open={isEventModalOpen} 
        onClose={() => !isSaving && setIsEventModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ 
          height: '8px', 
          width: '100%', 
          bgcolor: newEvent.color || '#3788d8',
          position: 'absolute',
          top: 0,
          left: 0,
        }} />
        
        <DialogTitle sx={{ 
          pt: 4,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '12px', 
            bgcolor: newEvent.color || '#3788d8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock01Icon size={24} style={{ color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedEvent ? 'Edit Event' : 'New Event'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3, 
            pt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
              },
            },
          }}>
            <TextField
              fullWidth
              label="Event Title"
              placeholder="Add a title for your event"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              InputProps={{
                sx: { 
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }
              }}
              required
            />
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Start Time
                  </Typography>
                  <DateTimePicker
                    value={typeof newEvent.start === 'string' ? new Date(newEvent.start) : newEvent.start}
                    onChange={(date) => date && setNewEvent({ ...newEvent, start: date })}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    End Time
                  </Typography>
                  <DateTimePicker
                    value={typeof newEvent.end === 'string' ? new Date(newEvent.end) : newEvent.end}
                    onChange={(date) => date && setNewEvent({ ...newEvent, end: date })}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add details about your event"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                size="small"
              />
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Event Color
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1.5,
                justifyContent: 'flex-start'
              }}>
                {eventColors.map((color) => (
                  <Box
                    key={color.value}
                    onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: color.value,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: newEvent.color === color.value ? '2px solid white' : 'none',
                      boxShadow: newEvent.color === color.value 
                        ? `0 0 0 2px ${color.value}, 0 4px 8px rgba(0,0,0,0.1)` 
                        : '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    {newEvent.color === color.value && (
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          bgcolor: 'white',
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 2,
        }}>
          {selectedEvent && (
            <Button
              startIcon={<Delete01Icon />}
              onClick={handleDeleteEvent}
              color="error"
              variant="outlined"
              sx={{ 
                mr: 'auto',
                borderRadius: '10px',
                textTransform: 'none',
                borderColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.soft',
                }
              }}
              disabled={isSaving}
            >
              Delete
            </Button>
          )}
          <Button 
            onClick={() => setIsEventModalOpen(false)}
            sx={{
              color: 'text.secondary',
              borderRadius: '10px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEvent}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : selectedEvent ? <Edit01Icon /> : <Add01Icon />}
            disabled={isSaving || !newEvent.title}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 3,
              bgcolor: newEvent.color || 'primary.main',
              '&:hover': {
                bgcolor: newEvent.color ? `${newEvent.color}dd` : 'primary.dark',
              },
              '&.Mui-disabled': {
                opacity: 0.7,
              }
            }}
          >
            {selectedEvent ? (isSaving ? 'Updating...' : 'Update') : (isSaving ? 'Creating...' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 