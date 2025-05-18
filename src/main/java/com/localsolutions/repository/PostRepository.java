package com.localsolutions.repository;

import com.localsolutions.model.Post;
import com.localsolutions.model.PostCategory;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // Find posts by category
    Page<Post> findByCategory(PostCategory category, Pageable pageable);

    // Find posts by multiple categories
    @Query("SELECT p FROM Post p WHERE p.category IN :categories")
    Page<Post> findByCategoryIn(@Param("categories") List<PostCategory> categories, Pageable pageable);

    // Native query for finding posts by multiple categories (as a fallback)
    @Query(value = "SELECT * FROM post p WHERE p.category IN :categories", nativeQuery = true)
    Page<Post> findByCategoryInNative(@Param("categories") List<String> categories, Pageable pageable);

    // Find posts by status
    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    // Find posts by category and status
    Page<Post> findByCategoryAndStatus(PostCategory category, PostStatus status, Pageable pageable);

    // Find posts by multiple categories and status
    @Query("SELECT p FROM Post p WHERE p.category IN :categories AND p.status = :status")
    Page<Post> findByCategoryInAndStatus(@Param("categories") List<PostCategory> categories, @Param("status") PostStatus status, Pageable pageable);

    // Find posts by pincode
    Page<Post> findByPincode(String pincode, Pageable pageable);

    // Find posts by pincode and category
    Page<Post> findByPincodeAndCategory(String pincode, PostCategory category, Pageable pageable);

    // Find posts by pincode and type
    Page<Post> findByPincodeAndType(String pincode, PostType type, Pageable pageable);

    // Find posts by pincode, type, and status
    Page<Post> findByPincodeAndTypeAndStatus(String pincode, PostType type, PostStatus status, Pageable pageable);

    // Find posts by pincode, type, status, and category
    Page<Post> findByPincodeAndTypeAndStatusAndCategory(String pincode, PostType type, PostStatus status, PostCategory category, Pageable pageable);

    // Find posts by nearby pincodes (first 3 digits match)
    @Query("SELECT p FROM Post p WHERE SUBSTRING(p.pincode, 1, 3) = SUBSTRING(:pincode, 1, 3) ORDER BY p.createdAt DESC")
    Page<Post> findByNearbyPincode(@Param("pincode") String pincode, Pageable pageable);

    // Find posts by nearby pincodes and category
    @Query("SELECT p FROM Post p WHERE SUBSTRING(p.pincode, 1, 3) = SUBSTRING(:pincode, 1, 3) AND p.category = :category ORDER BY p.createdAt DESC")
    Page<Post> findByNearbyPincodeAndCategory(@Param("pincode") String pincode, @Param("category") PostCategory category, Pageable pageable);

    // Find popular posts (most liked)
    @Query("SELECT p FROM Post p LEFT JOIN p.likedBy l GROUP BY p ORDER BY COUNT(l) DESC")
    Page<Post> findPopularPosts(Pageable pageable);

    // Find popular posts by pincode
    @Query("SELECT p FROM Post p LEFT JOIN p.likedBy l WHERE p.pincode = :pincode GROUP BY p ORDER BY COUNT(l) DESC")
    Page<Post> findPopularPostsByPincode(@Param("pincode") String pincode, Pageable pageable);

    // Search posts by content and pincode
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query% AND p.pincode = :pincode ORDER BY p.createdAt DESC")
    Page<Post> searchPostsByContentAndPincode(@Param("query") String query, @Param("pincode") String pincode, Pageable pageable);

    // Count posts by status
    long countByStatus(PostStatus status);
}