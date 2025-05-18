package com.localsolutions.service.impl;

import com.localsolutions.model.Comment;
import com.localsolutions.repository.CommentRepository;
import com.localsolutions.service.CommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CommentServiceImpl implements CommentService {

    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImpl.class);

    @Autowired
    private CommentRepository commentRepository;

    @Override
    public Comment saveComment(Comment comment) {
        logger.info("Saving comment for post ID: {}", comment.getPost().getId());
        return commentRepository.save(comment);
    }

    @Override
    public Optional<Comment> getCommentById(Long id) {
        logger.info("Fetching comment with ID: {}", id);
        return commentRepository.findById(id);
    }

    @Override
    public Comment updateComment(Long id, Comment commentDetails) {
        logger.info("Updating comment with ID: {}", id);
        Optional<Comment> commentOpt = getCommentById(id);
        if (!commentOpt.isPresent()) {
            throw new RuntimeException("Comment not found with ID: " + id);
        }

        Comment comment = commentOpt.get();
        comment.setContent(commentDetails.getContent());
        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long id) {
        logger.info("Deleting comment with ID: {}", id);
        commentRepository.deleteById(id);
    }

    @Override
    public Page<Comment> getCommentsByPostId(Long postId, Pageable pageable) {
        logger.info("Fetching paginated comments for post ID: {}", postId);
        return commentRepository.findByPostId(postId, pageable);
    }

    @Override
    public Page<Comment> getCommentsByUserId(Long userId, Pageable pageable) {
        logger.info("Fetching paginated comments for user ID: {}", userId);
        return commentRepository.findByUserId(userId, pageable);
    }

    @Override
    public List<Comment> getCommentsByPostId(Long postId) {
        logger.info("Fetching all comments for post ID: {}", postId);
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    @Override
    public Page<Comment> getAllComments(Pageable pageable) {
        logger.info("Fetching all comments with pagination");
        return commentRepository.findAll(pageable);
    }
}