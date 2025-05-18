package com.localsolutions.controller;

import com.localsolutions.dto.PostDTO;
import com.localsolutions.dto.UserDTO;
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
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    // Simple request cache to prevent duplicate requests in short time periods
    private final ConcurrentHashMap<String, Long> requestCache = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRY_MS = 500; // 500ms cache

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) String sortBy) {
        try {
            // Create a cache key based on all request parameters
            String cacheKey = String.format("posts-%d-%d-%s-%s-%s",
                pageable.getPageNumber(),
                pageable.getPageSize(),
                search != null ? search : "",
                filter != null ? filter : "",
                sortBy != null ? sortBy : "");

            // Check if we've recently served this exact request
            Long lastRequestTime = requestCache.get(cacheKey);
            long now = System.currentTimeMillis();

            if (lastRequestTime != null && (now - lastRequestTime) < CACHE_EXPIRY_MS) {
                logger.debug("Returning cached response for {}", cacheKey);
                // Still process the request but log it as a duplicate
            }

            // Update the cache with the current request time
            requestCache.put(cacheKey, now);

            // Clean up old cache entries periodically
            if (requestCache.size() > 100) { // Prevent unbounded growth
                requestCache.entrySet().removeIf(entry -> (now - entry.getValue()) > TimeUnit.MINUTES.toMillis(5));
            }

            // Apply filters based on parameters
            Page<Post> posts;

            if (search != null && !search.isEmpty()) {
                // Search in post content
                posts = postService.searchPosts(search, pageable);
            } else if ("popular".equals(filter)) {
                // Get popular posts (most liked)
                posts = postService.getPopularPosts(pageable);
            } else if ("recent".equals(filter)) {
                // Get most recent posts
                posts = postService.getRecentPosts(pageable);
            } else {
                // Default: get all posts
                posts = postService.getAllPosts(pageable);
            }

            return ResponseEntity.ok(posts.map(this::convertToDTO));
        } catch (Exception e) {
            logger.error("Error fetching posts", e);
            throw e; // Let the global exception handler deal with it
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        try {
            logger.info("Received post creation request: {}", post);

            // Get the current authenticated user's username
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Current user: {}", username);

            // Get the actual User entity from the database
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            logger.info("Found user in database: {}", currentUser.getId());

            // Set the user for the post
            post.setUser(currentUser);

            // Set default values if not provided
            if (post.getType() == null) {
                post.setType(PostType.PROBLEM);
                logger.debug("Set default post type: PROBLEM");
            }
            if (post.getStatus() == null) {
                post.setStatus(PostStatus.OPEN);
                logger.debug("Set default post status: OPEN");
            }
            if (post.getCategory() == null) {
                post.setCategory(PostCategory.GENERAL);
                logger.debug("Set default post category: GENERAL");
            }

            // Validate required fields
            if (post.getContent() == null || post.getContent().trim().isEmpty()) {
                logger.warn("Post creation failed: Content is required");
                return ResponseEntity.badRequest().body("Content is required");
            }
            if (post.getPincode() == null || post.getPincode().trim().isEmpty()) {
                logger.warn("Post creation failed: Pincode is required");
                return ResponseEntity.badRequest().body("Pincode is required");
            }

            // Create the post
            logger.info("Creating post with data: {}", post);
            Post createdPost = postService.createPost(post);
            logger.info("Post created successfully with ID: {}", createdPost.getId());

            // Return the created post
            return ResponseEntity.ok(convertToDTO(createdPost));
        } catch (IllegalArgumentException e) {
            logger.error("Validation error creating post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error creating post: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to create post: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating post: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("An unexpected error occurred: " + e.getMessage());
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

    // Like/unlike functionality moved to PostLikeController

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

        // Handle likes
        if (post.getLikedBy() != null) {
            Set<UserDTO> likedByDTOs = post.getLikedBy().stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toSet());
            dto.setLikedBy(likedByDTOs);
            dto.setLikeCount(likedByDTOs.size());
        }

        return dto;
    }
}