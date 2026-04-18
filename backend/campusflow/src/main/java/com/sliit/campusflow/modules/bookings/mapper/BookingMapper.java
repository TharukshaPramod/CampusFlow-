package com.sliit.campusflow.modules.bookings.mapper;

import com.sliit.campusflow.modules.bookings.dto.BookingResponse;
import com.sliit.campusflow.modules.bookings.model.Booking;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setRejectionReason(booking.getRejectionReason());

        if (booking.getResource() != null) {
            response.setResourceId(booking.getResource().getId());
            response.setResourceName(booking.getResource().getName());
        }

        if (booking.getUser() != null) {
            response.setUserId(booking.getUser().getId());
            response.setUserName(booking.getUser().getName());
        }

        return response;
    }

    public List<BookingResponse> toResponseList(List<Booking> bookings) {
        return bookings.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
