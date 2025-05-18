package com.localsolutions.service.impl;

import com.localsolutions.model.Post;
import com.localsolutions.model.PostCategory;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.PostType;
import com.localsolutions.model.User;
import com.localsolutions.repository.PostRepository;
import com.localsolutions.repository.UserRepository;
import com.localsolutions.service.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostServiceImpl.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Post createPost(Post post) {
        try {
            // Validate required fields
            if (post.getContent() == null || post.getContent().trim().isEmpty()) {
                throw new IllegalArgumentException("Content is required");
            }
            if (post.getType() == null) {
                throw new IllegalArgumentException("Post type is required");
            }
            if (post.getStatus() == null) {
                throw new IllegalArgumentException("Post status is required");
            }
            if (post.getCategory() == null) {
                throw new IllegalArgumentException("Category is required");
            }
            if (post.getPincode() == null || post.getPincode().trim().isEmpty()) {
                throw new IllegalArgumentException("Pincode is required");
            }
            if (post.getUser() == null) {
                throw new IllegalArgumentException("User is required");
            }

            // Set creation timestamp
            post.setCreatedAt(LocalDateTime.now());

            // Save the post
            return postRepository.save(post);
        } catch (Exception e) {
            logger.error("Error creating post: {}", e.getMessage());
            throw new RuntimeException("Failed to create post: " + e.getMessage());
        }
    }

    @Override
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    @Override
    public Post updatePost(Long id, Post postDetails) {
        Post post = getPostById(id);

        // Only update these fields if they are not null in the postDetails
        if (postDetails.getContent() != null) {
            post.setContent(postDetails.getContent());
        }
        if (postDetails.getImageUrl() != null) {
            post.setImageUrl(postDetails.getImageUrl());
        }
        if (postDetails.getCategory() != null) {
            post.setCategory(postDetails.getCategory());
        }
        if (postDetails.getPincode() != null) {
            post.setPincode(postDetails.getPincode());
        }

        // Preserve the likedBy set
        if (postDetails.getLikedBy() != null && !postDetails.getLikedBy().isEmpty()) {
            post.setLikedBy(postDetails.getLikedBy());
        }

        return postRepository.save(post);
    }

    @Override
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    @Override
    public Page<Post> getPostsByTypeAndStatus(PostType type, PostStatus status, Pageable pageable) {
        return postRepository.findByTypeAndStatus(type, status, pageable);
    }

    @Override
    public Page<Post> getPostsByCategoryAndPincode(PostCategory category, String pincode, Pageable pageable) {
        return postRepository.findByCategoryAndPincode(category, pincode, pageable);
    }

    @Override
    public Page<Post> getPostsByUserId(Long userId, Pageable pageable) {
        return postRepository.findByUserId(userId, pageable);
    }

    @Override
    public List<Post> getPostsByStatusAndPincode(PostStatus status, String pincode) {
        return postRepository.findByStatusAndPincode(status, pincode);
    }

    @Override
    public Page<Post> getRelevantPosts(PostType type, PostStatus status, Long userId, Pageable pageable) {
        return postRepository.findRelevantPosts(type, status, userId, pageable);
    }

    @Override
    public Page<Post> getLocalCategoryPosts(PostType type, PostStatus status, PostCategory category, String pincode, Pageable pageable) {
        return postRepository.findLocalCategoryPosts(type, status, category, pincode, pageable);
    }

    @Override
    public Post updatePostStatus(Long id, PostStatus status) {
        Post post = getPostById(id);
        post.setStatus(status);
        if (status == PostStatus.RESOLVED) {
            post.setSolutionProvidedAt(LocalDateTime.now());
        }
        return postRepository.save(post);
    }

    @Override
    public void likePost(Long postId, Long userId) {
        Post post = getPostById(postId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!post.getLikedBy().contains(user)) {
            post.getLikedBy().add(user);
            postRepository.save(post);
        }
    }

    @Override
    public void unlikePost(Long postId, Long userId) {
        Post post = getPostById(postId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        post.getLikedBy().remove(user);
        postRepository.save(post);
    }

    @Override
    public boolean isPostLikedByUser(Long postId, Long userId) {
        Post post = getPostById(postId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return post.getLikedBy().contains(user);
    }

    @Override
    public Page<Post> getAllPosts(Pageable pageable) {
        Page<Post> posts = postRepository.findAll(pageable);
        logger.info("Found {} posts in total", posts.getTotalElements());

        // Log the distribution of categories
        Map<PostCategory, Long> categoryCounts = new HashMap<>();
        for (PostCategory category : PostCategory.values()) {
            categoryCounts.put(category, 0L);
        }

        for (Post post : posts.getContent()) {
            PostCategory category = post.getCategory();
            categoryCounts.put(category, categoryCounts.getOrDefault(category, 0L) + 1);
        }

        logger.info("Category distribution: {}", categoryCounts);

        return posts;
    }

    @Override
    public List<Post> getAllPostsWithoutPagination() {
        try {
            logger.info("Fetching all posts from repository");
            List<Post> posts = postRepository.findAll();
            logger.info("Found {} posts in repository", posts.size());
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching all posts from repository", e);
            throw e;
        }
    }

    @Override
    public Page<Post> searchPosts(String searchTerm, Pageable pageable) {
        try {
            logger.info("Searching posts with term: {}", searchTerm);
            // Search in post content (case-insensitive)
            Page<Post> posts = postRepository.findByContentContainingIgnoreCase(searchTerm, pageable);
            logger.info("Found {} posts matching search term", posts.getTotalElements());
            return posts;
        } catch (Exception e) {
            logger.error("Error searching posts with term: {}", searchTerm, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPopularPosts(Pageable pageable) {
        try {
            logger.info("Fetching popular posts");
            // For now, we'll define popular as posts with most likes
            // This would need to be implemented in the repository
            // For simplicity, we'll just return all posts for now
            Page<Post> posts = postRepository.findAll(pageable);
            logger.info("Found {} popular posts", posts.getTotalElements());
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching popular posts", e);
            throw e;
        }
    }

    @Override
    public Page<Post> getRecentPosts(Pageable pageable) {
        try {
            logger.info("Fetching recent posts");
            // Find posts ordered by creation date (newest first)
            Page<Post> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
            logger.info("Found {} recent posts", posts.getTotalElements());
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching recent posts", e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByCategory(PostCategory category, Pageable pageable) {
        try {
            logger.info("Fetching posts by category: {}", category);
            Page<Post> posts = postRepository.findByCategory(category, pageable);
            logger.info("Found {} posts for category: {}", posts.getTotalElements(), category);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by category: {}", category, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByCategories(List<PostCategory> categories, Pageable pageable) {
        try {
            if (categories == null || categories.isEmpty()) {
                logger.warn("No categories provided, returning all posts");
                return getAllPosts(pageable);
            }

            logger.info("Fetching posts by categories: {}", categories);
            // Get all posts first for comparison
            Page<Post> allPosts = getAllPosts(pageable);
            logger.info("Total posts in database: {}", allPosts.getTotalElements());

            // Log the categories of all posts
            logger.info("Categories of all posts: {}",
                allPosts.getContent().stream()
                    .map(Post::getCategory)
                    .distinct()
                    .collect(Collectors.toList()));

            // Direct SQL query to check what posts are in the database
            logger.info("Executing direct SQL query to check posts");
            List<Map<String, Object>> sqlPosts = jdbcTemplate.queryForList("SELECT id, category, content FROM post");
            logger.info("Found {} posts using direct SQL", sqlPosts.size());
            sqlPosts.forEach(post -> {
                logger.info("SQL Query - Post ID: {}, Category: {}, Content: {}",
                    post.get("id"), post.get("category"),
                    ((String) post.get("content")).length() > 50 ? ((String) post.get("content")).substring(0, 50) + "..." : post.get("content"));
            });

            // Direct SQL query to check posts with the specific categories
            for (PostCategory cat : categories) {
                logger.info("Executing direct SQL query to check posts with category: {}", cat);
                List<Map<String, Object>> catPosts = jdbcTemplate.queryForList(
                    "SELECT id, category, content FROM post WHERE category = ?",
                    cat.name());
                logger.info("Found {} posts with category {} using direct SQL", catPosts.size(), cat);
                catPosts.forEach(post -> {
                    logger.info("SQL Query - Post ID: {}, Category: {}, Content: {}",
                        post.get("id"), post.get("category"),
                        ((String) post.get("content")).length() > 50 ? ((String) post.get("content")).substring(0, 50) + "..." : post.get("content"));
                });
            }

            // Now get posts filtered by categories
            logger.info("Calling repository.findByCategoryIn with categories: {}", categories);
            Page<Post> posts;
            try {
                posts = postRepository.findByCategoryIn(categories, pageable);
                logger.info("Found {} posts for categories: {}", posts.getTotalElements(), categories);
            } catch (Exception e) {
                logger.error("Error using JPQL query for categories: {}", e.getMessage());
                logger.info("Falling back to native query");
                // Convert PostCategory enum to string for native query
                List<String> categoryStrings = categories.stream()
                    .map(Enum::name)
                    .collect(Collectors.toList());
                posts = postRepository.findByCategoryInNative(categoryStrings, pageable);
                logger.info("Found {} posts using native query for categories: {}", posts.getTotalElements(), categoryStrings);
            }

            // Log each post that was found
            if (posts.hasContent()) {
                posts.getContent().forEach(post -> {
                    logger.info("Found post - ID: {}, Category: {}, Content: {}",
                        post.getId(), post.getCategory(),
                        post.getContent().length() > 50 ? post.getContent().substring(0, 50) + "..." : post.getContent());
                });
            } else {
                logger.warn("No posts found for categories: {}", categories);
            }

            // Log the first few posts for debugging
            if (posts.hasContent()) {
                List<Post> content = posts.getContent();
                int count = Math.min(content.size(), 5);
                for (int i = 0; i < count; i++) {
                    Post post = content.get(i);
                    logger.info("Post {}: id={}, category={}, content={}",
                        i, post.getId(), post.getCategory(),
                        post.getContent().length() > 50 ? post.getContent().substring(0, 50) + "..." : post.getContent());
                }
            }

            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by categories: {}", categories, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByStatus(PostStatus status, Pageable pageable) {
        try {
            logger.info("Fetching posts by status: {}", status);
            Page<Post> posts = postRepository.findByStatus(status, pageable);
            logger.info("Found {} posts for status: {}", posts.getTotalElements(), status);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by status: {}", status, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByCategoryAndStatus(PostCategory category, PostStatus status, Pageable pageable) {
        try {
            logger.info("Fetching posts by category: {} and status: {}", category, status);
            Page<Post> posts = postRepository.findByCategoryAndStatus(category, status, pageable);
            logger.info("Found {} posts for category: {} and status: {}", posts.getTotalElements(), category, status);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by category: {} and status: {}", category, status, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByCategoriesAndStatus(List<PostCategory> categories, PostStatus status, Pageable pageable) {
        try {
            if (categories == null || categories.isEmpty()) {
                logger.warn("No categories provided, returning posts by status: {}", status);
                return getPostsByStatus(status, pageable);
            }

            logger.info("Fetching posts by categories: {} and status: {}", categories, status);
            Page<Post> posts = postRepository.findByCategoryInAndStatus(categories, status, pageable);
            logger.info("Found {} posts for categories: {} and status: {}", posts.getTotalElements(), categories, status);

            // Log the first few posts for debugging
            if (posts.hasContent()) {
                List<Post> content = posts.getContent();
                int count = Math.min(content.size(), 5);
                for (int i = 0; i < count; i++) {
                    Post post = content.get(i);
                    logger.info("Post {}: id={}, category={}, status={}, content={}",
                        i, post.getId(), post.getCategory(), post.getStatus(),
                        post.getContent().length() > 50 ? post.getContent().substring(0, 50) + "..." : post.getContent());
                }
            }

            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by categories: {} and status: {}", categories, status, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByPincode(String pincode, Pageable pageable) {
        try {
            logger.info("Fetching posts by pincode: {}", pincode);
            Page<Post> posts = postRepository.findByPincode(pincode, pageable);
            logger.info("Found {} posts for pincode: {}", posts.getTotalElements(), pincode);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by pincode: {}", pincode, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByPincodeAndCategory(String pincode, PostCategory category, Pageable pageable) {
        try {
            logger.info("Fetching posts by pincode: {} and category: {}", pincode, category);
            Page<Post> posts = postRepository.findByPincodeAndCategory(pincode, category, pageable);
            logger.info("Found {} posts for pincode: {} and category: {}", posts.getTotalElements(), pincode, category);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by pincode: {} and category: {}", pincode, category, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByPincodeAndType(String pincode, PostType type, Pageable pageable) {
        try {
            logger.info("Fetching posts by pincode: {} and type: {}", pincode, type);
            Page<Post> posts = postRepository.findByPincodeAndType(pincode, type, pageable);
            logger.info("Found {} posts for pincode: {} and type: {}", posts.getTotalElements(), pincode, type);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by pincode: {} and type: {}", pincode, type, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByPincodeTypeAndStatus(String pincode, PostType type, PostStatus status, Pageable pageable) {
        try {
            logger.info("Fetching posts by pincode: {}, type: {}, and status: {}", pincode, type, status);
            Page<Post> posts = postRepository.findByPincodeAndTypeAndStatus(pincode, type, status, pageable);
            logger.info("Found {} posts for pincode: {}, type: {}, and status: {}", posts.getTotalElements(), pincode, type, status);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by pincode: {}, type: {}, and status: {}", pincode, type, status, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByPincodeTypeStatusAndCategory(String pincode, PostType type, PostStatus status, PostCategory category, Pageable pageable) {
        try {
            logger.info("Fetching posts by pincode: {}, type: {}, status: {}, and category: {}", pincode, type, status, category);
            Page<Post> posts = postRepository.findByPincodeAndTypeAndStatusAndCategory(pincode, type, status, category, pageable);
            logger.info("Found {} posts for pincode: {}, type: {}, status: {}, and category: {}", posts.getTotalElements(), pincode, type, status, category);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by pincode: {}, type: {}, status: {}, and category: {}", pincode, type, status, category, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByNearbyPincode(String pincode, Pageable pageable) {
        try {
            logger.info("Fetching posts by nearby pincode: {}", pincode);
            Page<Post> posts = postRepository.findByNearbyPincode(pincode, pageable);
            logger.info("Found {} posts for nearby pincode: {}", posts.getTotalElements(), pincode);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by nearby pincode: {}", pincode, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPostsByNearbyPincodeAndCategory(String pincode, PostCategory category, Pageable pageable) {
        try {
            logger.info("Fetching posts by nearby pincode: {} and category: {}", pincode, category);
            Page<Post> posts = postRepository.findByNearbyPincodeAndCategory(pincode, category, pageable);
            logger.info("Found {} posts for nearby pincode: {} and category: {}", posts.getTotalElements(), pincode, category);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching posts by nearby pincode: {} and category: {}", pincode, category, e);
            throw e;
        }
    }

    @Override
    public Page<Post> getPopularPostsByPincode(String pincode, Pageable pageable) {
        try {
            logger.info("Fetching popular posts by pincode: {}", pincode);
            Page<Post> posts = postRepository.findPopularPostsByPincode(pincode, pageable);
            logger.info("Found {} popular posts for pincode: {}", posts.getTotalElements(), pincode);
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching popular posts by pincode: {}", pincode, e);
            throw e;
        }
    }

    @Override
    public Page<Post> searchPostsByContentAndPincode(String query, String pincode, Pageable pageable) {
        try {
            logger.info("Searching posts by content: {} and pincode: {}", query, pincode);
            Page<Post> posts = postRepository.searchPostsByContentAndPincode(query, pincode, pageable);
            logger.info("Found {} posts matching content: {} and pincode: {}", posts.getTotalElements(), query, pincode);
            return posts;
        } catch (Exception e) {
            logger.error("Error searching posts by content: {} and pincode: {}", query, pincode, e);
            throw e;
        }
    }

    @Override
    public long countPosts() {
        try {
            logger.info("Counting all posts");
            long count = postRepository.count();
            logger.info("Total posts count: {}", count);
            return count;
        } catch (Exception e) {
            logger.error("Error counting posts", e);
            throw e;
        }
    }

    @Override
    public long countPostsByStatus(PostStatus status) {
        try {
            logger.info("Counting posts by status: {}", status);
            long count = postRepository.countByStatus(status);
            logger.info("Posts count for status {}: {}", status, count);
            return count;
        } catch (Exception e) {
            logger.error("Error counting posts by status: {}", status, e);
            throw e;
        }
    }
}