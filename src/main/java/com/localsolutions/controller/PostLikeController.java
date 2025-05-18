package com.localsolutions.controller;

import com.localsolutions.model.Post;
import com.localsolutions.model.User;
import com.localsolutions.service.PostService;
import com.localsolutions.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/posts/{postId}/like")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class PostLikeController {

    private static final Logger logger = LoggerFactory.getLogger(PostLikeController.class);

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        try {
            logger.info("Adding like to post ID: {}", postId);

            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOpt = userService.getUserByUsername(username);
            if (!userOpt.isPresent()) {
                logger.warn("User not found with username: {}", username);
                return ResponseEntity.status(401).body("User not authenticated");
            }

            // Check if post exists
            Post post = postService.getPostById(postId);
            if (post == null) {
                logger.warn("Post not found with ID: {}", postId);
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();

            // Check if user already liked the post
            Set<User> likedBy = post.getLikedBy();
            if (likedBy != null && likedBy.contains(user)) {
                logger.info("User {} already liked post {}", username, postId);
                return ResponseEntity.ok().build(); // Already liked, just return OK
            }

            // Add like
            postService.likePost(postId, user.getId());

            logger.info("User {} liked post {}", username, postId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error adding like to post ID: {}", postId, e);
            return ResponseEntity.status(500).body("Error adding like: " + e.getMessage());
        }
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unlikePost(@PathVariable Long postId) {
        try {
            logger.info("Removing like from post ID: {}", postId);

            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOpt = userService.getUserByUsername(username);
            if (!userOpt.isPresent()) {
                logger.warn("User not found with username: {}", username);
                return ResponseEntity.status(401).body("User not authenticated");
            }

            // Check if post exists
            Post post = postService.getPostById(postId);
            if (post == null) {
                logger.warn("Post not found with ID: {}", postId);
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();

            // Check if user liked the post
            Set<User> likedBy = post.getLikedBy();
            if (likedBy == null || !likedBy.contains(user)) {
                logger.info("User {} has not liked post {}", username, postId);
                return ResponseEntity.ok().build(); // Not liked, just return OK
            }

            // Remove like
            postService.unlikePost(postId, user.getId());

            logger.info("User {} unliked post {}", username, postId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error removing like from post ID: {}", postId, e);
            return ResponseEntity.status(500).body("Error removing like: " + e.getMessage());
        }
    }
}
