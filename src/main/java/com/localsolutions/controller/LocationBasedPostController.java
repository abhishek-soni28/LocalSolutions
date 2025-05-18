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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts/location")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class LocationBasedPostController {

    private static final Logger logger = LoggerFactory.getLogger(LocationBasedPostController.class);

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @GetMapping("/pincode/{pincode}")
    public ResponseEntity<Page<PostDTO>> getPostsByPincode(
            @PathVariable String pincode,
            Pageable pageable) {
        logger.info("Fetching posts by pincode: {}", pincode);
        Page<Post> posts = postService.getPostsByPincode(pincode, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/pincode/{pincode}/category/{category}")
    public ResponseEntity<Page<PostDTO>> getPostsByPincodeAndCategory(
            @PathVariable String pincode,
            @PathVariable PostCategory category,
            Pageable pageable) {
        logger.info("Fetching posts by pincode: {} and category: {}", pincode, category);
        Page<Post> posts = postService.getPostsByPincodeAndCategory(pincode, category, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/pincode/{pincode}/type/{type}")
    public ResponseEntity<Page<PostDTO>> getPostsByPincodeAndType(
            @PathVariable String pincode,
            @PathVariable PostType type,
            Pageable pageable) {
        logger.info("Fetching posts by pincode: {} and type: {}", pincode, type);
        Page<Post> posts = postService.getPostsByPincodeAndType(pincode, type, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/pincode/{pincode}/type/{type}/status/{status}")
    public ResponseEntity<Page<PostDTO>> getPostsByPincodeTypeAndStatus(
            @PathVariable String pincode,
            @PathVariable PostType type,
            @PathVariable PostStatus status,
            Pageable pageable) {
        logger.info("Fetching posts by pincode: {}, type: {}, and status: {}", pincode, type, status);
        Page<Post> posts = postService.getPostsByPincodeTypeAndStatus(pincode, type, status, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/pincode/{pincode}/type/{type}/status/{status}/category/{category}")
    public ResponseEntity<Page<PostDTO>> getPostsByPincodeTypeStatusAndCategory(
            @PathVariable String pincode,
            @PathVariable PostType type,
            @PathVariable PostStatus status,
            @PathVariable PostCategory category,
            Pageable pageable) {
        logger.info("Fetching posts by pincode: {}, type: {}, status: {}, and category: {}", pincode, type, status, category);
        Page<Post> posts = postService.getPostsByPincodeTypeStatusAndCategory(pincode, type, status, category, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/nearby/{pincode}")
    public ResponseEntity<Page<PostDTO>> getPostsByNearbyPincode(
            @PathVariable String pincode,
            Pageable pageable) {
        logger.info("Fetching posts by nearby pincode: {}", pincode);
        Page<Post> posts = postService.getPostsByNearbyPincode(pincode, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/nearby/{pincode}/category/{category}")
    public ResponseEntity<Page<PostDTO>> getPostsByNearbyPincodeAndCategory(
            @PathVariable String pincode,
            @PathVariable PostCategory category,
            Pageable pageable) {
        logger.info("Fetching posts by nearby pincode: {} and category: {}", pincode, category);
        Page<Post> posts = postService.getPostsByNearbyPincodeAndCategory(pincode, category, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/popular/{pincode}")
    public ResponseEntity<Page<PostDTO>> getPopularPostsByPincode(
            @PathVariable String pincode,
            Pageable pageable) {
        logger.info("Fetching popular posts by pincode: {}", pincode);
        Page<Post> posts = postService.getPopularPostsByPincode(pincode, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PostDTO>> searchPostsByContentAndPincode(
            @RequestParam String query,
            @RequestParam String pincode,
            Pageable pageable) {
        logger.info("Searching posts by content: {} and pincode: {}", query, pincode);
        Page<Post> posts = postService.searchPostsByContentAndPincode(query, pincode, pageable);
        Page<PostDTO> postDTOs = posts.map(this::convertToDTO);
        return ResponseEntity.ok(postDTOs);
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
