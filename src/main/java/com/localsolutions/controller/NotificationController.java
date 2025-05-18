package com.localsolutions.controller;

import com.localsolutions.dto.NotificationDTO;
import com.localsolutions.model.Notification;
import com.localsolutions.model.User;
import com.localsolutions.service.NotificationService;
import com.localsolutions.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getNotifications(Pageable pageable) {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the notifications
            Page<Notification> notifications = notificationService.getNotificationsByUserId(currentUser.getId(), pageable);
            
            // Convert to DTOs
            Page<NotificationDTO> notificationDTOs = notifications.map(NotificationDTO::fromNotification);
            
            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            logger.error("Error fetching notifications: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching notifications: " + e.getMessage());
        }
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUnreadNotifications() {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the unread notifications
            List<Notification> notifications = notificationService.getUnreadNotifications(currentUser.getId());
            
            // Convert to DTOs
            List<NotificationDTO> notificationDTOs = notifications.stream()
                    .map(NotificationDTO::fromNotification)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            logger.error("Error fetching unread notifications: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching unread notifications: " + e.getMessage());
        }
    }

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUnreadCount() {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the unread count
            long unreadCount = notificationService.countUnreadNotifications(currentUser.getId());
            
            Map<String, Long> response = new HashMap<>();
            response.put("unreadCount", unreadCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching unread count: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching unread count: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the notification
            Notification notification = notificationService.getNotificationById(id);
            
            // Check if the current user is the owner of the notification
            if (!notification.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body("You are not authorized to mark this notification as read");
            }
            
            // Mark as read
            notificationService.markAsRead(id);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error marking notification as read: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error marking notification as read: " + e.getMessage());
        }
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAllAsRead() {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Mark all as read
            notificationService.markAllAsRead(currentUser.getId());
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error marking all notifications as read: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error marking all notifications as read: " + e.getMessage());
        }
    }
}
