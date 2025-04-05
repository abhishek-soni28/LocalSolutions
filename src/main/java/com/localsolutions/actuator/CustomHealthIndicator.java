package com.localsolutions.actuator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public Health health() {
        try {
            // Check database connectivity
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            return Health.up()
                .withDetail("database", "Database is up")
                .withDetail("app", "Application is running")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("database", "Database is down: " + e.getMessage())
                .withDetail("app", "Application is experiencing issues")
                .build();
        }
    }
} 