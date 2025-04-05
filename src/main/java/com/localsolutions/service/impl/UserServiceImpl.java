package com.localsolutions.service.impl;

import com.localsolutions.model.User;
import com.localsolutions.model.UserRole;
import com.localsolutions.repository.UserRepository;
import com.localsolutions.service.UserService;
import com.localsolutions.exception.UserRegistrationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User createUser(User user) {
        logger.info("Registering new user: {}", user.getEmail());
        
        // Validate required fields
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new UserRegistrationException("Username is required");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new UserRegistrationException("Email is required");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new UserRegistrationException("Password is required");
        }
        if (user.getMobileNumber() == null || user.getMobileNumber().trim().isEmpty()) {
            throw new UserRegistrationException("Mobile number is required");
        }
        
        // Check for existing user
        if (existsByUsername(user.getUsername())) {
            logger.warn("Registration failed: Username already exists - {}", user.getUsername());
            throw new UserRegistrationException("Username already exists");
        }
        if (getUserByEmail(user.getEmail()).isPresent()) {
            logger.warn("Registration failed: Email already exists - {}", user.getEmail());
            throw new UserRegistrationException("Email already exists");
        }
        if (existsByMobileNumber(user.getMobileNumber())) {
            logger.warn("Registration failed: Mobile number already exists - {}", user.getMobileNumber());
            throw new UserRegistrationException("Mobile number already exists");
        }

        try {
            String encodedPassword = passwordEncoder.encode(user.getPassword());
            logger.debug("Password encoded successfully");
            
            user.setPassword(encodedPassword);
            user.setRole(user.getRole() == null ? UserRole.CUSTOMER : user.getRole());
            
            User savedUser = userRepository.save(user);
            logger.info("User registered successfully: {}", savedUser.getEmail());
            
            return savedUser;
        } catch (Exception e) {
            logger.error("Error during user registration: {}", e.getMessage());
            throw new UserRegistrationException("Failed to register user: " + e.getMessage());
        }
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User updateUser(User user) {
        logger.info("Updating user with ID: {}", user.getId());
        
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setFullName(user.getFullName());
        existingUser.setEmail(user.getEmail());
        existingUser.setMobileNumber(user.getMobileNumber());
        existingUser.setPincode(user.getPincode());
        existingUser.setRole(user.getRole());
        
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(user.getPassword());
            existingUser.setPassword(encodedPassword);
            logger.debug("Password updated for user: {}", existingUser.getEmail());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        logger.info("Deleting user with ID: {}", id);
        userRepository.deleteById(id);
    }

    @Override
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    @Override
    public List<User> getUsersByPincode(String pincode) {
        return userRepository.findByPincode(pincode);
    }

    @Override
    public List<User> getBusinessOwnersByCategoryAndPincode(String category, String pincode) {
        return userRepository.findByBusinessCategoryAndPincode(category, pincode);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByMobileNumber(String mobileNumber) {
        return userRepository.existsByMobileNumber(mobileNumber);
    }

    @Override
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        logger.debug("Fetching user by email: {}", email);
        return userRepository.findByEmail(email);
    }
} 