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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostServiceImpl.class);

    @Autowired
    private PostRepository postRepository;

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
        return postRepository.findAll(pageable);
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
}