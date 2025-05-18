package com.localsolutions.repository;

import com.localsolutions.model.Post;
import com.localsolutions.model.PostCategory;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Add method to find all posts without pagination
    List<Post> findAll();

    Page<Post> findByTypeAndStatus(PostType type, PostStatus status, Pageable pageable);
    Page<Post> findByCategoryAndPincode(PostCategory category, String pincode, Pageable pageable);
    Page<Post> findByUserId(Long userId, Pageable pageable);
    List<Post> findByStatusAndPincode(PostStatus status, String pincode);

    @Query("SELECT p FROM Post p WHERE p.type = ?1 AND p.status = ?2 AND p.pincode IN (SELECT u.pincode FROM User u WHERE u.id = ?3)")
    Page<Post> findRelevantPosts(PostType type, PostStatus status, Long userId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.type = ?1 AND p.status = ?2 AND p.category = ?3 AND p.pincode = ?4 ORDER BY p.createdAt DESC")
    Page<Post> findLocalCategoryPosts(PostType type, PostStatus status, PostCategory category, String pincode, Pageable pageable);

    // Search posts by content (case-insensitive)
    Page<Post> findByContentContainingIgnoreCase(String content, Pageable pageable);

    // Find posts ordered by creation date (newest first)
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}