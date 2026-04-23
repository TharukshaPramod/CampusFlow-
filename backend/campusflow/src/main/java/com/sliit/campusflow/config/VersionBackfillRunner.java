package com.sliit.campusflow.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VersionBackfillRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        backfillVersion("resource_types");
        backfillVersion("resources");
    }

    private void backfillVersion(String tableName) {
        try {
            Integer updatedRows = jdbcTemplate.update("UPDATE " + tableName + " SET version = 0 WHERE version IS NULL");
            if (updatedRows != null && updatedRows > 0) {
                log.warn("Backfilled {} null version value(s) in table {}", updatedRows, tableName);
            } else {
                log.debug("No null version values found in table {}", tableName);
            }
        } catch (Exception ex) {
            log.warn("Skipping version backfill for table {}: {}", tableName, ex.getMessage());
        }
    }
}
