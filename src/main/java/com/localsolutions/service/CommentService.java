package com.localsolutions.service;

import com.localsolutions.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CommentService {
    Comment saveComment(Comment comment);
    Optional<Comment> getCommentById(Long id);
    Comment updateComment(Long id, Comment comment);
    void deleteComment(Long id);
    Page<Comment> getCommentsByPostId(Long postId, Pageable pageable);
    Page<Comment> getCommentsByUserId(Long userId, Pageable pageable);
    Page<Comment> getAllComments(Pageable pageable);

    // Get all comments for a post without pagination
    List<Comment> getCommentsByPostId(Long postId);
}