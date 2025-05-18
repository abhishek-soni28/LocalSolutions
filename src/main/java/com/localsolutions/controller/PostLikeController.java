package com.localsolutions.controller;

import com.localsolutions.dto.PostDTO;
import com.localsolutions.dto.UserDTO;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
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

            // Get the updated post
            Post updatedPost = postService.getPostById(postId);
            PostDTO postDTO = convertToDTO(updatedPost);
            postDTO.setLiked(true);

            logger.info("User {} liked post {}", username, postId);
            return ResponseEntity.ok(postDTO);
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

            // Get the updated post
            Post updatedPost = postService.getPostById(postId);
            PostDTO postDTO = convertToDTO(updatedPost);
            postDTO.setLiked(false);

            logger.info("User {} unliked post {}", username, postId);
            return ResponseEntity.ok(postDTO);
        } catch (Exception e) {
            logger.error("Error removing like from post ID: {}", postId, e);
            return ResponseEntity.status(500).body("Error removing like: " + e.getMessage());
        }
    }

    private PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setType(post.getType());
        dto.setStatus(post.getStatus());
        dto.setCategory(post.getCategory());
        dto.setPincode(post.getPincode());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setSolutionProvidedAt(post.getSolutionProvidedAt());

        if (post.getUser() != null) {
            dto.setAuthorName(post.getUser().getFullName());
            dto.setAuthorId(post.getUser().getId());
        }

        // Handle likes
        if (post.getLikedBy() != null) {
            Set<UserDTO> likedByDTOs = post.getLikedBy().stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toSet());
            dto.setLikedBy(likedByDTOs);
            dto.setLikeCount(likedByDTOs.size());
        }

        // Handle comments
        if (post.getComments() != null) {
            dto.setCommentCount(post.getComments().size());
        }

        return dto;
    }
}
