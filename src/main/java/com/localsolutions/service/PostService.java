package com.localsolutions.service;

import com.localsolutions.model.Post;
import com.localsolutions.model.PostCategory;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PostService {
    Post createPost(Post post);
    Post getPostById(Long id);
    Post updatePost(Long id, Post post);
    void deletePost(Long id);
    Page<Post> getPostsByTypeAndStatus(PostType type, PostStatus status, Pageable pageable);
    Page<Post> getPostsByCategoryAndPincode(PostCategory category, String pincode, Pageable pageable);
    Page<Post> getPostsByUserId(Long userId, Pageable pageable);
    List<Post> getPostsByStatusAndPincode(PostStatus status, String pincode);
    Page<Post> getRelevantPosts(PostType type, PostStatus status, Long userId, Pageable pageable);
    Page<Post> getLocalCategoryPosts(PostType type, PostStatus status, PostCategory category, String pincode, Pageable pageable);
    Post updatePostStatus(Long id, PostStatus status);
    void likePost(Long postId, Long userId);
    void unlikePost(Long postId, Long userId);
    boolean isPostLikedByUser(Long postId, Long userId);
    Page<Post> getAllPosts(Pageable pageable);
    List<Post> getAllPostsWithoutPagination();
    Page<Post> searchPosts(String searchTerm, Pageable pageable);
    Page<Post> getPopularPosts(Pageable pageable);
    Page<Post> getRecentPosts(Pageable pageable);
}