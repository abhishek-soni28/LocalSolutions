package com.localsolutions.controller;

import com.localsolutions.service.FileUploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/post-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadPostImage(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Uploading post image: {}", file.getOriginalFilename());

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Upload file
            String fileName = fileUploadService.uploadFile(file, "posts");
            String fileUrl = fileUploadService.getFileUrl(fileName);

            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error uploading post image: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Uploading profile image: {}", file.getOriginalFilename());

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Upload file
            String fileName = fileUploadService.uploadFile(file, "profiles");
            String fileUrl = fileUploadService.getFileUrl(fileName);

            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error uploading profile image: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{fileName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        try {
            logger.info("Deleting file: {}", fileName);
            fileUploadService.deleteFile(fileName);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            logger.error("Error deleting file: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}