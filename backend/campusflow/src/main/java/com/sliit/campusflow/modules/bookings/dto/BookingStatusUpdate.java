package com.sliit.campusflow.modules.bookings.dto;

import com.sliit.campusflow.modules.bookings.model.BookingStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class BookingStatusUpdate {
    private BookingStatus status;
    private String reason;
}
