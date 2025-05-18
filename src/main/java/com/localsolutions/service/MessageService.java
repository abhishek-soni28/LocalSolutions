package com.localsolutions.service;

import com.localsolutions.dto.MessageDTO;
import com.localsolutions.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface MessageService {
    Message saveMessage(Message message);
    Message getMessageById(Long id);
    List<Message> getConversation(Long userId1, Long userId2);
    Page<Message> getConversationPaged(Long userId1, Long userId2, Pageable pageable);
    List<Message> getReceivedMessages(Long userId);
    List<Message> getUnreadMessages(Long userId);
    long countUnreadMessages(Long userId);
    List<Map<String, Object>> getConversationsList(Long userId);
    void markAsRead(Long messageId);
    void markConversationAsRead(Long userId, Long partnerId);
}
