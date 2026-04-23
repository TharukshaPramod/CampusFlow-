import { apiClient } from "./client";
import { Booking, BookingRequest, BookingStatusUpdate } from "../../types/booking";

export const bookingService = {
  createBooking: async (request: BookingRequest): Promise<Booking> => {
    const { data } = await apiClient.post<Booking>("/v1/bookings", request);
    return data;
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const { data } = await apiClient.get<Booking[]>("/v1/bookings");
    return data;
  },

  getBookingsByResource: async (resourceId: string): Promise<Booking[]> => {
    try {
      const { data } = await apiClient.get<Booking[]>(`/v1/bookings/resource/${resourceId}`);
      return data;
    } catch {
      // Fallback: fetch all bookings and filter client-side if endpoint doesn't exist
      const { data } = await apiClient.get<Booking[]>("/v1/bookings");
      return data.filter(booking => booking.resourceId === resourceId);
    }
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.get<Booking>(`/v1/bookings/${id}`);
    return data;
  },

  updateBooking: async (id: string, request: BookingRequest): Promise<Booking> => {
    const { data } = await apiClient.put<Booking>(`/v1/bookings/${id}`, request);
    return data;
  },

  updateBookingStatus: async (id: string, update: BookingStatusUpdate): Promise<Booking> => {
    const { data } = await apiClient.patch<Booking>(`/v1/bookings/${id}/status`, update);
    return data;
  },

  deleteBookings: async (timeRange: string): Promise<void> => {
    await apiClient.delete(`/v1/bookings/bulk`, { params: { timeRange } });
  },

  deleteBooking: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/bookings/${id}`);
  }
};
