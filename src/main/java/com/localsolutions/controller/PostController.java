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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String categories,
            @RequestParam(required = false) String status) {
        try {
            // Create a cache key based on all request parameters
            String cacheKey = String.format("posts-%d-%d-%s-%s-%s-%s-%s",
                pageable.getPageNumber(),
                pageable.getPageSize(),
                search != null ? search : "",
                filter != null ? filter : "",
                sortBy != null ? sortBy : "",
                categories != null ? categories : "",
                status != null ? status : "");

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

            // Log all filter parameters
            logger.info("Filter parameters - search: {}, filter: {}, sortBy: {}, category: {}, categories: {}, status: {}",
                search, filter, sortBy, category, categories, status);

            // Process categories parameter if present
            List<PostCategory> postCategories = null;
            if (categories != null && !categories.isEmpty()) {
                String[] categoryArray = categories.split(",");
                logger.info("Processing categories: {}", Arrays.toString(categoryArray));
                postCategories = Arrays.stream(categoryArray)
                    .map(cat -> {
                        try {
                            return PostCategory.valueOf(cat);
                        } catch (IllegalArgumentException e) {
                            logger.error("Invalid category: {}", cat);
                            return null;
                        }
                    })
                    .filter(cat -> cat != null)
                    .collect(Collectors.toList());
                logger.info("Converted to PostCategory list: {}", postCategories);
            } else if (category != null && !category.isEmpty()) {
                // Single category parameter
                try {
                    PostCategory postCategory = PostCategory.valueOf(category);
                    postCategories = Collections.singletonList(postCategory);
                    logger.info("Using single category: {}", postCategory);
                } catch (IllegalArgumentException e) {
                    logger.error("Invalid category: {}", category);
                }
            }

            // Process status parameter if present
            PostStatus postStatus = null;
            if (status != null && !status.isEmpty() && !"ALL".equals(status)) {
                try {
                    postStatus = PostStatus.valueOf(status);
                    logger.info("Using status: {}", postStatus);
                } catch (IllegalArgumentException e) {
                    logger.error("Invalid status: {}", status);
                }
            }

            // Apply filters based on parameters
            if (search != null && !search.isEmpty()) {
                // Search in post content
                logger.info("Searching for posts with content containing: {}", search);
                posts = postService.searchPosts(search, pageable);
            } else if ("popular".equals(filter)) {
                // Get popular posts (most liked)
                logger.info("Getting popular posts");
                posts = postService.getPopularPosts(pageable);
            } else if ("recent".equals(filter)) {
                // Get most recent posts
                logger.info("Getting recent posts");
                posts = postService.getRecentPosts(pageable);
            } else if (postCategories != null && !postCategories.isEmpty() && postStatus != null) {
                // Filter by categories and status
                logger.info("Filtering by categories: {} and status: {}", postCategories, postStatus);
                posts = postService.getPostsByCategoriesAndStatus(postCategories, postStatus, pageable);
            } else if (postCategories != null && !postCategories.isEmpty()) {
                // Filter by categories only
                logger.info("Filtering by categories: {}", postCategories);
                // Log all posts before filtering
                Page<Post> allPosts = postService.getAllPosts(pageable);
                logger.info("Total posts before filtering: {}", allPosts.getTotalElements());
                allPosts.getContent().forEach(post -> {
                    logger.info("Post ID: {}, Category: {}, Content: {}",
                        post.getId(), post.getCategory(),
                        post.getContent().length() > 50 ? post.getContent().substring(0, 50) + "..." : post.getContent());
                });

                // Direct SQL query to check what posts are in the database
                logger.info("Executing direct SQL query to check posts");
                List<Map<String, Object>> sqlResults = jdbcTemplate.queryForList("SELECT id, category, content FROM post");
                sqlResults.forEach(post -> {
                    logger.info("SQL Query - Post ID: {}, Category: {}, Content: {}",
                        post.get("id"), post.get("category"),
                        ((String) post.get("content")).length() > 50 ? ((String) post.get("content")).substring(0, 50) + "..." : post.get("content"));
                });

                // Direct SQL query to check posts with the specific categories
                for (PostCategory cat : postCategories) {
                    logger.info("Executing direct SQL query to check posts with category: {}", cat);
                    List<Map<String, Object>> categoryResults = jdbcTemplate.queryForList(
                        "SELECT id, category, content FROM post WHERE category = ?",
                        cat.name());
                    logger.info("Found {} posts with category {} using direct SQL", categoryResults.size(), cat);
                    categoryResults.forEach(post -> {
                        logger.info("SQL Query - Post ID: {}, Category: {}, Content: {}",
                            post.get("id"), post.get("category"),
                            ((String) post.get("content")).length() > 50 ? ((String) post.get("content")).substring(0, 50) + "..." : post.get("content"));
                    });
                }

                // Now get filtered posts
                try {
                    // Try using the service method first
                    posts = postService.getPostsByCategories(postCategories, pageable);
                    logger.info("Total posts after filtering by categories {}: {}", postCategories, posts.getTotalElements());

                    // If we got no results, try a direct approach
                    if (posts.getTotalElements() == 0) {
                        logger.info("No posts found using service method, trying direct approach");

                        // Convert categories to strings
                        List<String> categoryStrings = postCategories.stream()
                            .map(Enum::name)
                            .collect(Collectors.toList());

                        // Build the SQL query with placeholders
                        StringBuilder sql = new StringBuilder("SELECT * FROM post WHERE category IN (");
                        for (int i = 0; i < categoryStrings.size(); i++) {
                            sql.append(i > 0 ? ", ?" : "?");
                        }
                        sql.append(")");

                        // Execute the query and log the results
                        List<Map<String, Object>> directResults = jdbcTemplate.queryForList(
                            sql.toString(),
                            categoryStrings.toArray());

                        logger.info("Found {} posts using direct SQL query: {}", directResults.size(), sql);
                        directResults.forEach(post -> {
                            logger.info("Direct SQL - Post ID: {}, Category: {}, Content: {}",
                                post.get("id"), post.get("category"),
                                ((String) post.get("content")).length() > 50 ? ((String) post.get("content")).substring(0, 50) + "..." : post.get("content"));
                        });
                    }
                } catch (Exception e) {
                    logger.error("Error filtering posts by categories: {}", e.getMessage());
                    // Fallback to getting all posts
                    posts = postService.getAllPosts(pageable);
                    logger.info("Falling back to all posts: {}", posts.getTotalElements());
                }
            } else if (postStatus != null) {
                // Filter by status only
                logger.info("Filtering by status: {}", postStatus);
                posts = postService.getPostsByStatus(postStatus, pageable);
            } else {
                // Default: get all posts
                logger.info("No filters applied, getting all posts");
                posts = postService.getAllPosts(pageable);
            }

            Page<PostDTO> result = posts.map(this::convertToDTO);
            logger.info("Returning {} posts", result.getTotalElements());
            return ResponseEntity.ok(result);
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

    @GetMapping("/debug/all")
    public ResponseEntity<List<Map<String, Object>>> getAllPostsDebug() {
        logger.info("Debug endpoint - Getting all posts");
        List<Map<String, Object>> posts = jdbcTemplate.queryForList(
            "SELECT id, category, content FROM post");
        logger.info("Found {} posts using direct SQL", posts.size());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/debug/category/{category}")
    public ResponseEntity<List<Map<String, Object>>> getPostsByCategory(@PathVariable String category) {
        logger.info("Debug endpoint - Getting posts with category: {}", category);
        List<Map<String, Object>> posts = jdbcTemplate.queryForList(
            "SELECT id, category, content FROM post WHERE category = ?",
            category);
        logger.info("Found {} posts with category {} using direct SQL", posts.size(), category);
        return ResponseEntity.ok(posts);
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

            // Check if the current user has liked this post
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                    String username = auth.getName();
                    Optional<User> currentUser = userService.getUserByUsername(username);
                    if (currentUser.isPresent()) {
                        dto.setLiked(post.getLikedBy().contains(currentUser.get()));
                    }
                }
            } catch (Exception e) {
                logger.error("Error checking if post is liked by current user", e);
            }
        }

        // Handle comments
        if (post.getComments() != null) {
            dto.setCommentCount(post.getComments().size());
        }

        return dto;
    }
}