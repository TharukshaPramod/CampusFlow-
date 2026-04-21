package com.sliit.campusflow.modules.bookings.repository;

import com.sliit.campusflow.modules.bookings.model.Booking;
import com.sliit.campusflow.modules.bookings.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    // Retrieve all bookings for a specific user
    List<Booking> findByUserId(UUID userId);

    long countByUserId(UUID userId);

    // Retrieve bookings explicitly by a status (useful for admin views)
    List<Booking> findByStatus(BookingStatus status);

    // Overlapping check constraint query to prevent scheduling conflicts
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b WHERE b.resource.id = :resourceId AND b.status IN (:activeStatuses) AND (" +
           "(:startTime >= b.startTime AND :startTime < b.endTime) OR " +
           "(:endTime > b.startTime AND :endTime <= b.endTime) OR " +
           "(:startTime <= b.startTime AND :endTime >= b.endTime))")
    boolean existsOverlappingBooking(
        @Param("resourceId") UUID resourceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("activeStatuses") List<BookingStatus> activeStatuses
    );

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status IN (:activeStatuses) AND (" +
           "(:startTime >= b.startTime AND :startTime < b.endTime) OR " +
           "(:endTime > b.startTime AND :endTime <= b.endTime) OR " +
           "(:startTime <= b.startTime AND :endTime >= b.endTime))")
    List<Booking> findOverlappingBookings(
        @Param("resourceId") UUID resourceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("activeStatuses") List<BookingStatus> activeStatuses
    );

    // Bulk deletion methods
    void deleteByUserId(UUID userId);
    void deleteByStartTimeBefore(LocalDateTime time);
    void deleteByUserIdAndStartTimeBefore(UUID userId, LocalDateTime time);
}
