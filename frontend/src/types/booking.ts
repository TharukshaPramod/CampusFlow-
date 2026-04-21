export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  id: string;
  bookingNumber: string;
  resourceId: string;
  resourceName?: string;
  userId: string;
  userName?: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  status: BookingStatus;
  rejectionReason?: string;
}

export interface BookingRequest {
  resourceId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
}

export interface BookingStatusUpdate {
  status: BookingStatus;
  reason?: string;
}
