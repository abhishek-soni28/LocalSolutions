package com.localsolutions.service;

import com.localsolutions.model.User;
import com.localsolutions.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(User user);
    Optional<User> getUserByEmail(String email);
    Optional<User> getUserById(Long id);
    User updateUser(User user);
    void deleteUser(Long id);
    Optional<User> getUserByUsername(String username);
    List<User> getUsersByRole(UserRole role);
    List<User> getUsersByPincode(String pincode);
    List<User> getBusinessOwnersByCategoryAndPincode(String category, String pincode);
    boolean existsByUsername(String username);
    boolean existsByMobileNumber(String mobileNumber);
    Page<User> getAllUsers(Pageable pageable);
} 