package com.localsolutions.dto;

import com.localsolutions.model.PostCategory;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.PostType;
import com.localsolutions.model.User;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class PostDTO {
    private Long id;
    private String content;
    private String imageUrl;
    private PostType type;
    private PostStatus status;
    private PostCategory category;
    private String pincode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime solutionProvidedAt;
    private String authorName;
    private Long authorId;
    private Set<UserDTO> likedBy;
    private int likeCount;
    private int commentCount;
    private boolean liked;
}