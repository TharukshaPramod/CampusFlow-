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
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime(),
                Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        if (!overlappingBookings.isEmpty()) {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");
            java.util.List<String> conflictDetailsList = new java.util.ArrayList<>();
            for (Booking conflict : overlappingBookings) {
                conflictDetailsList.add(conflict.getStartTime().format(formatter) + " to " + conflict.getEndTime().format(formatter));
            }
            String allConflicts = String.join("|||", conflictDetailsList);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Resource is already booked. Conflicting bookings: |||" + allConflicts);
        }

        User user = userRepository.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Resource resource = resourceRepository.findById(java.util.Objects.requireNonNull(request.getResourceId()))
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

    public BookingResponse updateBookingStatus(UUID bookingId, BookingStatusUpdate update, User currentUser) {
        Booking booking = bookingRepository.findById(java.util.Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));

        if (update.getStatus() == BookingStatus.CANCELLED) {
            // Users can only cancel their own bookings, admins can cancel any
            if (!isAdmin && !booking.getUser().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
            }
        } else {
            // Only admins can approve or reject
            if (!isAdmin) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only administrators can approve or reject bookings");
            }
        }

        booking.setStatus(update.getStatus());

        if (update.getStatus() == BookingStatus.REJECTED && update.getReason() != null) {
            booking.setRejectionReason(update.getReason());
        }

        booking = bookingRepository.save(booking);
        return bookingMapper.toResponse(booking);
    }

    public void bulkDeleteBookings(User currentUser, String timeRange) {
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        java.time.LocalDateTime threshold = null;
        
        switch (timeRange.toLowerCase()) {
            case "yesterday":
                threshold = java.time.LocalDateTime.now().minusDays(1);
                break;
            case "week":
                threshold = java.time.LocalDateTime.now().minusWeeks(1);
                break;
            case "month":
                threshold = java.time.LocalDateTime.now().minusMonths(1);
                break;
            case "all":
            default:
                break;
        }

        if (isAdmin) {
            if ("all".equalsIgnoreCase(timeRange)) {
                bookingRepository.deleteAll();
            } else if (threshold != null) {
                bookingRepository.deleteByStartTimeBefore(threshold);
            }
        } else {
            if ("all".equalsIgnoreCase(timeRange)) {
                bookingRepository.deleteByUserId(currentUser.getId());
            } else if (threshold != null) {
                bookingRepository.deleteByUserIdAndStartTimeBefore(currentUser.getId(), threshold);
            }
        }
    }
}
