package com.sliit.campusflow.modules.bookings.model;

import com.sliit.campusflow.common.model.BaseEntity;
import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.resources.model.Resource;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking extends BaseEntity {

    @Column(name = "booking_number", nullable = false, unique = true, length = 50)
    private String bookingNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private String purpose;

    @Column(name = "expected_attendees")
    private Integer expectedAttendees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    // We can add more fields if necessary, like user notes or admin comments
}
