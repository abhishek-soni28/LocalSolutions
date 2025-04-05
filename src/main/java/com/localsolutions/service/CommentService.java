package com.localsolutions.service;

import com.localsolutions.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    Comment createComment(Comment comment);
    Comment getCommentById(Long id);
    Comment updateComment(Long id, Comment comment);
    void deleteComment(Long id);
    Page<Comment> getCommentsByPostId(Long postId, Pageable pageable);
    Page<Comment> getCommentsByUserId(Long userId, Pageable pageable);
} 