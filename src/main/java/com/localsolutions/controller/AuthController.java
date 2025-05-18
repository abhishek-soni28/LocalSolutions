package com.localsolutions.controller;

import com.localsolutions.model.User;
import com.localsolutions.model.UserRole;
import com.localsolutions.security.JwtTokenUtil;
import com.localsolutions.security.TokenBlacklistService;
import com.localsolutions.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userService.getUserByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken");
        }
        User newUser = userService.createUser(user);
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            logger.debug("Login attempt with credentials: {}", loginRequest);

            String usernameOrEmail = loginRequest.get("email");
            String password = loginRequest.get("password");

            if (usernameOrEmail == null || password == null) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            // Check if the provided credential is an email or username
            Optional<User> userOpt = userService.getUserByEmail(usernameOrEmail);

            if (!userOpt.isPresent()) {
                // If not found by email, try by username
                userOpt = userService.getUserByUsername(usernameOrEmail);
                if (!userOpt.isPresent()) {
                    return ResponseEntity.badRequest().body("User not found");
                }
            }

            // Get the username for authentication
            String username = userOpt.get().getUsername();

            // Authenticate with username and password
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = jwtTokenUtil.generateToken(authentication);

            User user = userOpt.get();

            // Create response object
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("fullName", user.getFullName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);

                // Get token expiration time
                Date expiryDate = jwtTokenUtil.extractExpiration(jwt);
                long expiryTimeMillis = expiryDate.getTime();

                // Add token to blacklist
                tokenBlacklistService.blacklistToken(jwt, expiryTimeMillis);

                // Clear security context
                SecurityContextHolder.clearContext();

                return ResponseEntity.ok("Logged out successfully");
            }
            return ResponseEntity.badRequest().body("Invalid authorization header");
        } catch (Exception e) {
            logger.error("Error during logout", e);
            return ResponseEntity.status(500).body("Error during logout: " + e.getMessage());
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.existsByUsername(username));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.getUserByEmail(email).isPresent());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-mobile")
    public ResponseEntity<?> checkMobile(@RequestParam String mobileNumber) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.existsByMobileNumber(mobileNumber));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            // Get the current authenticated user's username
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.debug("Getting current user info for: {}", username);

            // Get the actual User entity from the database
            Optional<User> userOpt = userService.getUserByUsername(username);

            if (!userOpt.isPresent()) {
                return ResponseEntity.status(404).body("User not found");
            }

            User user = userOpt.get();

            // Create response object with user details (excluding sensitive information)
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());
            response.put("mobileNumber", user.getMobileNumber());
            response.put("pincode", user.getPincode());

            // Add business-specific fields if the user is a business
            if (user.getRole() == UserRole.BUSINESS_OWNER) {
                response.put("shopName", user.getShopName());
                response.put("businessCategory", user.getBusinessCategory());
                response.put("serviceArea", user.getServiceArea());
                response.put("offersOnDemandProducts", user.isOffersOnDemandProducts());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting current user", e);
            return ResponseEntity.status(500).body("Error getting user information: " + e.getMessage());
        }
    }
}