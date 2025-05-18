package com.localsolutions.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig class is kept for potential future MVC configurations.
 * CORS configuration has been centralized in SecurityConfig to avoid conflicts.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration moved to SecurityConfig
}