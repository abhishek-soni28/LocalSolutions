package com.localsolutions.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorDetails = new HashMap<>();
        
        Object status = request.getAttribute("javax.servlet.error.status_code");
        Object message = request.getAttribute("javax.servlet.error.message");
        Object exception = request.getAttribute("javax.servlet.error.exception");
        Object path = request.getAttribute("javax.servlet.error.request_uri");

        errorDetails.put("timestamp", System.currentTimeMillis());
        errorDetails.put("status", status != null ? status : HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorDetails.put("error", HttpStatus.valueOf(status != null ? (Integer) status : 500).getReasonPhrase());
        errorDetails.put("message", message != null ? message : "An unexpected error occurred");
        errorDetails.put("path", path != null ? path : request.getRequestURI());
        
        if (exception != null && exception instanceof Exception) {
            errorDetails.put("exception", ((Exception) exception).getMessage());
        }

        return ResponseEntity
            .status(status != null ? (Integer) status : HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body(errorDetails);
    }
} 