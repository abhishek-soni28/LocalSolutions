package com.localsolutions.dto;

import com.localsolutions.model.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private String content;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private boolean read;
    private LocalDateTime createdAt;
    
    public static MessageDTO fromMessage(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFullName());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getFullName());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}
