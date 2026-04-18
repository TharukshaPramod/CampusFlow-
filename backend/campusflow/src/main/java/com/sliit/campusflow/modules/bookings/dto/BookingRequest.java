package com.sliit.campusflow.modules.bookings.dto;

import com.sliit.campusflow.modules.bookings.model.BookingStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Getter
@Setter
public class BookingRequest {
    private UUID resourceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
}
