package com.localsolutions.controller;

import com.localsolutions.dto.MessageDTO;
import com.localsolutions.model.Message;
import com.localsolutions.model.User;
import com.localsolutions.service.MessageService;
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

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> messageRequest) {
        try {
            String content = (String) messageRequest.get("content");
            Long receiverId = Long.valueOf(messageRequest.get("receiverId").toString());
            
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User sender = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the receiver
            User receiver = userService.getUserById(receiverId)
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            
            // Create and save the message
            Message message = new Message();
            message.setContent(content);
            message.setSender(sender);
            message.setReceiver(receiver);
            
            Message savedMessage = messageService.saveMessage(message);
            
            return ResponseEntity.ok(MessageDTO.fromMessage(savedMessage));
        } catch (Exception e) {
            logger.error("Error sending message: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error sending message: " + e.getMessage());
        }
    }

    @GetMapping("/conversation/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getConversation(@PathVariable Long userId, Pageable pageable) {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the conversation
            Page<Message> messages = messageService.getConversationPaged(currentUser.getId(), userId, pageable);
            
            // Mark messages as read
            messageService.markConversationAsRead(currentUser.getId(), userId);
            
            // Convert to DTOs
            Page<MessageDTO> messageDTOs = messages.map(MessageDTO::fromMessage);
            
            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            logger.error("Error fetching conversation: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching conversation: " + e.getMessage());
        }
    }

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getConversations() {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the conversations list
            List<Map<String, Object>> conversations = messageService.getConversationsList(currentUser.getId());
            
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            logger.error("Error fetching conversations: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching conversations: " + e.getMessage());
        }
    }

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUnreadCount() {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the unread count
            long unreadCount = messageService.countUnreadMessages(currentUser.getId());
            
            Map<String, Long> response = new HashMap<>();
            response.put("unreadCount", unreadCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching unread count: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching unread count: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the message
            Message message = messageService.getMessageById(id);
            
            // Check if the current user is the receiver
            if (!message.getReceiver().getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body("You are not authorized to mark this message as read");
            }
            
            // Mark as read
            messageService.markAsRead(id);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error marking message as read: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error marking message as read: " + e.getMessage());
        }
    }
}
