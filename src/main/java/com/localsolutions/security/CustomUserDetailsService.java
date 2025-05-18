package com.localsolutions.security;

import com.localsolutions.model.User;
import com.localsolutions.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
    private final UserService userService;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        logger.debug("Loading user by username or email: {}", usernameOrEmail);

        // Try to find user by username first
        User user = userService.getUserByUsername(usernameOrEmail)
                .orElseGet(() -> {
                    // If not found by username, try by email
                    logger.debug("User not found by username, trying email: {}", usernameOrEmail);
                    return userService.getUserByEmail(usernameOrEmail)
                            .orElseThrow(() -> {
                                logger.error("User not found with username or email: {}", usernameOrEmail);
                                return new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail);
                            });
                });

        logger.debug("User found: {}", user.getUsername());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}