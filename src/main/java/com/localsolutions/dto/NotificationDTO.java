package com.localsolutions.dto;

import com.localsolutions.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String type;
    private String content;
    private boolean read;
    private Long relatedId;
    private LocalDateTime createdAt;
    private String link;
    
    public static NotificationDTO fromNotification(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setContent(notification.getContent());
        dto.setRead(notification.isRead());
        dto.setRelatedId(notification.getRelatedId());
        dto.setCreatedAt(notification.getCreatedAt());
        
        // Generate link based on notification type
        String link = "/";
        switch (notification.getType()) {
            case "POST_LIKE":
            case "POST_COMMENT":
            case "POST_SOLUTION":
                link = "/post/" + notification.getRelatedId();
                break;
            case "FOLLOW":
                link = "/profile/" + notification.getRelatedId();
                break;
            case "MESSAGE":
                link = "/messages";
                break;
        }
        dto.setLink(link);
        
        return dto;
    }
}
