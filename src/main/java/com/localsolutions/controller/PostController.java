package com.localsolutions.controller;

import com.localsolutions.dto.PostDTO;
import com.localsolutions.model.Post;
import com.localsolutions.model.PostCategory;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.PostType;
import com.localsolutions.model.User;
import com.localsolutions.service.PostService;
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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getAllPosts(Pageable pageable) {
        return ResponseEntity.ok(postService.getAllPosts(pageable).map(this::convertToDTO));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        try {
            // Get the current authenticated user's username
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Get the actual User entity from the database
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Set the user for the post
            post.setUser(currentUser);
            
            // Validate required fields
            if (post.getContent() == null || post.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }
            if (post.getType() == null) {
                return ResponseEntity.badRequest().body("Post type is required");
            }
            if (post.getStatus() == null) {
                return ResponseEntity.badRequest().body("Post status is required");
            }
            if (post.getCategory() == null) {
                return ResponseEntity.badRequest().body("Category is required");
            }
            if (post.getPincode() == null || post.getPincode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Pincode is required");
            }
            
            // Create the post
            Post createdPost = postService.createPost(post);
            
            // Return the created post
            return ResponseEntity.ok(convertToDTO(createdPost));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error creating post: {}", e.getMessage());
            return ResponseEntity.status(500).body("Failed to create post: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating post: {}", e.getMessage());
            return ResponseEntity.status(500).body("An unexpected error occurred");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(convertToDTO(postService.getPostById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() and @postService.getPostById(#id).user.id == authentication.principal.id")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long id, @RequestBody Post post) {
        return ResponseEntity.ok(convertToDTO(postService.updatePost(id, post)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated() and (@postService.getPostById(#id).user.id == authentication.principal.id or hasRole('ADMIN'))")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/type/{type}/status/{status}")
    public ResponseEntity<Page<PostDTO>> getPostsByTypeAndStatus(
            @PathVariable PostType type,
            @PathVariable PostStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(postService.getPostsByTypeAndStatus(type, status, pageable).map(this::convertToDTO));
    }

    @GetMapping("/category/{category}/pincode/{pincode}")
    public ResponseEntity<Page<PostDTO>> getPostsByCategoryAndPincode(
            @PathVariable PostCategory category,
            @PathVariable String pincode,
            Pageable pageable) {
        return ResponseEntity.ok(postService.getPostsByCategoryAndPincode(category, pincode, pageable).map(this::convertToDTO));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostDTO>> getPostsByUserId(@PathVariable Long userId, Pageable pageable) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId, pageable).map(this::convertToDTO));
    }

    @GetMapping("/status/{status}/pincode/{pincode}")
    public ResponseEntity<List<PostDTO>> getPostsByStatusAndPincode(
            @PathVariable PostStatus status,
            @PathVariable String pincode) {
        return ResponseEntity.ok(postService.getPostsByStatusAndPincode(status, pincode)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/relevant")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PostDTO>> getRelevantPosts(
            @RequestParam PostType type,
            @RequestParam PostStatus status,
            @RequestParam Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(postService.getRelevantPosts(type, status, userId, pageable).map(this::convertToDTO));
    }

    @GetMapping("/local/{category}/{pincode}")
    public ResponseEntity<Page<PostDTO>> getLocalCategoryPosts(
            @PathVariable PostCategory category,
            @PathVariable String pincode,
            @RequestParam PostType type,
            @RequestParam PostStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(postService.getLocalCategoryPosts(type, status, category, pincode, pageable).map(this::convertToDTO));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated() and (@postService.getPostById(#id).user.id == authentication.principal.id or hasRole('ADMIN'))")
    public ResponseEntity<PostDTO> updatePostStatus(
            @PathVariable Long id,
            @RequestParam PostStatus status) {
        return ResponseEntity.ok(convertToDTO(postService.updatePostStatus(id, status)));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> likePost(
            @PathVariable Long id,
            @RequestParam Long userId) {
        postService.likePost(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unlikePost(
            @PathVariable Long id,
            @RequestParam Long userId) {
        postService.unlikePost(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/liked")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> isPostLikedByUser(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(postService.isPostLikedByUser(id, userId));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPostsWithoutPagination() {
        try {
            logger.info("Attempting to fetch all posts without pagination");
            List<Post> posts = postService.getAllPostsWithoutPagination();
            List<PostDTO> postDTOs = posts.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.info("Successfully fetched {} posts", postDTOs.size());
            return ResponseEntity.ok(postDTOs);
        } catch (Exception e) {
            logger.error("Error fetching all posts", e);
            return ResponseEntity.internalServerError().body("Error fetching posts: " + e.getMessage());
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
        return dto;
    }
} 