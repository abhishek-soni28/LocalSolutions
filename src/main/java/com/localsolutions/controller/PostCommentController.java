package com.localsolutions.controller;

import com.localsolutions.dto.CommentDTO;
import com.localsolutions.model.Comment;
import com.localsolutions.model.Post;
import com.localsolutions.model.User;
import com.localsolutions.service.CommentService;
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

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class PostCommentController {

    private static final Logger logger = LoggerFactory.getLogger(PostCommentController.class);

    @Autowired
    private CommentService commentService;

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getCommentsByPostId(@PathVariable Long postId) {
        try {
            logger.info("Fetching comments for post ID: {}", postId);

            // Check if post exists
            Post post = postService.getPostById(postId);
            if (post == null) {
                logger.warn("Post not found with ID: {}", postId);
                return ResponseEntity.notFound().build();
            }

            List<Comment> comments = commentService.getCommentsByPostId(postId);
            logger.info("Found {} comments for post ID: {}", comments.size(), postId);

            // Convert to DTOs to avoid serialization issues
            List<CommentDTO> commentDTOs = comments.stream()
                .map(CommentDTO::fromComment)
                .toList();

            return ResponseEntity.ok(commentDTOs);
        } catch (Exception e) {
            logger.error("Error fetching comments for post ID: {}", postId, e);
            return ResponseEntity.status(500).body("Error fetching comments: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createComment(@PathVariable Long postId, @RequestBody Map<String, String> payload) {
        try {
            logger.info("Creating comment for post ID: {}", postId);

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

            // Validate comment content
            String content = payload.get("content");
            if (content == null || content.trim().isEmpty()) {
                logger.warn("Comment content is empty");
                return ResponseEntity.badRequest().body("Comment content cannot be empty");
            }

            // Create and save comment
            Comment comment = new Comment();
            comment.setContent(content);
            comment.setUser(userOpt.get());
            comment.setPost(post);

            Comment savedComment = commentService.saveComment(comment);
            logger.info("Comment created with ID: {}", savedComment.getId());

            // Convert to DTO to avoid serialization issues
            CommentDTO commentDTO = CommentDTO.fromComment(savedComment);

            return ResponseEntity.ok(commentDTO);
        } catch (Exception e) {
            logger.error("Error creating comment for post ID: {}", postId, e);
            return ResponseEntity.status(500).body("Error creating comment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteComment(@PathVariable Long postId, @PathVariable Long commentId) {
        try {
            logger.info("Deleting comment ID: {} from post ID: {}", commentId, postId);

            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOpt = userService.getUserByUsername(username);
            if (!userOpt.isPresent()) {
                logger.warn("User not found with username: {}", username);
                return ResponseEntity.status(401).body("User not authenticated");
            }

            // Check if comment exists
            Optional<Comment> commentOpt = commentService.getCommentById(commentId);
            if (!commentOpt.isPresent()) {
                logger.warn("Comment not found with ID: {}", commentId);
                return ResponseEntity.notFound().build();
            }

            Comment comment = commentOpt.get();

            // Check if user is the comment owner or an admin
            if (!comment.getUser().getId().equals(userOpt.get().getId()) &&
                !userOpt.get().getRole().toString().equals("ADMIN")) {
                logger.warn("User {} is not authorized to delete comment {}", username, commentId);
                return ResponseEntity.status(403).body("Not authorized to delete this comment");
            }

            // Check if comment belongs to the specified post
            if (!comment.getPost().getId().equals(postId)) {
                logger.warn("Comment {} does not belong to post {}", commentId, postId);
                return ResponseEntity.badRequest().body("Comment does not belong to the specified post");
            }

            commentService.deleteComment(commentId);
            logger.info("Comment deleted with ID: {}", commentId);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting comment ID: {} from post ID: {}", commentId, postId, e);
            return ResponseEntity.status(500).body("Error deleting comment: " + e.getMessage());
        }
    }
}
