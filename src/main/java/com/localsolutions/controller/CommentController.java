package com.localsolutions.controller;

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
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        return ResponseEntity.ok(commentService.createComment(comment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() and @commentService.getCommentById(#id).user.id == authentication.principal.id")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        return ResponseEntity.ok(commentService.updateComment(id, comment));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated() and (@commentService.getCommentById(#id).user.id == authentication.principal.id or hasRole('ADMIN'))")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<Page<Comment>> getCommentsByPostId(@PathVariable Long postId, Pageable pageable) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId, pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Comment>> getCommentsByUserId(@PathVariable Long userId, Pageable pageable) {
        return ResponseEntity.ok(commentService.getCommentsByUserId(userId, pageable));
    }
} 