import { api } from './axios';

export interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDto {
  title: string;
  start: Date | string;
  end: Date | string;
  description?: string;
  color?: string;
}

export interface UpdateEventDto extends CreateEventDto {
  id: string;
}

const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
  },

  createEvent: async (event: CreateEventDto): Promise<Event> => {
    try {
      console.log('Creating event with data:', event);
      const response = await api.post('/events', event);
      return response.data;
    } catch (error: any) {
      console.error('Error creating event:', error.response?.data || error.message);
      throw error;
    }
  },

  updateEvent: async ({ id, ...event }: UpdateEventDto): Promise<Event> => {
    try {
      console.log('Updating event with data:', { id, ...event });
      const response = await api.put(`/events/${id}`, event);
      return response.data;
    } catch (error: any) {
      console.error('Error updating event:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export default eventsApi; 