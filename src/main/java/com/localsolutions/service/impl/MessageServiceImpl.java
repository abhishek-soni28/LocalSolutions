package com.localsolutions.service.impl;

import com.localsolutions.dto.MessageDTO;
import com.localsolutions.model.Message;
import com.localsolutions.model.User;
import com.localsolutions.repository.MessageRepository;
import com.localsolutions.repository.UserRepository;
import com.localsolutions.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private static final Logger logger = LoggerFactory.getLogger(MessageServiceImpl.class);

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public Message saveMessage(Message message) {
        logger.info("Saving message from user ID: {} to user ID: {}", 
                message.getSender().getId(), message.getReceiver().getId());
        
        Message savedMessage = messageRepository.save(message);
        
        // WebSocket functionality disabled
        
        return savedMessage;
    }

    @Override
    public Message getMessageById(Long id) {
        logger.info("Fetching message with ID: {}", id);
        return messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    @Override
    public List<Message> getConversation(Long userId1, Long userId2) {
        logger.info("Fetching conversation between users: {} and {}", userId1, userId2);
        return messageRepository.findConversation(userId1, userId2);
    }

    @Override
    public Page<Message> getConversationPaged(Long userId1, Long userId2, Pageable pageable) {
        logger.info("Fetching paged conversation between users: {} and {}", userId1, userId2);
        return messageRepository.findConversationPaged(userId1, userId2, pageable);
    }

    @Override
    public List<Message> getReceivedMessages(Long userId) {
        logger.info("Fetching all messages received by user ID: {}", userId);
        return messageRepository.findByReceiverId(userId);
    }

    @Override
    public List<Message> getUnreadMessages(Long userId) {
        logger.info("Fetching unread messages for user ID: {}", userId);
        return messageRepository.findByReceiverIdAndReadFalse(userId);
    }

    @Override
    public long countUnreadMessages(Long userId) {
        logger.info("Counting unread messages for user ID: {}", userId);
        return messageRepository.countByReceiverIdAndReadFalse(userId);
    }

    @Override
    public List<Map<String, Object>> getConversationsList(Long userId) {
        logger.info("Fetching conversations list for user ID: {}", userId);
        
        List<Message> latestMessages = messageRepository.findLatestMessagesForUser(userId);
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        for (Message message : latestMessages) {
            Map<String, Object> conversation = new HashMap<>();
            
            // Determine the conversation partner
            User partner = message.getSender().getId().equals(userId) 
                    ? message.getReceiver() 
                    : message.getSender();
            
            conversation.put("partnerId", partner.getId());
            conversation.put("partnerName", partner.getFullName());
            conversation.put("lastMessage", MessageDTO.fromMessage(message));
            conversation.put("unreadCount", messageRepository.countByReceiverIdAndReadFalse(userId));
            
            conversations.add(conversation);
        }
        
        return conversations;
    }

    @Override
    public void markAsRead(Long messageId) {
        logger.info("Marking message as read: {}", messageId);
        Message message = getMessageById(messageId);
        message.setRead(true);
        messageRepository.save(message);
    }

    @Override
    public void markConversationAsRead(Long userId, Long partnerId) {
        logger.info("Marking conversation as read between users: {} and {}", userId, partnerId);
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndReadFalse(userId)
                .stream()
                .filter(message -> message.getSender().getId().equals(partnerId))
                .collect(Collectors.toList());
        
        for (Message message : unreadMessages) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }
}
