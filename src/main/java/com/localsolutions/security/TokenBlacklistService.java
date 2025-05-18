package com.localsolutions.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Service to manage blacklisted JWT tokens.
 * This is used to invalidate tokens when users log out.
 */
@Service
public class TokenBlacklistService {
    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);

    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupService = Executors.newSingleThreadScheduledExecutor();

    public TokenBlacklistService() {
        // Schedule cleanup of expired tokens every hour
        cleanupService.scheduleAtFixedRate(this::cleanupExpiredTokens, 1, 1, TimeUnit.HOURS);
        logger.info("TokenBlacklistService initialized with in-memory storage");
    }

    /**
     * Add a token to the blacklist with its expiration time
     *
     * @param token The JWT token to blacklist
     * @param expiryTimeMillis The expiration time of the token in milliseconds since epoch
     */
    public void blacklistToken(String token, long expiryTimeMillis) {
        blacklistedTokens.put(token, expiryTimeMillis);
        logger.debug("Token blacklisted in memory");
    }

    /**
     * Check if a token is blacklisted
     *
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isBlacklisted(String token) {
        return blacklistedTokens.containsKey(token);
    }

    /**
     * Remove expired tokens from the blacklist
     */
    private void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        Set<String> tokensToRemove = blacklistedTokens.entrySet().stream()
                .filter(entry -> entry.getValue() < now)
                .map(Map.Entry::getKey)
                .collect(java.util.stream.Collectors.toSet());

        int count = tokensToRemove.size();
        if (count > 0) {
            tokensToRemove.forEach(blacklistedTokens::remove);
            logger.debug("Cleaned up {} expired tokens from memory", count);
        }
    }

    public void shutdown() {
        cleanupService.shutdown();
        try {
            if (!cleanupService.awaitTermination(5, TimeUnit.SECONDS)) {
                cleanupService.shutdownNow();
            }
        } catch (InterruptedException e) {
            cleanupService.shutdownNow();
            Thread.currentThread().interrupt();
        }
        logger.info("TokenBlacklistService cleanup service shut down");
    }
}
