package com.localsolutions.repository;

import com.localsolutions.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Find conversation between two users
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // Find conversation between two users with pagination
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.createdAt DESC")
    Page<Message> findConversationPaged(@Param("userId1") Long userId1, @Param("userId2") Long userId2, Pageable pageable);
    
    // Find all messages received by a user
    List<Message> findByReceiverId(Long receiverId);
    
    // Find all unread messages received by a user
    List<Message> findByReceiverIdAndReadFalse(Long receiverId);
    
    // Count unread messages for a user
    long countByReceiverIdAndReadFalse(Long receiverId);
    
    // Find all conversations for a user
    @Query("SELECT DISTINCT CASE WHEN m.sender.id = :userId THEN m.receiver ELSE m.sender END FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<Object> findConversationPartners(@Param("userId") Long userId);
    
    // Find latest message for each conversation
    @Query(value = "SELECT * FROM messages m1 WHERE m1.created_at = (SELECT MAX(m2.created_at) FROM messages m2 WHERE (m2.sender_id = m1.sender_id AND m2.receiver_id = m1.receiver_id) OR (m2.sender_id = m1.receiver_id AND m2.receiver_id = m1.sender_id)) AND (m1.sender_id = :userId OR m1.receiver_id = :userId) ORDER BY m1.created_at DESC", nativeQuery = true)
    List<Message> findLatestMessagesForUser(@Param("userId") Long userId);
}
