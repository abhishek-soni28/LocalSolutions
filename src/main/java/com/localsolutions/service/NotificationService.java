package com.localsolutions.service;

import com.localsolutions.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    Notification saveNotification(Notification notification);
    Notification getNotificationById(Long id);
    List<Notification> getNotificationsByUserId(Long userId);
    Page<Notification> getNotificationsByUserId(Long userId, Pageable pageable);
    List<Notification> getUnreadNotifications(Long userId);
    long countUnreadNotifications(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    
    // Helper methods for creating common notifications
    void createPostLikeNotification(Long postId, Long likerId, Long authorId);
    void createPostCommentNotification(Long postId, Long commenterId, Long authorId);
    void createFollowNotification(Long followerId, Long followingId);
    void createMessageNotification(Long senderId, Long receiverId);
    void createPostSolutionNotification(Long postId, Long solverId, Long authorId);
}
