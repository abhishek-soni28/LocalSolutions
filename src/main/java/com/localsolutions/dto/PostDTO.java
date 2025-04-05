package com.localsolutions.dto;

import com.localsolutions.model.PostCategory;
import com.localsolutions.model.PostStatus;
import com.localsolutions.model.PostType;
import lombok.Data;
import java.time.LocalDateTime;

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
} 