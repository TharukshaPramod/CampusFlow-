package com.sliit.campusflow.modules.bookings.service;

import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import com.sliit.campusflow.modules.bookings.dto.BookingRequest;
import com.sliit.campusflow.modules.bookings.dto.BookingResponse;
import com.sliit.campusflow.modules.bookings.dto.BookingStatusUpdate;
import com.sliit.campusflow.modules.bookings.mapper.BookingMapper;
import com.sliit.campusflow.modules.bookings.model.Booking;
import com.sliit.campusflow.modules.bookings.model.BookingStatus;
import com.sliit.campusflow.modules.bookings.repository.BookingRepository;
import com.sliit.campusflow.modules.resources.model.Resource;
import com.sliit.campusflow.modules.resources.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public BookingResponse createBooking(UUID userId, BookingRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        // Validate no overlap
        boolean existsConflict = bookingRepository.existsOverlappingBooking(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime(),
                Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        if (existsConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Resource is already booked during this time range");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource is currently " + resource.getStatus() + " and cannot be booked.");
        }

        Booking booking = new Booking();
        
        // Generate a random booking number explicitly to meet DB constraints
        booking.setBookingNumber("BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        // Map the entered purpose to the required 'title' column as well
        booking.setTitle(request.getPurpose());
        
        booking.setUser(user);
        booking.setResource(resource);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        booking = bookingRepository.save(booking);

        return bookingMapper.toResponse(booking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingMapper.toResponseList(bookingRepository.findAll());
    }

    public List<BookingResponse> getUserBookings(UUID userId) {
        return bookingMapper.toResponseList(bookingRepository.findByUserId(userId));
    }

    public BookingResponse updateBookingStatus(UUID bookingId, BookingStatusUpdate update) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setStatus(update.getStatus());

        if (update.getStatus() == BookingStatus.REJECTED && update.getReason() != null) {
            booking.setRejectionReason(update.getReason());
        }

        booking = bookingRepository.save(booking);
        return bookingMapper.toResponse(booking);
    }
}
