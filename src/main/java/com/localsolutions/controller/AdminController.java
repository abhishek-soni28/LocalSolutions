package com.localsolutions.controller;

import com.localsolutions.dto.PostDTO;
import com.localsolutions.dto.UserDTO;
import com.localsolutions.model.Post;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.User;
import com.localsolutions.model.UserRole;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            logger.info("Fetching admin dashboard stats");

            // Get counts
            long totalUsers = userService.countUsers();
            long totalCustomers = userService.countUsersByRole(UserRole.CUSTOMER);
            long totalBusinessOwners = userService.countUsersByRole(UserRole.BUSINESS_OWNER);
            long totalPosts = postService.countPosts();
            long totalOpenPosts = postService.countPostsByStatus(PostStatus.OPEN);
            long totalResolvedPosts = postService.countPostsByStatus(PostStatus.RESOLVED);

            // Create response
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalCustomers", totalCustomers);
            stats.put("totalBusinessOwners", totalBusinessOwners);
            stats.put("totalPosts", totalPosts);
            stats.put("totalOpenPosts", totalOpenPosts);
            stats.put("totalResolvedPosts", totalResolvedPosts);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching admin dashboard stats: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching admin dashboard stats: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserDTO>> getAllUsers(Pageable pageable) {
        try {
            logger.info("Fetching all users for admin");
            Page<User> users = userService.getAllUsers(pageable);
            Page<UserDTO> userDTOs = users.map(this::convertToUserDTO);
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            logger.error("Error fetching users for admin: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/users/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable UserRole role) {
        try {
            logger.info("Fetching users by role: {}", role);
            List<User> users = userService.getUsersByRole(role);
            List<UserDTO> userDTOs = users.stream()
                    .map(this::convertToUserDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            logger.error("Error fetching users by role: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<PostDTO>> getAllPosts(Pageable pageable) {
        try {
            logger.info("Fetching all posts for admin");
            Page<Post> posts = postService.getAllPosts(pageable);
            Page<PostDTO> postDTOs = posts.map(this::convertToPostDTO);
            return ResponseEntity.ok(postDTOs);
        } catch (Exception e) {
            logger.error("Error fetching posts for admin: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            logger.info("Updating user role for user ID: {}", id);

            String roleStr = request.get("role");
            if (roleStr == null) {
                return ResponseEntity.badRequest().body("Role is required");
            }

            UserRole role = UserRole.valueOf(roleStr);
            User user = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setRole(role);
            User updatedUser = userService.updateUser(user);

            return ResponseEntity.ok(convertToUserDTO(updatedUser));
        } catch (Exception e) {
            logger.error("Error updating user role: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error updating user role: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            logger.info("Deleting user with ID: {}", id);
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            logger.info("Deleting post with ID: {}", id);
            postService.deletePost(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting post: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }

    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setMobileNumber(user.getMobileNumber());
        dto.setPincode(user.getPincode());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getRole() == UserRole.BUSINESS_OWNER) {
            dto.setShopName(user.getShopName());
            dto.setBusinessCategory(user.getBusinessCategory());
            dto.setServiceArea(user.getServiceArea());
            dto.setOffersOnDemandProducts(user.isOffersOnDemandProducts());
        }

        return dto;
    }

    private PostDTO convertToPostDTO(Post post) {
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

        // Set author information
        dto.setAuthorId(post.getUser().getId());
        dto.setAuthorName(post.getUser().getFullName());

        // Set like count
        dto.setLikeCount(post.getLikedBy().size());

        // Set comment count
        dto.setCommentCount(post.getComments().size());

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

        return dto;
    }
}
