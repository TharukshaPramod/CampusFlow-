package com.sliit.campusflow.modules.bookings.controller;

import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.bookings.dto.BookingRequest;
import com.sliit.campusflow.modules.bookings.dto.BookingResponse;
import com.sliit.campusflow.modules.bookings.dto.BookingStatusUpdate;
import com.sliit.campusflow.modules.bookings.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Endpoints for managing resource bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Request a new booking")
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal User user,
            @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(user.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all bookings (Admin) or my bookings (User)")
    public ResponseEntity<List<BookingResponse>> getBookings(
            @AuthenticationPrincipal User user) {
        
        // In a real scenario, you'd check user role. Here's a basic check utilizing user object context.
        if (user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"))) {
            return ResponseEntity.ok(bookingService.getAllBookings());
        } else {
            return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific booking by ID")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a pending booking (Edit)")
    public ResponseEntity<BookingResponse> updateBooking(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request, user));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status (Approve/Reject via Admin, Cancel via User)")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody BookingStatusUpdate update) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, update, user));
    }

    @DeleteMapping("/bulk")
    @Operation(summary = "Delete bookings based on time range")
    public ResponseEntity<Void> bulkDeleteBookings(
            @AuthenticationPrincipal User user,
            @RequestParam String timeRange) {
        bookingService.bulkDeleteBookings(user, timeRange);
        return ResponseEntity.ok().build();
    }
}
