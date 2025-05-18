package com.localsolutions.controller;

import com.localsolutions.dto.CommentDTO;
import com.localsolutions.model.Comment;
import com.localsolutions.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDTO> createComment(@RequestBody Comment comment) {
        Comment savedComment = commentService.saveComment(comment);
        return ResponseEntity.ok(CommentDTO.fromComment(savedComment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        Comment comment = commentService.getCommentById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        return ResponseEntity.ok(CommentDTO.fromComment(comment));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() and @commentService.getCommentById(#id).user.id == authentication.principal.id")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        Comment updatedComment = commentService.updateComment(id, comment);
        return ResponseEntity.ok(CommentDTO.fromComment(updatedComment));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated() and (@commentService.getCommentById(#id).user.id == authentication.principal.id or hasRole('ADMIN'))")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<Page<CommentDTO>> getCommentsByPostId(@PathVariable Long postId, Pageable pageable) {
        Page<Comment> commentPage = commentService.getCommentsByPostId(postId, pageable);
        Page<CommentDTO> dtoPage = commentPage.map(CommentDTO::fromComment);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<CommentDTO>> getCommentsByUserId(@PathVariable Long userId, Pageable pageable) {
        Page<Comment> commentPage = commentService.getCommentsByUserId(userId, pageable);
        Page<CommentDTO> dtoPage = commentPage.map(CommentDTO::fromComment);
        return ResponseEntity.ok(dtoPage);
    }
}