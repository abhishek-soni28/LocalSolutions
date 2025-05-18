package com.localsolutions.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.http.MediaType;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        logger.debug("Checking path: {}, method: {}", path, method);

        // Allow all requests to these endpoints without authentication
        if (path.startsWith("/actuator") ||
            path.startsWith("/api/auth") ||
            path.startsWith("/public") ||
            path.equals("/error")) {
            logger.debug("Skipping filter for path: {}", path);
            return true;
        }

        // Only allow specific GET requests to /api/posts without authentication
        if (path.startsWith("/api/posts")) {
            // Only skip filter for GET requests
            if (!"GET".equals(method)) {
                return false;
            }

            // For specific post operations that should be public
            if (path.equals("/api/posts") || // Get all posts
                path.matches("/api/posts/\\d+") || // Get post by ID
                path.matches("/api/posts/\\d+/comments") || // Get comments for a post
                path.startsWith("/api/posts/category/") || // Get posts by category
                path.startsWith("/api/posts/type/") || // Get posts by type
                path.startsWith("/api/posts/status/")) { // Get posts by status
                logger.debug("Skipping filter for public posts endpoint: {}", path);
                return true;
            }

            // All other /posts/* endpoints require authentication
            return false;
        }

        // Swagger/OpenAPI documentation
        if (path.startsWith("/api/v3/api-docs") ||
            path.startsWith("/api/swagger-ui") ||
            path.equals("/api/swagger-ui.html")) {
            logger.debug("Skipping filter for API docs: {}", path);
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null) {
                // Check if token is blacklisted
                if (tokenBlacklistService.isBlacklisted(jwt)) {
                    handleAuthenticationFailure(response, HttpServletResponse.SC_UNAUTHORIZED, "Token has been invalidated");
                    return;
                }

                String username = jwtTokenUtil.extractUsername(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtTokenUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (ExpiredJwtException e) {
            logger.error("Token expired", e);
            handleAuthenticationFailure(response, HttpServletResponse.SC_UNAUTHORIZED, "Token expired");
            return;
        } catch (JwtException e) {
            logger.error("Invalid token", e);
            handleAuthenticationFailure(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        } catch (Exception e) {
            logger.error("Error processing JWT token", e);
            handleAuthenticationFailure(response, HttpServletResponse.SC_UNAUTHORIZED, "Error processing token: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void handleAuthenticationFailure(HttpServletResponse response, int status, String message) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(String.format("{\"error\": \"%s\"}", message));
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}