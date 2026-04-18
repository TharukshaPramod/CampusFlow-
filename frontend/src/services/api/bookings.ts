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

  updateBookingStatus: async (id: string, update: BookingStatusUpdate): Promise<Booking> => {
    const { data } = await apiClient.patch<Booking>(`/v1/bookings/${id}/status`, update);
    return data;
  }
};
