package com.localsolutions.service.impl;

import com.localsolutions.model.Notification;
import com.localsolutions.model.Post;
import com.localsolutions.model.User;
import com.localsolutions.repository.NotificationRepository;
import com.localsolutions.repository.PostRepository;
import com.localsolutions.repository.UserRepository;
import com.localsolutions.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Override
    public Notification saveNotification(Notification notification) {
        logger.info("Saving notification for user ID: {}", notification.getUser().getId());
        return notificationRepository.save(notification);
    }

    @Override
    public Notification getNotificationById(Long id) {
        logger.info("Fetching notification with ID: {}", id);
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @Override
    public List<Notification> getNotificationsByUserId(Long userId) {
        logger.info("Fetching all notifications for user ID: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Page<Notification> getNotificationsByUserId(Long userId, Pageable pageable) {
        logger.info("Fetching paginated notifications for user ID: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        logger.info("Fetching unread notifications for user ID: {}", userId);
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    @Override
    public long countUnreadNotifications(Long userId) {
        logger.info("Counting unread notifications for user ID: {}", userId);
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        logger.info("Marking notification as read: {}", notificationId);
        Notification notification = getNotificationById(notificationId);
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        logger.info("Marking all notifications as read for user ID: {}", userId);
        notificationRepository.markAllAsRead(userId);
    }

    @Override
    public void createPostLikeNotification(Long postId, Long likerId, Long authorId) {
        // Don't notify if the liker is the author
        if (likerId.equals(authorId)) {
            return;
        }
        
        try {
            User liker = userRepository.findById(likerId)
                    .orElseThrow(() -> new RuntimeException("Liker not found"));
            
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Author not found"));
            
            Notification notification = new Notification();
            notification.setUser(author);
            notification.setType("POST_LIKE");
            notification.setContent(liker.getFullName() + " liked your post");
            notification.setRelatedId(postId);
            
            saveNotification(notification);
        } catch (Exception e) {
            logger.error("Error creating post like notification: {}", e.getMessage());
        }
    }

    @Override
    public void createPostCommentNotification(Long postId, Long commenterId, Long authorId) {
        // Don't notify if the commenter is the author
        if (commenterId.equals(authorId)) {
            return;
        }
        
        try {
            User commenter = userRepository.findById(commenterId)
                    .orElseThrow(() -> new RuntimeException("Commenter not found"));
            
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Author not found"));
            
            Notification notification = new Notification();
            notification.setUser(author);
            notification.setType("POST_COMMENT");
            notification.setContent(commenter.getFullName() + " commented on your post");
            notification.setRelatedId(postId);
            
            saveNotification(notification);
        } catch (Exception e) {
            logger.error("Error creating post comment notification: {}", e.getMessage());
        }
    }

    @Override
    public void createFollowNotification(Long followerId, Long followingId) {
        try {
            User follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new RuntimeException("Follower not found"));
            
            User following = userRepository.findById(followingId)
                    .orElseThrow(() -> new RuntimeException("Following not found"));
            
            Notification notification = new Notification();
            notification.setUser(following);
            notification.setType("FOLLOW");
            notification.setContent(follower.getFullName() + " started following you");
            notification.setRelatedId(followerId);
            
            saveNotification(notification);
        } catch (Exception e) {
            logger.error("Error creating follow notification: {}", e.getMessage());
        }
    }

    @Override
    public void createMessageNotification(Long senderId, Long receiverId) {
        try {
            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Sender not found"));
            
            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            
            Notification notification = new Notification();
            notification.setUser(receiver);
            notification.setType("MESSAGE");
            notification.setContent("New message from " + sender.getFullName());
            notification.setRelatedId(senderId);
            
            saveNotification(notification);
        } catch (Exception e) {
            logger.error("Error creating message notification: {}", e.getMessage());
        }
    }

    @Override
    public void createPostSolutionNotification(Long postId, Long solverId, Long authorId) {
        // Don't notify if the solver is the author
        if (solverId.equals(authorId)) {
            return;
        }
        
        try {
            User solver = userRepository.findById(solverId)
                    .orElseThrow(() -> new RuntimeException("Solver not found"));
            
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Author not found"));
            
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            Notification notification = new Notification();
            notification.setUser(author);
            notification.setType("POST_SOLUTION");
            notification.setContent(solver.getFullName() + " provided a solution to your post");
            notification.setRelatedId(postId);
            
            saveNotification(notification);
        } catch (Exception e) {
            logger.error("Error creating post solution notification: {}", e.getMessage());
        }
    }
}
